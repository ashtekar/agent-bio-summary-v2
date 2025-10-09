import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { Client } from 'langsmith';

export class LangchainIntegration {
  private client: Client | null;
  private chatModel: ChatOpenAI;
  private prompts: Map<string, PromptTemplate>;

  constructor(modelConfig?: {
    modelName?: string;
    temperature?: number;
    maxTokens?: number;
  }) {
    const apiKey = process.env.LANGCHAIN_API_KEY;
    const project = process.env.LANGCHAIN_PROJECT || 'agent-bio-summary-v2';
    const tracingEnabled = process.env.LANGCHAIN_TRACING_V2 === 'true';

    // Initialize LangSmith client for annotations and custom tracking
    if (apiKey && tracingEnabled) {
      try {
        const workspaceId = process.env.LANGSMITH_WORKSPACE_ID;
        this.client = new Client({
          apiKey,
          ...(workspaceId && { workspaceId })
        });
        console.log(`✅ LangSmith client initialized for project: ${project}`);
      } catch (error) {
        console.warn('⚠️ Failed to initialize LangSmith client:', error);
        this.client = null;
      }
    } else {
      console.warn('LangSmith tracing disabled (missing API key or LANGCHAIN_TRACING_V2=false)');
      this.client = null;
    }

    // Initialize OpenAI chat model with configurable settings
    this.chatModel = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: modelConfig?.modelName || 'gpt-4o-mini',
      temperature: modelConfig?.temperature || 0.3,
      maxTokens: modelConfig?.maxTokens || 500,
    });

    // Initialize prompts storage
    this.prompts = new Map();
    this.initializePrompts();
  }

  /**
   * Initialize all prompts used by the agent
   */
  private initializePrompts(): void {
    // Article summarization prompt
    const summarizationPrompt = new PromptTemplate({
      template: `You are an expert in synthetic biology and biotechnology. Create a comprehensive summary of this research article for college sophomores studying biology.

Article Title: {title}
Article URL: {url}
Article Content: {content}

Requirements:
- Minimum 100 words
- Focus on synthetic biology relevance
- Use clear, accessible language
- Highlight key findings and implications
- Include any practical applications mentioned
- Explain technical concepts for college sophomore level

Summary:`,
      inputVariables: ['title', 'url', 'content'],
    });

    // Summary collation prompt
    const collationPrompt = new PromptTemplate({
      template: `Create a cohesive daily synthetic biology newsletter from these individual article summaries:

{summaries}

Requirements:
- Create an engaging newsletter format suitable for email
- Use HTML formatting for email compatibility
- Include article headings with links to original sources
- Maintain coherence across all articles
- Add a call-to-action for feedback at the end
- Keep it engaging for college sophomore biology students

Newsletter HTML:`,
      inputVariables: ['summaries'],
    });

    // Article evaluation prompt
    const evaluationPrompt = new PromptTemplate({
      template: `Evaluate the quality of this article summary:

Article Title: {title}
Article URL: {url}
Summary: {summary}

Rate the following criteria on a scale of 0-1:
1. Coherence: Is the summary logically structured and easy to follow?
2. Accuracy: Does the summary accurately represent the article content?
3. Completeness: Does the summary cover the key points adequately?
4. Readability: Is the summary appropriate for college sophomore level?

Provide specific feedback and an overall score.`,
      inputVariables: ['title', 'url', 'summary'],
    });

    // Collated summary evaluation prompt
    const collatedEvaluationPrompt = new PromptTemplate({
      template: `Evaluate the quality of this collated summary:

Individual Summaries Count: {count}
Collated Summary: {summary}

Rate the following criteria on a scale of 0-1:
1. Coherence: Does the summary flow logically across all articles?
2. Accuracy: Are the individual summaries accurately represented?
3. Completeness: Are all important articles included?
4. Readability: Is it appropriate for email newsletter format?

Provide specific feedback and an overall score.`,
      inputVariables: ['count', 'summary'],
    });

    // Store prompts
    this.prompts.set('summarization', summarizationPrompt);
    this.prompts.set('collation', collationPrompt);
    this.prompts.set('evaluation', evaluationPrompt);
    this.prompts.set('collatedEvaluation', collatedEvaluationPrompt);
  }

  /**
   * Get a prompt template by name
   */
  getPrompt(name: string): PromptTemplate | undefined {
    return this.prompts.get(name);
  }

  /**
   * Generate a summary using Langchain
   */
  async generateSummary(params: {
    title: string;
    url: string;
    content: string;
  }): Promise<{ summary: string; tokens: number; cost: number; runId?: string }> {
    const prompt = this.getPrompt('summarization');
    if (!prompt) {
      throw new Error('Summarization prompt not found');
    }

    const chain = prompt.pipe(this.chatModel);
    
    try {
      // Capture run ID from callback
      let capturedRunId: string | undefined;
      const callbackHandler = {
        handleChainStart: (chain: any, inputs: any, runId: string) => {
          capturedRunId = runId;
        }
      };

      const response = await chain.invoke(params, {
        tags: ['summarization'],
        metadata: { article_title: params.title, article_url: params.url },
        callbacks: [callbackHandler]
      });

      // Handle different response formats from Langchain
      let summary: string;
      if (typeof response === 'string') {
        summary = response;
      } else if (response && typeof response === 'object') {
        if ('content' in response && response.content) {
          summary = response.content as string;
        } else if ('text' in response && response.text) {
          summary = response.text as string;
        } else {
          console.error('Unexpected response format:', response);
          throw new Error(`Unexpected response format from Langchain: ${typeof response}`);
        }
      } else {
        console.error('Unexpected response format:', response);
        throw new Error(`Unexpected response format from Langchain: ${typeof response}`);
      }

      if (!summary || typeof summary !== 'string') {
        console.error('Invalid summary content:', summary);
        throw new Error('Summary generation returned invalid content');
      }

      const tokens = this.estimateTokens(summary);
      const cost = this.calculateCost(tokens);

      return { summary, tokens, cost, runId: capturedRunId };
    } catch (error) {
      console.error('Summary generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate collated summary using Langchain
   */
  async generateCollatedSummary(summaries: string[]): Promise<{ summary: string; tokens: number; cost: number; runId?: string }> {
    const prompt = this.getPrompt('collation');
    if (!prompt) {
      throw new Error('Collation prompt not found');
    }

    const summariesText = summaries.map((s, index) => `Article ${index + 1}:\n${s}\n`).join('\n');
    
    const chain = prompt.pipe(this.chatModel);
    
    try {
      // Capture run ID from callback
      let capturedRunId: string | undefined;
      const callbackHandler = {
        handleChainStart: (chain: any, inputs: any, runId: string) => {
          capturedRunId = runId;
        }
      };

      const response = await chain.invoke(
        { summaries: summariesText },
        {
          tags: ['collation'],
          metadata: { summary_count: summaries.length },
          callbacks: [callbackHandler]
        }
      );

      const summary = response.content as string;
      const tokens = this.estimateTokens(summary);
      const cost = this.calculateCost(tokens);

      return { summary, tokens, cost, runId: capturedRunId };
    } catch (error) {
      console.error('Collated summary generation failed:', error);
      throw error;
    }
  }

  /**
   * Evaluate summary quality using LLM-as-a-judge
   */
  async evaluateSummary(params: {
    title: string;
    url: string;
    summary: string;
  }): Promise<{
    coherence: number;
    accuracy: number;
    completeness: number;
    readability: number;
    overallScore: number;
    feedback: string;
  }> {
    const prompt = this.getPrompt('evaluation');
    if (!prompt) {
      throw new Error('Evaluation prompt not found');
    }

    const evaluatorModel = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'gpt-4o-mini',
      temperature: 0.2,
      maxTokens: 300,
    });

    const chain = prompt.pipe(evaluatorModel);
    
    try {
      const response = await chain.invoke(params, {
        tags: ['evaluation', 'llm-as-judge'],
        metadata: { 
          article_title: params.title, 
          article_url: params.url,
          evaluation_type: 'individual_summary'
        },
      });

      const evaluation = response.content as string;
      
      return this.parseEvaluationResult(evaluation);
    } catch (error) {
      console.error('Summary evaluation failed:', error);
      return {
        coherence: 0.5,
        accuracy: 0.5,
        completeness: 0.5,
        readability: 0.5,
        overallScore: 0.5,
        feedback: 'Evaluation failed, using default scores'
      };
    }
  }

  /**
   * Evaluate collated summary quality
   */
  async evaluateCollatedSummary(summary: string, count: number): Promise<{
    coherence: number;
    accuracy: number;
    completeness: number;
    readability: number;
    overallScore: number;
    feedback: string;
  }> {
    const prompt = this.getPrompt('collatedEvaluation');
    if (!prompt) {
      throw new Error('Collated evaluation prompt not found');
    }

    const evaluatorModel = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'gpt-4o-mini',
      temperature: 0.2,
      maxTokens: 300,
    });

    const chain = prompt.pipe(evaluatorModel);
    
    try {
      const response = await chain.invoke(
        { summary, count },
        {
          tags: ['evaluation', 'llm-as-judge'],
          metadata: { 
            evaluation_type: 'collated_summary',
            summary_count: count
          },
        }
      );

      const evaluation = response.content as string;
      
      return this.parseEvaluationResult(evaluation);
    } catch (error) {
      console.error('Collated summary evaluation failed:', error);
      return {
        coherence: 0.5,
        accuracy: 0.5,
        completeness: 0.5,
        readability: 0.5,
        overallScore: 0.5,
        feedback: 'Evaluation failed, using default scores'
      };
    }
  }

  /**
   * Create a trace for agent execution
   * Returns the run ID for child trace linking
   */
  async createTrace(params: {
    name: string;
    inputs: any;
    outputs?: any;
    metadata?: any;
    tags?: string[];
  }): Promise<string | null> {
    if (!this.client) {
      console.log(`Creating trace: ${params.name} (client not initialized)`);
      return null;
    }

    try {
      const { randomUUID } = require('crypto');
      const runId = randomUUID();
      
      await this.client.createRun({
        id: runId,
        name: params.name,
        run_type: 'chain',
        inputs: params.inputs,
        start_time: Date.now(),
        project_name: process.env.LANGCHAIN_PROJECT || 'agent-bio-summary-v2',
        extra: params.metadata,
        tags: params.tags
      });
      
      console.log(`✅ Created parent trace: ${params.name} (ID: ${runId})`);
      return runId;
    } catch (error) {
      console.error('Failed to create trace:', error);
      return null;
    }
  }

  /**
   * Update trace with outputs and end time
   */
  async updateTrace(runId: string, outputs: any): Promise<void> {
    if (!this.client || !runId) return;

    try {
      await this.client.updateRun(runId, {
        end_time: Date.now(),
        outputs
      });
      console.log(`✅ Updated trace: ${runId}`);
    } catch (error) {
      console.error('Failed to update trace:', error);
    }
  }

  /**
   * Add annotation to a trace
   */
  async addAnnotation(params: {
    runId: string;
    annotation: {
      type: 'pass' | 'fail';
      score: number;
      feedback: string;
      evaluator: string;
      metadata?: Record<string, any>;
    };
  }): Promise<void> {
    if (!this.client) {
      console.warn('LangSmith client not initialized, skipping annotation');
      return;
    }

    try {
      await this.client.createFeedback(params.runId, params.annotation.type, {
        score: params.annotation.score,
        comment: params.annotation.feedback,
        sourceInfo: {
          evaluator: params.annotation.evaluator,
          ...params.annotation.metadata
        }
      });
      console.log(`✅ Added annotation to run: ${params.runId} (score: ${params.annotation.score})`);
    } catch (error) {
      console.error('Failed to add annotation:', error);
    }
  }

  /**
   * Get traces for analysis
   */
  async getTraces(params: {
    limit?: number;
    tags?: string[];
    startDate?: Date;
    endDate?: Date;
  }): Promise<any[]> {
    try {
      // Simplified traces for now - return empty array
      console.log('Getting traces with params:', params);
      return [];
    } catch (error) {
      console.error('Failed to get traces:', error);
      return [];
    }
  }

  /**
   * Parse evaluation result from LLM response
   */
  private parseEvaluationResult(evaluation: string): {
    coherence: number;
    accuracy: number;
    completeness: number;
    readability: number;
    overallScore: number;
    feedback: string;
  } {
    // Extract scores using regex
    const coherenceMatch = evaluation.match(/coherence[:\s]*([0-9.]+)/i);
    const accuracyMatch = evaluation.match(/accuracy[:\s]*([0-9.]+)/i);
    const completenessMatch = evaluation.match(/completeness[:\s]*([0-9.]+)/i);
    const readabilityMatch = evaluation.match(/readability[:\s]*([0-9.]+)/i);

    const coherence = parseFloat(coherenceMatch?.[1] || '0.5');
    const accuracy = parseFloat(accuracyMatch?.[1] || '0.5');
    const completeness = parseFloat(completenessMatch?.[1] || '0.5');
    const readability = parseFloat(readabilityMatch?.[1] || '0.5');

    const overallScore = (coherence + accuracy + completeness + readability) / 4;

    return {
      coherence,
      accuracy,
      completeness,
      readability,
      overallScore,
      feedback: evaluation.substring(0, 300) + (evaluation.length > 300 ? '...' : '')
    };
  }

  /**
   * Estimate token count
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4); // Rough estimation: 4 chars per token
  }

  /**
   * Calculate cost based on tokens
   */
  private calculateCost(tokens: number): number {
    const costPerToken = 0.00003; // GPT-4o-mini pricing (approximate)
    return tokens * costPerToken;
  }

  /**
   * Get LangSmith client instance
   */
  getClient(): Client | null {
    return this.client;
  }
}

// Export singleton instance
export const langchainIntegration = new LangchainIntegration();


import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { Client } from 'langsmith';
import { pull } from 'langchain/hub';

export class LangchainIntegration {
  private client: Client | null;
  private chatModel: ChatOpenAI;
  private prompts: Map<string, PromptTemplate>;
  private promptCache: Map<string, { prompt: PromptTemplate; timestamp: number }>;
  private promptCacheTTL: number;

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
        const orgId = process.env.LANGCHAIN_ORG_ID;
        this.client = new Client({
          apiKey,
          // Use org ID for hub operations, workspace ID for tracing
          ...(orgId && { workspaceId: orgId }),
          ...(!orgId && workspaceId && { workspaceId })
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
    const chatModelConfig: any = {
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: modelConfig?.modelName || 'gpt-4o-mini',
      maxTokens: modelConfig?.maxTokens || 500,
    };

    // Only set temperature if it's explicitly provided (some models like gpt-5-nano don't support it)
    if (modelConfig?.temperature !== undefined) {
      chatModelConfig.temperature = modelConfig.temperature;
    }

    this.chatModel = new ChatOpenAI(chatModelConfig);

    // Initialize prompts storage and cache
    this.prompts = new Map();
    this.promptCache = new Map();
    this.promptCacheTTL = parseInt(process.env.PROMPT_CACHE_TTL || '600') * 1000; // Convert to ms
    
    // Prompts will be loaded lazily from Hub on first use
    // No hardcoded fallback - Hub is required
  }

  /**
   * Ensure prompts are loaded from Hub
   * Called lazily on first prompt access
   */
  private async ensureHubPromptsLoaded(): Promise<void> {
    const promptSource = process.env.PROMPT_SOURCE || 'hub';
    
    // Load from hub if not already loaded
    if (this.promptCache.size === 0) {
      if (promptSource !== 'hub') {
        throw new Error('PROMPT_SOURCE must be "hub" - local prompts are no longer supported');
      }
      
      console.log('📥 Fetching prompts from LangSmith Hub...');
      const success = await this.loadPromptsFromHub();
      if (!success) {
        throw new Error('Failed to load prompts from LangSmith Hub - check LANGCHAIN_ORG_ID and connectivity');
      }
    }
  }

  /**
   * Load prompts from LangSmith Hub with caching
   */
  private async loadPromptsFromHub(): Promise<boolean> {
    const promptVersion = process.env.PROMPT_VERSION || 'latest';
    const orgId = process.env.LANGCHAIN_ORG_ID;
    
    // Map internal names (camelCase) to Hub names (kebab-case)
    const promptMapping: Record<string, string> = {
      'summarization': 'summarization',
      'collation': 'collation',
      'evaluation': 'evaluation',
      'collatedEvaluation': 'collated-evaluation',
      'orchestration': 'orchestration'
    };
    
    if (!orgId) {
      console.error('LANGCHAIN_ORG_ID not set - required for Hub prompts');
      return false;
    }
    
    try {
      for (const [internalName, hubName] of Object.entries(promptMapping)) {
        // Check cache first
        const cached = this.promptCache.get(internalName);
        if (cached && (Date.now() - cached.timestamp) < this.promptCacheTTL) {
          console.log(`  ✓ Using cached prompt: ${internalName}`);
          this.prompts.set(internalName, cached.prompt);
          continue;
        }

        // Fetch from hub using format: agent-bio-summary-v2-{prompt-name}:version
        // The org ID context is provided by LANGCHAIN_WORKSPACE_ID env var
        try {
          const hubPath = `agent-bio-summary-v2-${hubName}:${promptVersion}`;
          console.log(`  ↓ Fetching: ${hubPath}`);
          const prompt = await pull<PromptTemplate>(hubPath);
          
          // Cache and store using internal name
          this.promptCache.set(internalName, { prompt, timestamp: Date.now() });
          this.prompts.set(internalName, prompt);
          console.log(`  ✓ Loaded: ${internalName}`);
        } catch (error) {
          console.error(`  ✗ Failed to fetch ${internalName} from hub:`, error);
          throw error; // Fail fast if any prompt is missing
        }
      }
      
      console.log('✅ All prompts loaded from Hub successfully');
      return true;
    } catch (error) {
      console.error('Failed to load prompts from Hub:', error);
      return false;
    }
  }


  /**
   * Get a prompt template by name
   * Ensures hub prompts are loaded if configured
   */
  async getPrompt(name: string): Promise<PromptTemplate | undefined> {
    await this.ensureHubPromptsLoaded();
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
    const prompt = await this.getPrompt('summarization');
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
    const prompt = await this.getPrompt('collation');
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
    const prompt = await this.getPrompt('evaluation');
    if (!prompt) {
      throw new Error('Evaluation prompt not found');
    }

    const evaluatorModel = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'gpt-4o-mini',
      temperature: 0.2,
      maxTokens: 1000,
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
    const prompt = await this.getPrompt('collatedEvaluation');
    if (!prompt) {
      throw new Error('Collated evaluation prompt not found');
    }

    const evaluatorModel = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'gpt-4o-mini',
      temperature: 0.2,
      maxTokens: 1000,
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
        extra: {
          ...params.metadata,
          tags: params.tags
        }
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


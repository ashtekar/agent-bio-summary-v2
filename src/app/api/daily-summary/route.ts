import { NextRequest, NextResponse } from 'next/server';
import { LLMDrivenBioSummaryAgent } from '@/agents/LLMDrivenBioSummaryAgent';
import { LangChainBioSummaryAgent } from '@/agents/LangChainBioSummaryAgent';
import { SearchSettings, SystemSettings, EmailRecipient } from '@/types/agent';
import { settingsService } from '@/services/SettingsService';
import { threadService } from '@/services/ThreadService';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  let thread = null;
  let threadId = null;
  
  try {
    const body = await request.json();
    
    // Feature flag: Use LangChain agent or legacy OpenAI SDK agent
    const useLangChainAgent = process.env.USE_LANGCHAIN_AGENT === 'true' || body.useLangChainAgent === true;
    
    // Try to get settings from Supabase, fallback to defaults
    let context;
    try {
      const supabaseSettings = await settingsService.getAllSettings();
      context = { ...supabaseSettings, ...body };
      console.log('🔍 [API-ROUTE] Using settings from Supabase:', {
        model: context.systemSettings.llmModel,
        temperature: context.systemSettings.llmTemperature,
        maxTokens: context.systemSettings.llmMaxTokens,
        agentType: useLangChainAgent ? 'LangChain' : 'OpenAI SDK'
      });
      console.log('🔍 [API-ROUTE] Context recipients:', JSON.stringify(context.recipients, null, 2));
    } catch (error) {
      console.warn('Failed to load settings from Supabase, using defaults:', error);
      
      // Fallback to default context
      const defaultContext = {
        searchSettings: {
          query: 'synthetic biology biotechnology',
          maxResults: 10,
          dateRange: 'd7', // This will be calculated from timeWindow in SettingsService
          sources: ['nature.com', 'science.org', 'biorxiv.org'],
          timeWindow: 168 // 7 days in hours
        } as SearchSettings,
        
        systemSettings: {
          summaryLength: 100,
          targetAudience: 'college sophomore',
          includeCitations: true,
          emailTemplate: 'default',
          llmModel: 'gpt-4o',
          llmTemperature: 0.3,
          llmMaxTokens: 1000,
          relevancyThreshold: 0.2,
          maxArticlesToSummarize: 10
        } as SystemSettings,
        
        recipients: [
          {
            email: 'test@example.com',
            name: 'Test User',
            preferences: {
              frequency: 'daily',
              format: 'html'
            }
          }
        ] as EmailRecipient[]
      };
      
      context = { ...defaultContext, ...body };
    }

    // Get or create thread for this daily summary run
    const runDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    try {
      thread = await threadService.getOrCreateThread({
        run_date: runDate,
        metadata: {
          sessionId: `session_${Date.now()}`,
          model: context.systemSettings.llmModel,
          relevancyThreshold: context.systemSettings.relevancyThreshold || 0.2,
          searchQuery: context.searchSettings.query,
          maxResults: context.searchSettings.maxResults,
          sources: context.searchSettings.sources,
          recipients: context.recipients.map((r: { email: string }) => r.email)
        }
      });
      
      threadId = thread.id;
      
      // Validate threadId is a valid UUID format before using
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(threadId)) {
        console.warn(`⚠️ Invalid thread ID format: ${threadId}, generating new UUID`);
        threadId = randomUUID();
      }
      
      context.threadId = threadId;
      
      console.log(`✅ Using thread: ${threadId} for daily summary ${runDate}`);
    } catch (threadError) {
      console.warn('Failed to get or create thread, generating fallback UUID:', threadError);
      // Generate valid UUID as fallback to ensure agent always has valid threadId
      threadId = randomUUID();
      context.threadId = threadId;
      console.log(`✅ Using fallback thread: ${threadId} for daily summary ${runDate}`);
    }

    // Create and execute agent (based on feature flag)
    let result;
    if (useLangChainAgent) {
      console.log('🔄 Using LangChain AgentExecutor (Week 3 migration)');
      const agent = new LangChainBioSummaryAgent(context);
      result = await agent.execute();
    } else {
      console.log('📌 Using legacy OpenAI SDK agent');
      const agent = new LLMDrivenBioSummaryAgent(context);
      result = await agent.execute();
    }

    // Update thread with results
    if (threadId) {
      try {
        const articlesFound = result.data?.articlesFound || 0;
        const articlesProcessed = result.data?.articlesProcessed || 0;
        const emailSent = result.data?.emailSent || false;
        
        // Get LangSmith URL if available
        const orgId = process.env.LANGCHAIN_ORG_ID;
        const projectName = process.env.LANGCHAIN_PROJECT || 'agent-bio-summary-v2';
        const langsmithUrl = orgId && thread
          ? `https://smith.langchain.com/o/${orgId}/projects/p/${projectName}?timeModel=absolute&startTime=${thread.started_at.toISOString()}`
          : undefined;

        // Prefer direct run link if agent returned a parent run id
        const langsmithRunId = (result as any)?.metadata?.parentRunId;

        await threadService.completeThread(threadId, {
          status: result.success ? 'completed' : 'failed',
          email_sent: emailSent,
          langsmith_url: langsmithUrl,
          langsmith_run_id: langsmithRunId,
          articles_found: articlesFound,
          articles_processed: articlesProcessed,
          error_message: result.error
        });
        
        console.log(`✅ Thread ${threadId} marked as ${result.success ? 'completed' : 'failed'}`);
      } catch (threadError) {
        console.warn('Failed to update thread completion:', threadError);
      }
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: { ...result.data, threadId },
        message: 'Daily summary generated successfully'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        message: 'Daily summary generation failed'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('API route error:', error);
    
    // Mark thread as failed if it was created
    if (threadId) {
      try {
        await threadService.completeThread(threadId, {
          status: 'failed',
          email_sent: false,
          error_message: error instanceof Error ? error.message : 'Unknown error'
        });
      } catch (threadError) {
        console.warn('Failed to mark thread as failed:', threadError);
      }
    }
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Internal server error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Agent Bio Summary V2 API - LLM-Driven',
    endpoints: {
      'POST /api/daily-summary': 'Generate daily summary using LLM-driven agent with tool calling',
      'GET /api/daily-summary': 'API information'
    },
    status: 'operational',
    agentType: 'LLM-driven with OpenAI function calling'
  });
}


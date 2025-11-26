import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes

import { LLMDrivenBioSummaryAgent } from '@/agents/LLMDrivenBioSummaryAgent';
import { LangChainBioSummaryAgent } from '@/agents/LangChainBioSummaryAgent';
import { SearchSettings, SystemSettings, EmailRecipient } from '@/types/agent';
import { settingsService } from '@/services/SettingsService';
import { threadService } from '@/services/ThreadService';
import { authService } from '@/services/AuthService';
import { randomUUID } from 'crypto';

export async function GET(request: NextRequest) {
  let thread = null;
  let threadId = null;
  
  try {
    // 1. Security Check: Verify CRON_SECRET
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    // Check if running in Vercel environment (Vercel adds this header automatically to cron jobs)
    // For local testing, we can use the authorization header
    const isVercelCron = request.headers.get('x-vercel-cron') === '1';
    
    if (authHeader !== `Bearer ${cronSecret}` && !isVercelCron) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized: Invalid or missing CRON_SECRET'
      }, { status: 401 });
    }

    console.log('🕒 [CRON] Starting daily summary generation...');

    // 2. Get User Context (Admin)
    const adminUser = await authService.getFirstAdminUser();
    
    if (!adminUser) {
      console.error('❌ [CRON] No admin user found to run daily summary');
      return NextResponse.json({
        success: false,
        error: 'No admin user found to execute cron job'
      }, { status: 500 });
    }
    
    const userId = adminUser.id;
    console.log(`👤 [CRON] Running as admin user: ${userId}`);

    // 3. Get Settings
    // Feature flag: Use LangChain agent or legacy OpenAI SDK agent
    const useLangChainAgent = process.env.USE_LANGCHAIN_AGENT === 'true';
    
    let context;
    try {
      const supabaseSettings = await settingsService.getAllSettings(userId);
      context = { ...supabaseSettings };
      console.log('🔍 [CRON] Using settings from Supabase:', {
        model: context.systemSettings.llmModel,
        agentType: useLangChainAgent ? 'LangChain' : 'OpenAI SDK'
      });
    } catch (error) {
      console.warn('⚠️ [CRON] Failed to load settings from Supabase, using defaults:', error);
      
      // Fallback to default context
      const defaultContext = {
        searchSettings: {
          query: 'synthetic biology biotechnology',
          maxResults: 10,
          dateRange: 'd7', 
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
      
      context = { ...defaultContext };
    }

    // 4. Create Thread
    const runDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    try {
      thread = await threadService.getOrCreateThread({
        run_date: runDate,
        metadata: {
          sessionId: `cron_${Date.now()}`,
          source: 'cron_job',
          model: context.systemSettings.llmModel,
          relevancyThreshold: context.systemSettings.relevancyThreshold || 0.2,
          searchQuery: context.searchSettings.query,
          maxResults: context.searchSettings.maxResults,
          sources: context.searchSettings.sources,
          recipients: context.recipients.map((r: { email: string }) => r.email)
        }
      }, userId);
      
      threadId = thread.id;
      context.threadId = threadId;
      context.userId = userId;
      
      console.log(`✅ [CRON] Using thread: ${threadId} for daily summary ${runDate}`);
    } catch (threadError) {
      console.error('❌ [CRON] Failed to get or create thread:', threadError);
      // Attempt fallback creation with random UUID to allow process to continue
      // Note: This might fail FK constraints if user_id is invalid, but we verified user_id above
      threadId = randomUUID();
      context.threadId = threadId;
      context.userId = userId;
      console.warn(`⚠️ [CRON] Using ephemeral thread ID: ${threadId}`);
    }

    // 5. Execute Agent
    let result;
    if (useLangChainAgent) {
      console.log('🔄 [CRON] Executing LangChain Agent...');
      const agent = new LangChainBioSummaryAgent(context);
      result = await agent.execute();
    } else {
      console.log('📌 [CRON] Executing Legacy OpenAI SDK Agent...');
      const agent = new LLMDrivenBioSummaryAgent(context);
      result = await agent.execute();
    }

    // 6. Update Thread Completion
    if (threadId && thread) {
      try {
        const articlesFound = result.data?.articlesFound || 0;
        const articlesProcessed = result.data?.articlesProcessed || 0;
        const emailSent = result.data?.emailSent || false;
        
        // Get LangSmith URL if available
        const orgId = process.env.LANGCHAIN_ORG_ID;
        const projectName = process.env.LANGCHAIN_PROJECT || 'agent-bio-summary-v2';
        const langsmithUrl = orgId && thread.started_at
          ? `https://smith.langchain.com/o/${orgId}/projects/p/${projectName}?timeModel=absolute&startTime=${thread.started_at.toISOString()}`
          : undefined;

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
        
        console.log(`✅ [CRON] Thread ${threadId} marked as ${result.success ? 'completed' : 'failed'}`);
      } catch (threadError) {
        console.warn('⚠️ [CRON] Failed to update thread completion:', threadError);
      }
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: { ...result.data, threadId },
        message: 'Daily summary generated successfully via Cron'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        message: 'Daily summary generation failed via Cron'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ [CRON] API route error:', error);
    
    // Mark thread as failed if it was created
    if (threadId) {
      try {
        await threadService.completeThread(threadId, {
          status: 'failed',
          email_sent: false,
          error_message: error instanceof Error ? error.message : 'Unknown error'
        });
      } catch (threadError) {
        console.warn('⚠️ [CRON] Failed to mark thread as failed:', threadError);
      }
    }
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Internal server error'
    }, { status: 500 });
  }
}


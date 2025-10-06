import { NextRequest, NextResponse } from 'next/server';
import { LLMDrivenBioSummaryAgent } from '@/agents/LLMDrivenBioSummaryAgent';
import { SearchSettings, SystemSettings, EmailRecipient } from '@/types/agent';
import { settingsService } from '@/services/SettingsService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Try to get settings from Supabase, fallback to defaults
    let context;
    try {
      const supabaseSettings = await settingsService.getAllSettings();
      context = { ...supabaseSettings, ...body };
      console.log('Using settings from Supabase:', {
        model: context.systemSettings.llmModel,
        temperature: context.systemSettings.llmTemperature,
        maxTokens: context.systemSettings.llmMaxTokens
      });
    } catch (error) {
      console.warn('Failed to load settings from Supabase, using defaults:', error);
      
      // Fallback to default context
      const defaultContext = {
        searchSettings: {
          query: 'synthetic biology biotechnology',
          maxResults: 10,
          dateRange: 'd7', // Last 7 days
          sources: ['nature.com', 'science.org', 'biorxiv.org']
        } as SearchSettings,
        
        systemSettings: {
          summaryLength: 100,
          targetAudience: 'college sophomore',
          includeCitations: true,
          emailTemplate: 'default',
          llmModel: 'gpt-4o',
          llmTemperature: 0.3,
          llmMaxTokens: 1000
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

    // Create and execute LLM-driven agent
    const agent = new LLMDrivenBioSummaryAgent(context);
    const result = await agent.execute();

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
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


import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  // Check environment variables (without exposing sensitive data)
  const envCheck = {
    hasOpenAIKey: !!process.env.OPENAI_API_KEY,
    openAIKeyLength: process.env.OPENAI_API_KEY?.length || 0,
    openAIKeyPrefix: process.env.OPENAI_API_KEY?.substring(0, 10) + '...',
    hasGoogleKey: !!process.env.GOOGLE_CUSTOM_SEARCH_API_KEY,
    hasResendKey: !!process.env.RESEND_API_KEY,
    hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    hasLangchainKey: !!process.env.LANGCHAIN_API_KEY,
    nodeEnv: process.env.NODE_ENV,
    logLevel: process.env.LOG_LEVEL,
    vercelDebug: process.env.VERCEL_DEBUG,
    nextDebug: process.env.NEXT_DEBUG,
  };

  return NextResponse.json({
    message: 'Environment Variables Debug',
    environment: envCheck,
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Test OpenAI API key directly
    const openai = require('openai');
    const client = new openai.OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Try to list models to test the API key
    const models = await client.models.list();
    
    return NextResponse.json({
      success: true,
      message: 'OpenAI API key test successful',
      modelsCount: models.data.length,
      environment: {
        hasOpenAIKey: !!process.env.OPENAI_API_KEY,
        openAIKeyLength: process.env.OPENAI_API_KEY?.length || 0,
        openAIKeyPrefix: process.env.OPENAI_API_KEY?.substring(0, 10) + '...',
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      environment: {
        hasOpenAIKey: !!process.env.OPENAI_API_KEY,
        openAIKeyLength: process.env.OPENAI_API_KEY?.length || 0,
        openAIKeyPrefix: process.env.OPENAI_API_KEY?.substring(0, 10) + '...',
      }
    }, { status: 500 });
  }
}

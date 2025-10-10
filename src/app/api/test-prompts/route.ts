import { NextResponse } from 'next/server';
import { langchainIntegration } from '@/lib/langchain';

/**
 * Test endpoint to verify prompt source (Hub vs Local)
 */
export async function GET() {
  try {
    const promptSource = process.env.PROMPT_SOURCE || 'local';
    const promptVersion = process.env.PROMPT_VERSION || 'latest';
    const orgId = process.env.LANGCHAIN_ORG_ID;
    
    console.log('\n========================================');
    console.log('🧪 TESTING PROMPT HUB INTEGRATION');
    console.log('========================================');
    console.log(`📍 PROMPT_SOURCE: ${promptSource}`);
    console.log(`📍 PROMPT_VERSION: ${promptVersion}`);
    console.log(`📍 LANGCHAIN_ORG_ID: ${orgId || 'NOT SET'}`);
    console.log('');
    
    // Try to get a prompt - this will trigger Hub loading if configured
    const testPrompt = await langchainIntegration.getPrompt('summarization');
    
    if (testPrompt) {
      console.log('✅ Prompt loaded successfully!');
      console.log(`   Prompt type: ${testPrompt.constructor.name}`);
      console.log('========================================\n');
      
      return NextResponse.json({
        success: true,
        promptSource: promptSource,
        promptVersion: promptVersion,
        orgId: orgId || null,
        promptLoaded: true,
        promptType: testPrompt.constructor.name,
        message: promptSource === 'hub' 
          ? '✅ Prompts are being loaded from LangSmith Hub!' 
          : '📄 Using local hardcoded prompts (Hub not enabled)'
      });
    } else {
      console.log('❌ Failed to load prompt');
      console.log('========================================\n');
      
      return NextResponse.json({
        success: false,
        error: 'Failed to load prompt',
        promptSource: promptSource
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}


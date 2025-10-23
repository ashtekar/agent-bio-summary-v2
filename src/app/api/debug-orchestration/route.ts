import { NextResponse } from 'next/server';
import { langchainIntegration } from '@/lib/langchain';

/**
 * Debug endpoint to check orchestration prompt content
 */
export async function GET() {
  try {
    console.log('\n========================================');
    console.log('🔍 DEBUGGING ORCHESTRATION PROMPT');
    console.log('========================================');
    
    // Try to get the orchestration prompt
    const orchestrationPrompt = await langchainIntegration.getPrompt('orchestration');
    
    if (orchestrationPrompt) {
      console.log('✅ Orchestration prompt loaded from Hub');
      console.log('Prompt content preview:');
      console.log('---');
      
      // Safely get template content
      const templateContent = typeof orchestrationPrompt.template === 'string' 
        ? orchestrationPrompt.template 
        : JSON.stringify(orchestrationPrompt.template);
      
      console.log(templateContent.substring(0, 500) + '...');
      console.log('---');
      
      // Check for the problematic instruction
      const hasOldInstruction = templateContent.includes('MAX 2 articles per call');
      const hasNewInstruction = templateContent.includes('call this tool ONCE');
      
      return NextResponse.json({
        success: true,
        promptLoaded: true,
        promptLength: templateContent.length,
        hasOldInstruction: hasOldInstruction,
        hasNewInstruction: hasNewInstruction,
        contentPreview: templateContent.substring(0, 300),
        message: hasOldInstruction 
          ? '❌ Still contains old instruction: "MAX 2 articles per call"'
          : hasNewInstruction
          ? '✅ Contains new instruction: "call this tool ONCE"'
          : '⚠️ Neither old nor new instruction found'
      });
    } else {
      console.log('❌ Failed to load orchestration prompt');
      
      return NextResponse.json({
        success: false,
        error: 'Failed to load orchestration prompt from Hub'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Debug failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

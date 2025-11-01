import { NextRequest, NextResponse } from 'next/server';
import { evaluationService } from '@/services/EvaluationService';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

/**
 * GET /api/evaluations/next - Get next ungraded summary for a grader
 * Query params:
 *   - graderEmail: Required, email of the grader
 *   - threadId: Optional, limit to a specific thread
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const graderEmail = searchParams.get('graderEmail');
    const threadId = searchParams.get('threadId') || undefined;

    if (!graderEmail) {
      return NextResponse.json({
        success: false,
        error: 'graderEmail is required'
      }, { status: 400 });
    }

    const nextSummaryId = await evaluationService.getNextUngradedSummary(
      graderEmail,
      threadId
    );

    if (!nextSummaryId) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'No more ungraded summaries available'
      });
    }

    // Get the summary details
    const { summaryStorageService } = await import('@/services/SummaryStorageService');
    
    // We need to get the summary from article_summaries
    // First, get all article summaries to find which one matches
    // For now, we'll return the summaryId and let the frontend fetch the summary
    return NextResponse.json({
      success: true,
      data: {
        summaryId: nextSummaryId
      }
    });

  } catch (error) {
    console.error('Failed to get next ungraded summary:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get next ungraded summary'
    }, { status: 500 });
  }
}

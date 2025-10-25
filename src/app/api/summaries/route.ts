import { NextRequest, NextResponse } from 'next/server';
import { summaryStorageService } from '@/services/SummaryStorageService';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

/**
 * GET /api/summaries - Get summaries for a specific thread or recent summaries
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const threadId = searchParams.get('threadId');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (threadId) {
      // Get summaries for specific thread
      const [dailySummary, articleSummaries] = await Promise.all([
        summaryStorageService.getDailySummary(threadId),
        summaryStorageService.getArticleSummariesByThread(threadId)
      ]);

      return NextResponse.json({
        success: true,
        data: {
          dailySummary,
          articleSummaries
        }
      });
    } else {
      // Get recent daily summaries
      const recentSummaries = await summaryStorageService.getRecentDailySummaries(limit);

      return NextResponse.json({
        success: true,
        data: recentSummaries,
        count: recentSummaries.length
      });
    }

  } catch (error) {
    console.error('Failed to fetch summaries:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch summaries'
    }, { status: 500 });
  }
}

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

      // Build LangSmith URL on server side
      let langsmithUrl = undefined;
      if (dailySummary?.langsmith_run_id) {
        const orgId = process.env.LANGCHAIN_ORG_ID;
        const projectName = process.env.LANGCHAIN_PROJECT || 'agent-bio-summary-v2';
        
        if (orgId && projectName) {
          langsmithUrl = `https://smith.langchain.com/o/${orgId}/projects/p/${projectName}/r/${dailySummary.langsmith_run_id}`;
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          dailySummary: dailySummary ? {
            ...dailySummary,
            langsmith_url: langsmithUrl
          } : null,
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

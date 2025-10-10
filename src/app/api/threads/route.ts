import { NextRequest, NextResponse } from 'next/server';
import { threadService } from '@/services/ThreadService';

/**
 * GET /api/threads - Get thread history
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const runDate = searchParams.get('run_date');

    // Get specific thread by date
    if (runDate) {
      const thread = await threadService.getThreadByDate(runDate);
      
      if (!thread) {
        return NextResponse.json({
          success: false,
          error: 'Thread not found for the specified date'
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: thread
      });
    }

    // Get recent threads
    const threads = await threadService.getRecentThreads(limit);

    return NextResponse.json({
      success: true,
      data: threads,
      count: threads.length
    });

  } catch (error) {
    console.error('Failed to fetch threads:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch threads'
    }, { status: 500 });
  }
}

// Note: To get a specific thread by ID, create a dynamic route at:
// src/app/api/threads/[id]/route.ts
// For now, use query params: /api/threads?run_date=YYYY-MM-DD

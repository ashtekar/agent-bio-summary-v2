import { NextRequest, NextResponse } from 'next/server';
import { summaryStorageService } from '@/services/SummaryStorageService';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

/**
 * GET /api/summaries/[id] - Get a single article summary by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const summaryId = params.id;

    if (!summaryId) {
      return NextResponse.json({
        success: false,
        error: 'Summary ID is required'
      }, { status: 400 });
    }

    // We need to query article_summaries table directly
    // Since summaryStorageService doesn't have a getById method, we'll need to add it
    // For now, we'll use Supabase directly here
    
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: 'Supabase not configured'
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('article_summaries')
      .select(`
        id,
        article_id,
        thread_id,
        summary,
        model_used,
        langsmith_run_id,
        created_at,
        articles:article_id (
          id,
          title,
          url,
          source
        ),
        threads:thread_id (
          id,
          run_date
        )
      `)
      .eq('id', summaryId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch summary: ${error.message}`);
    }

    if (!data) {
      return NextResponse.json({
        success: false,
        error: 'Summary not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        summary: data.summary,
        article_id: data.article_id,
        thread_id: data.thread_id,
        model_used: data.model_used,
        created_at: data.created_at,
        article: data.articles ? {
          title: data.articles.title,
          url: data.articles.url,
          source: data.articles.source
        } : null,
        thread: data.threads ? {
          run_date: data.threads.run_date
        } : null
      }
    });

  } catch (error) {
    console.error('Failed to fetch summary:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch summary'
    }, { status: 500 });
  }
}

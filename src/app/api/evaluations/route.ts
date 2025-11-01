import { NextRequest, NextResponse } from 'next/server';
import { evaluationService } from '@/services/EvaluationService';
import { summaryStorageService } from '@/services/SummaryStorageService';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

/**
 * POST /api/evaluations - Save a new evaluation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      summaryId,
      graderEmail,
      graderName,
      simpleTerminology,
      clearConcept,
      clearMethodology,
      balancedDetails,
      feedback
    } = body;

    // Validation
    if (!summaryId || !graderEmail) {
      return NextResponse.json({
        success: false,
        error: 'summaryId and graderEmail are required'
      }, { status: 400 });
    }

    // Validate scores are between 1-10
    const scores = [
      { name: 'simpleTerminology', value: simpleTerminology },
      { name: 'clearConcept', value: clearConcept },
      { name: 'clearMethodology', value: clearMethodology },
      { name: 'balancedDetails', value: balancedDetails }
    ];

    for (const score of scores) {
      if (typeof score.value !== 'number' || score.value < 1 || score.value > 10) {
        return NextResponse.json({
          success: false,
          error: `${score.name} must be a number between 1 and 10`
        }, { status: 400 });
      }
    }

    // Validate feedback length (max 50 words)
    if (feedback && typeof feedback === 'string') {
      const wordCount = feedback.trim().split(/\s+/).filter(word => word.length > 0).length;
      if (wordCount > 50) {
        return NextResponse.json({
          success: false,
          error: 'Feedback must be 50 words or less'
        }, { status: 400 });
      }
    }

    const evaluation = await evaluationService.saveEvaluation({
      summaryId,
      graderEmail,
      graderName,
      simpleTerminology,
      clearConcept,
      clearMethodology,
      balancedDetails,
      feedback
    });

    return NextResponse.json({
      success: true,
      data: evaluation
    });

  } catch (error) {
    console.error('Failed to save evaluation:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save evaluation'
    }, { status: 500 });
  }
}

/**
 * GET /api/evaluations - Get evaluations
 * Query params:
 *   - summaryId: Get evaluations for a specific summary
 *   - graderEmail: Get evaluations by a specific grader
 *   - limit: Limit results (default: 100)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const summaryId = searchParams.get('summaryId');
    const graderEmail = searchParams.get('graderEmail');
    const limit = parseInt(searchParams.get('limit') || '100');

    let evaluations;

    if (summaryId) {
      evaluations = await evaluationService.getEvaluationsBySummary(summaryId);
    } else if (graderEmail) {
      evaluations = await evaluationService.getEvaluationsByGrader(graderEmail);
    } else {
      evaluations = await evaluationService.getAllEvaluations(limit);
    }

    return NextResponse.json({
      success: true,
      data: evaluations,
      count: evaluations.length
    });

  } catch (error) {
    console.error('Failed to fetch evaluations:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch evaluations'
    }, { status: 500 });
  }
}

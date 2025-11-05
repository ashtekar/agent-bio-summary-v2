'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/hooks/useAuth';

interface Summary {
  id: string;
  summary: string;
  article: {
    title: string;
    url: string;
    source: string;
  } | null;
  thread: {
    run_date: string;
  } | null;
}

interface GradingCriteria {
  simpleTerminology: number;
  clearConcept: number;
  clearMethodology: number;
  balancedDetails: number;
}

export default function GradingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [graderEmail, setGraderEmail] = useState('');
  const [graderName, setGraderName] = useState('');
  const [criteria, setCriteria] = useState<GradingCriteria>({
    simpleTerminology: 5,
    clearConcept: 5,
    clearMethodology: 5,
    balancedDetails: 5
  });
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [noMoreSummaries, setNoMoreSummaries] = useState(false);
  const lastLoadedParams = useRef<{ summaryId: string | null; email: string }>({ summaryId: null, email: '' });

  // Extract primitive values from searchParams and user to avoid unnecessary re-renders
  const summaryId = searchParams.get('summaryId');
  const emailParam = searchParams.get('email');
  const nameParam = searchParams.get('name');
  const userEmail = user?.email || '';
  const userName = user?.name || '';

  // Determine the final email and summaryId to use
  const finalEmail = emailParam || userEmail || '';
  const finalSummaryId = summaryId;

  useEffect(() => {
    // Use email from query params, or fall back to authenticated user's email
    const email = finalEmail;
    // Use name from query params, or fall back to authenticated user's name
    const name = nameParam || userName || '';

    // Always update grader email and name when they change
    setGraderEmail(email);
    setGraderName(name);

    // Only proceed with loading if we have either a summaryId or an email
    if (!finalSummaryId && !email) {
      setError('Please provide either summaryId or email parameter');
      setLoading(false);
      return;
    }

    // Check if we've already loaded with these exact parameters
    if (
      lastLoadedParams.current.summaryId === finalSummaryId &&
      lastLoadedParams.current.email === email
    ) {
      return; // Already loaded with these parameters, skip reloading
    }

    // Update last loaded params before loading to prevent race conditions
    lastLoadedParams.current = { summaryId: finalSummaryId, email };

    if (finalSummaryId) {
      loadSummary(finalSummaryId);
    } else {
      loadNextSummary(email);
    }
  }, [finalSummaryId, finalEmail, nameParam, userName]);

  async function loadSummary(summaryId: string) {
    try {
      setLoading(true);
      const response = await fetch(`/api/summaries/${summaryId}`);
      
      if (response.ok) {
        const result = await response.json();
        setSummary(result.data);
      } else {
        setError('Failed to load summary');
      }
    } catch (error) {
      console.error('Error loading summary:', error);
      setError('Error loading summary');
    } finally {
      setLoading(false);
    }
  }

  async function loadNextSummary(email: string) {
    try {
      setLoading(true);
      const response = await fetch(`/api/evaluations/next?graderEmail=${encodeURIComponent(email)}`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.data?.summaryId) {
          await loadSummary(result.data.summaryId);
        } else {
          setNoMoreSummaries(true);
        }
      } else {
        setError('Failed to load next summary');
      }
    } catch (error) {
      console.error('Error loading next summary:', error);
      setError('Error loading next summary');
    } finally {
      setLoading(false);
    }
  }

  async function submitEvaluation() {
    if (!summary || !graderEmail) {
      setError('Missing required information');
      return;
    }

    // Validate scores
    const scores = Object.values(criteria);
    if (scores.some(score => score < 1 || score > 10)) {
      setError('All scores must be between 1 and 10');
      return;
    }

    // Validate feedback word count
    if (feedback) {
      const wordCount = feedback.trim().split(/\s+/).filter(word => word.length > 0).length;
      if (wordCount > 50) {
        setError('Feedback must be 50 words or less');
        return;
      }
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summaryId: summary.id,
          graderEmail,
          graderName: graderName || undefined,
          ...criteria,
          feedback: feedback.trim() || undefined
        })
      });

      if (response.ok) {
        // Reset form
        setCriteria({
          simpleTerminology: 5,
          clearConcept: 5,
          clearMethodology: 5,
          balancedDetails: 5
        });
        setFeedback('');

        // Auto-advance to next summary
        if (graderEmail) {
          await loadNextSummary(graderEmail);
        } else {
          // No email, just show success
          setError('');
          alert('Evaluation submitted successfully!');
        }
      } else {
        const result = await response.json();
        setError(result.error || 'Failed to submit evaluation');
      }
    } catch (error) {
      console.error('Error submitting evaluation:', error);
      setError('Error submitting evaluation');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Header />
        <Navigation />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center text-slate-400">Loading summary...</div>
        </main>
      </div>
    );
  }

  if (noMoreSummaries) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Header />
        <Navigation />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-slate-800 rounded-lg p-8 text-center border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-4">All Done!</h2>
            <p className="text-slate-400 mb-6">
              You've evaluated all available summaries. Thank you for your feedback!
            </p>
            <a
              href="/evaluations"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              View All Evaluations
            </a>
          </div>
        </main>
      </div>
    );
  }

  if (error && !summary) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Header />
        <Navigation />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-6 text-red-400">
            {error}
          </div>
        </main>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Rubric */}
        <div className="bg-slate-800 rounded-lg p-6 mb-6 border border-slate-700">
          <h2 className="text-xl font-bold text-white mb-4">📋 Grading Rubric</h2>
          <div className="space-y-2 text-sm text-slate-300">
            <p><strong className="text-white">1. Simple terminology:</strong> Does the summary have terminology that might be hard to understand?</p>
            <p><strong className="text-white">2. Clear concept explanation:</strong> Does the summary explain the concept behind the article such that it's easy to understand?</p>
            <p><strong className="text-white">3. Clear explanation of methodology:</strong> Does the summary explain the novel methods, practices and approaches used to come up with findings or conclusions?</p>
            <p><strong className="text-white">4. Balanced details:</strong> Does the summary have enough & balanced details about the concept, methods, findings, conclusions and impact to engage?</p>
            <p className="mt-3 text-slate-400">Rate each criterion on a scale of 1-10 (1 = poor, 10 = excellent)</p>
          </div>
        </div>

        {/* Article Info */}
        {summary.article && (
          <div className="bg-slate-800 rounded-lg p-4 mb-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-2">{summary.article.title}</h3>
            {summary.article.source && (
              <p className="text-slate-400 text-sm mb-2">Source: {summary.article.source}</p>
            )}
            {summary.article.url && (
              <a
                href={summary.article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                Read full article
              </a>
            )}
          </div>
        )}

        {/* Summary Content */}
        <div className="bg-slate-800 rounded-lg p-6 mb-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Summary</h3>
          <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
            {summary.summary}
          </div>
        </div>

        {/* Grading Form */}
        <div className="bg-slate-800 rounded-lg p-6 mb-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Your Evaluation</h3>

          {/* Criteria Sliders */}
          <div className="space-y-6">
            {[
              { key: 'simpleTerminology' as const, label: '1. Simple Terminology', description: 'Easy to understand terminology' },
              { key: 'clearConcept' as const, label: '2. Clear Concept Explanation', description: 'Explains concept clearly' },
              { key: 'clearMethodology' as const, label: '3. Clear Explanation of Methodology', description: 'Explains methods and approaches' },
              { key: 'balancedDetails' as const, label: '4. Balanced Details', description: 'Balanced details on concept, methods, findings, impact' }
            ].map(({ key, label, description }) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <label className="text-white font-medium">{label}</label>
                    <p className="text-slate-400 text-sm">{description}</p>
                  </div>
                  <span className="text-blue-400 font-semibold text-lg min-w-[3rem] text-right">
                    {criteria[key]}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={criteria[key]}
                  onChange={(e) => setCriteria(prev => ({ ...prev, [key]: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  style={{
                    background: `linear-gradient(to right, #2563eb 0%, #2563eb ${(criteria[key] - 1) * 11.11}%, #475569 ${(criteria[key] - 1) * 11.11}%, #475569 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>1 (Poor)</span>
                  <span>10 (Excellent)</span>
                </div>
              </div>
            ))}
          </div>

          {/* Optional Feedback */}
          <div className="mt-6">
            <label className="block text-white font-medium mb-2">
              Optional Feedback (max 50 words)
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share any additional thoughts about this summary..."
              className="w-full bg-slate-700 text-white rounded-lg p-3 border border-slate-600 focus:outline-none focus:border-blue-500 resize-none"
              rows={3}
              maxLength={300}
            />
            <div className="flex justify-between mt-1">
              <span className="text-slate-400 text-sm">
                {feedback.trim().split(/\s+/).filter(word => word.length > 0).length} / 50 words
              </span>
              {feedback.trim().split(/\s+/).filter(word => word.length > 0).length > 50 && (
                <span className="text-red-400 text-sm">⚠️ Please limit to 50 words</span>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 bg-red-900/20 border border-red-700 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={submitEvaluation}
            disabled={submitting}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit Evaluation & Next'}
          </button>
        </div>
      </main>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import Card from '@/components/Card';
import { AuthGuard } from '@/components/AuthGuard';

interface Evaluation {
  id: string;
  summary_id: string;
  grader_email: string;
  grader_name?: string;
  simple_terminology: number;
  clear_concept: number;
  clear_methodology: number;
  balanced_details: number;
  feedback?: string;
  created_at: string;
  summary?: string;
  article_title?: string;
  article_url?: string;
}

export default function EvaluationsPage() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSummary, setSelectedSummary] = useState<Evaluation | null>(null);

  useEffect(() => {
    loadEvaluations();
  }, []);

  async function loadEvaluations() {
    try {
      const response = await fetch('/api/evaluations?limit=100');
      
      if (response.ok) {
        const result = await response.json();
        setEvaluations(result.data || []);
      } else {
        console.error('Failed to load evaluations');
      }
    } catch (error) {
      console.error('Error loading evaluations:', error);
    } finally {
      setLoading(false);
    }
  }

  function formatScore(score: number): string {
    // Convert from 0-1 back to 1-10 for display
    return (score * 10).toFixed(1);
  }

  async function openSummaryModal(evaluation: Evaluation) {
    // Fetch full summary details if not already loaded
    if (!evaluation.summary) {
      try {
        const response = await fetch(`/api/summaries/${evaluation.summary_id}`);
        if (response.ok) {
          const result = await response.json();
          if (result.data) {
            setSelectedSummary({
              ...evaluation,
              summary: result.data.summary,
              article_title: result.data.article?.title,
              article_url: result.data.article?.url
            });
            return;
          }
        }
      } catch (error) {
        console.error('Error fetching summary details:', error);
      }
    }
    setSelectedSummary(evaluation);
  }

  function closeSummaryModal() {
    setSelectedSummary(null);
  }

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-slate-900">
          <Header />
          <Navigation />
          <main className="max-w-7xl mx-auto px-6 py-8">
            <div className="text-center text-slate-400">Loading evaluations...</div>
          </main>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-900">
        <Header />
        <Navigation />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Card>
          <h2 className="text-2xl font-bold text-white mb-6">Summary Evaluations</h2>

          {evaluations.length === 0 ? (
            <div className="text-center text-slate-400 py-12">
              No evaluations found. Start grading summaries to see them here.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold text-sm">Grader</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold text-sm">Simple Terminology</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold text-sm">Clear Concept</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold text-sm">Clear Methodology</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold text-sm">Balanced Details</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold text-sm">Summary ID</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold text-sm">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {evaluations.map((evaluation) => (
                    <tr
                      key={evaluation.id}
                      className="border-b border-slate-700 hover:bg-slate-800 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="text-white">
                          {evaluation.grader_name || evaluation.grader_email}
                        </div>
                        {evaluation.grader_name && (
                          <div className="text-slate-400 text-xs">{evaluation.grader_email}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-300">{formatScore(evaluation.simple_terminology)}</td>
                      <td className="py-3 px-4 text-slate-300">{formatScore(evaluation.clear_concept)}</td>
                      <td className="py-3 px-4 text-slate-300">{formatScore(evaluation.clear_methodology)}</td>
                      <td className="py-3 px-4 text-slate-300">{formatScore(evaluation.balanced_details)}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => openSummaryModal(evaluation)}
                          className="text-blue-400 hover:text-blue-300 text-sm font-medium underline"
                        >
                          {evaluation.summary_id.substring(0, 8)}...
                        </button>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-sm">
                        {new Date(evaluation.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </main>

      {/* Summary Modal */}
      {selectedSummary && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={closeSummaryModal}
        >
          <div
            className="bg-slate-800 rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-white">Summary Details</h3>
              <button
                onClick={closeSummaryModal}
                className="text-slate-400 hover:text-white text-2xl leading-none w-8 h-8 flex items-center justify-center"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            {selectedSummary.article_title && (
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-white mb-2">{selectedSummary.article_title}</h4>
                {selectedSummary.article_url && (
                  <a
                    href={selectedSummary.article_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    Read full article
                  </a>
                )}
              </div>
            )}

            <div className="mb-4">
              <h4 className="text-sm font-semibold text-slate-300 mb-2">Evaluation Scores</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Simple Terminology:</span>
                  <span className="text-white ml-2 font-medium">{formatScore(selectedSummary.simple_terminology)}</span>
                </div>
                <div>
                  <span className="text-slate-400">Clear Concept:</span>
                  <span className="text-white ml-2 font-medium">{formatScore(selectedSummary.clear_concept)}</span>
                </div>
                <div>
                  <span className="text-slate-400">Clear Methodology:</span>
                  <span className="text-white ml-2 font-medium">{formatScore(selectedSummary.clear_methodology)}</span>
                </div>
                <div>
                  <span className="text-slate-400">Balanced Details:</span>
                  <span className="text-white ml-2 font-medium">{formatScore(selectedSummary.balanced_details)}</span>
                </div>
              </div>
            </div>

            {selectedSummary.feedback && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-slate-300 mb-2">Feedback</h4>
                <p className="text-slate-300 text-sm">{selectedSummary.feedback}</p>
              </div>
            )}

            <div className="mb-4">
              <h4 className="text-sm font-semibold text-slate-300 mb-2">Summary</h4>
              <div className="bg-slate-900 rounded p-4 text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                {selectedSummary.summary || 'Summary not available'}
              </div>
            </div>

            <div className="text-xs text-slate-400">
              <div>Summary ID: {selectedSummary.summary_id}</div>
              <div>Grader: {selectedSummary.grader_email}</div>
              <div>Date: {new Date(selectedSummary.created_at).toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}
    </div>
    </AuthGuard>
  );
}

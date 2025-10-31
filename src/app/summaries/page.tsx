'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import Card from '@/components/Card';

interface Summary {
  id: string;
  date: string;
  articlesCount: number;
  status: string;
  content?: string;
  langsmithRunId?: string;
  langsmithUrl?: string;
  articles?: Array<{
    title: string;
    url: string;
    snippet: string;
    score: number;
  }>;
}

interface DailySummaryData {
  dailySummary: {
    id: string;
    thread_id: string;
    collated_summary: string;
    html_content: string | null;
    collation_model: string;
    articles_summarized: number;
    langsmith_run_id: string;
    langsmith_url?: string;
    created_at: string;
  } | null;
  articleSummaries: Array<{
    id: string;
    article_id: string;
    thread_id: string;
    summary: string;
    model_used: string;
    langsmith_run_id: string;
    created_at: string;
  }>;
}

export default function DailySummaries() {
  const searchParams = useSearchParams();
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [selectedSummary, setSelectedSummary] = useState<Summary | null>(null);
  const [format, setFormat] = useState<'auto' | 'html' | 'text'>('auto');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummaries();
  }, []);

  async function loadSummaries() {
    try {
      // Fetch threads from API
      const response = await fetch('/api/threads?limit=20');
      
      let transformedSummaries: Summary[] = [];
      
      if (response.ok) {
        const result = await response.json();
        const threads = result.data || [];
        
        // Transform threads to summaries
        transformedSummaries = threads.map((thread: any) => ({
          id: thread.id,
          date: thread.run_date,
          articlesCount: thread.articles_processed || 0,
          status: thread.email_sent ? 'Email Sent' : thread.status === 'failed' ? 'Failed' : 'Running'
        }));
        
        setSummaries(transformedSummaries);
      } else {
        // Fallback to mock data
        transformedSummaries = [
          { id: '1', date: '2025-10-09', articlesCount: 2, status: 'Email Sent' },
          { id: '2', date: '2025-10-08', articlesCount: 10, status: 'Email Sent' },
          { id: '3', date: '2025-10-07', articlesCount: 10, status: 'Email Sent' },
          { id: '4', date: '2025-10-06', articlesCount: 1, status: 'Email Sent' },
          { id: '5', date: '2025-10-05', articlesCount: 8, status: 'Email Sent' },
        ];
        setSummaries(transformedSummaries);
      }

      // Auto-select summary if threadId is in query params
      const threadId = searchParams.get('threadId');
      if (threadId && transformedSummaries.length > 0) {
        const summaryToSelect = transformedSummaries.find(s => s.id === threadId);
        if (summaryToSelect) {
          await selectSummary(summaryToSelect);
        }
      }
    } catch (error) {
      console.error('Failed to load summaries:', error);
    } finally {
      setLoading(false);
    }
  }

  async function selectSummary(summary: Summary) {
    try {
      // Fetch full summary content from API
      const response = await fetch(`/api/summaries?threadId=${summary.id}`);
      
      if (response.ok) {
        const result = await response.json();
        const data: DailySummaryData = result.data;
        
        if (data.dailySummary) {
          setSelectedSummary({
            ...summary,
            content: data.dailySummary.collated_summary,
            langsmithRunId: data.dailySummary.langsmith_run_id,
            langsmithUrl: data.dailySummary.langsmith_url,
            articles: data.articleSummaries.map((article: any) => ({
              title: article.article_title || `Article ${article.article_id}`,
              url: article.article_url || '#',
              snippet: article.summary.substring(0, 150) + '...',
              score: article.article_relevancy_score ? Math.round(article.article_relevancy_score * 5) : 4 // Convert 0-1 score to 0-5 scale
            }))
          });
        } else {
          // No summary data available
          setSelectedSummary({
            ...summary,
            content: 'No summary data available for this thread.',
            articles: []
          });
        }
      } else {
        console.error('Failed to fetch summary details');
        setSelectedSummary({
          ...summary,
          content: 'Failed to load summary content.',
          articles: []
        });
      }
    } catch (error) {
      console.error('Error loading summary details:', error);
      setSelectedSummary({
        ...summary,
        content: 'Error loading summary content.',
        articles: []
      });
    }
  }

  function copyContent(type: 'html' | 'text') {
    if (selectedSummary?.content) {
      navigator.clipboard.writeText(selectedSummary.content);
      alert(`${type.toUpperCase()} copied to clipboard!`);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Header />
        <Navigation />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center text-slate-400">Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Summaries List */}
          <div className="lg:col-span-1">
            <Card>
              <h2 className="text-2xl font-bold text-white mb-6">Daily Summaries</h2>
              <div className="space-y-3">
                {summaries.map((summary) => (
                  <div
                    key={summary.id}
                    onClick={() => selectSummary(summary)}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedSummary?.id === summary.id
                        ? 'bg-blue-900 border-blue-600'
                        : 'bg-slate-700 border-slate-600 hover:bg-slate-650'
                    }`}
                  >
                    <h3 className="text-white font-semibold text-sm mb-1">
                      Daily Summary - {summary.date}
                    </h3>
                    <p className="text-slate-400 text-xs mb-2">{summary.articlesCount} articles</p>
                    <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded-full">
                      {summary.status}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Summary Detail */}
          <div className="lg:col-span-2">
            {selectedSummary ? (
              <Card>
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-white">
                    Daily Summary - {selectedSummary.date}
                  </h2>
                  <p className="text-slate-400 text-sm">{selectedSummary.date}</p>
                </div>

                <div className="mb-4 flex gap-2">
                  <button
                    onClick={() => alert('PDF export not implemented yet')}
                    className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded text-sm"
                  >
                    Export PDF
                  </button>
                  {selectedSummary.langsmithUrl && (
                    <button
                      onClick={() => {
                        window.open(selectedSummary.langsmithUrl, '_blank');
                      }}
                      className="bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
                    >
                      View LangSmith Trace
                    </button>
                  )}
                </div>

                {/* Daily Overview */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-semibold text-white">Daily Overview</h3>
                    <div className="flex gap-2">
                      <button className="text-2xl hover:scale-110 transition-transform">👍</button>
                      <button className="text-2xl hover:scale-110 transition-transform">👎</button>
                    </div>
                  </div>

                  <div className="bg-slate-700 rounded p-4 border border-slate-600">
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-slate-400 text-sm">Format:</span>
                        <div className="flex gap-1">
                          {(['auto', 'html', 'text'] as const).map((f) => (
                            <button
                              key={f}
                              onClick={() => setFormat(f)}
                              className={`px-3 py-1 rounded text-xs ${
                                format === f
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                              }`}
                            >
                              {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyContent('html')}
                          className="bg-slate-600 hover:bg-slate-500 text-white px-3 py-1 rounded text-xs"
                        >
                          Copy HTML
                        </button>
                        <button
                          onClick={() => copyContent('text')}
                          className="bg-slate-600 hover:bg-slate-500 text-white px-3 py-1 rounded text-xs"
                        >
                          Copy Text
                        </button>
                      </div>
                    </div>

                    <div className="text-slate-300 text-sm mb-2">
                      <span className="font-semibold">{format === 'auto' ? 'HTML' : format.toUpperCase()}</span>
                      <span className="text-slate-500 ml-2">Auto-detected {format === 'auto' ? 'HTML' : format.toUpperCase()}</span>
                    </div>

                    <div 
                      className="bg-slate-800 rounded p-4 text-slate-300 text-sm overflow-auto max-h-96"
                      dangerouslySetInnerHTML={{ __html: selectedSummary.content || 'No content available' }}
                    />
                  </div>
                </div>

                {/* Articles List */}
                {selectedSummary.articles && selectedSummary.articles.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">
                      Articles ({selectedSummary.articles.length})
                    </h3>
                    <div className="space-y-3">
                      {selectedSummary.articles.map((article, idx) => (
                        <div key={idx} className="bg-slate-700 rounded p-4 border border-slate-600">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="text-white font-semibold text-sm flex-1">{article.title}</h4>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-400">Score: {article.score}</span>
                              <button className="text-lg hover:scale-110 transition-transform">👍</button>
                              <button className="text-lg hover:scale-110 transition-transform">👎</button>
                            </div>
                          </div>
                          <p className="text-slate-400 text-xs mb-2">{article.snippet}</p>
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-xs"
                          >
                            Read Full Article →
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ) : (
              <Card>
                <div className="text-center text-slate-400 py-12">
                  Select a summary from the list to view details
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}


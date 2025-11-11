'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import Card from '@/components/Card';
import { AuthGuard } from '@/components/AuthGuard';

interface Summary {
  id: string;
  date: string;
  articlesCount: number;
  status: string;
  textContent?: string;
  htmlContent?: string | null;
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

  function determineStatus(thread: any): string {
    if (thread.status === 'failed') return 'Failed';
    if (thread.status === 'completed') {
      return thread.email_sent ? 'Email Sent' : 'Completed';
    }
    if (thread.status === 'running') return 'Running';
    return 'Unknown';
  }

  function getArticleCount(thread: any): number {
    const processed = thread.articles_processed;
    const found = thread.articles_found;
    const metadataCount = thread.metadata?.articles?.length;

    return (
      (typeof processed === 'number' && processed > 0 ? processed : undefined) ??
      (typeof found === 'number' && found > 0 ? found : undefined) ??
      (typeof metadataCount === 'number' && metadataCount > 0 ? metadataCount : undefined) ??
      0
    );
  }

  function getStatusBadgeClasses(status: string): string {
    switch (status) {
      case 'Email Sent':
        return 'bg-green-900 text-green-300';
      case 'Completed':
        return 'bg-blue-900 text-blue-300';
      case 'Running':
        return 'bg-amber-900 text-amber-200';
      case 'Failed':
        return 'bg-red-900 text-red-300';
      default:
        return 'bg-slate-700 text-slate-300';
    }
  }

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
            articlesCount: getArticleCount(thread),
            status: determineStatus(thread)
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
          const articles = data.articleSummaries.map((article: any) => {
            const snippetSource = article.summary || '';
            const snippet =
              snippetSource.length > 0
                ? `${snippetSource.substring(0, 150)}${snippetSource.length > 150 ? '...' : ''}`
                : 'No summary available.';

            return {
              title: article.article_title || `Article ${article.article_id}`,
              url: article.article_url || '#',
              snippet,
              score: article.article_relevancy_score ? Math.round(article.article_relevancy_score * 5) : 4 // Convert 0-1 score to 0-5 scale
            };
          });

          const articlesCount =
            data.dailySummary.articles_summarized ??
            (articles.length > 0 ? articles.length : summary.articlesCount);

          const updatedSummary: Summary = {
            ...summary,
            textContent: data.dailySummary.collated_summary,
            htmlContent: data.dailySummary.html_content,
            langsmithRunId: data.dailySummary.langsmith_run_id,
            langsmithUrl: data.dailySummary.langsmith_url,
            articles,
            articlesCount
          };

          setSelectedSummary(updatedSummary);
          setSummaries(prev =>
            prev.map(item =>
              item.id === summary.id
                ? {
                    ...item,
                    articlesCount: updatedSummary.articlesCount
                  }
                : item
            )
          );
        } else {
          // No summary data available
          setSelectedSummary({
            ...summary,
            textContent: 'No summary data available for this thread.',
            htmlContent: null,
            articles: []
          });
        }
      } else {
        console.error('Failed to fetch summary details');
        setSelectedSummary({
          ...summary,
          textContent: 'Failed to load summary content.',
          htmlContent: null,
          articles: []
        });
      }
    } catch (error) {
      console.error('Error loading summary details:', error);
      setSelectedSummary({
        ...summary,
        textContent: 'Error loading summary content.',
        htmlContent: null,
        articles: []
      });
    }
  }

  function textToHtml(content: string) {
    const escaped = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return escaped.replace(/\n/g, '<br />');
  }

  function getDisplayFormat(): 'html' | 'text' {
    if (format === 'auto') {
      return selectedSummary?.htmlContent ? 'html' : 'text';
    }
    return format;
  }

  const displayFormat = getDisplayFormat();

  const renderedContent = useMemo(() => {
    if (!selectedSummary) {
      return { type: 'text' as const, content: 'No content available.' };
    }

    if (displayFormat === 'html') {
      if (selectedSummary.htmlContent && selectedSummary.htmlContent.trim().length > 0) {
        return { type: 'html' as const, content: selectedSummary.htmlContent };
      }
      if (selectedSummary.textContent) {
        return { type: 'html' as const, content: textToHtml(selectedSummary.textContent) };
      }
      return { type: 'html' as const, content: '<p>No content available.</p>' };
    }

    if (selectedSummary.textContent) {
      return { type: 'text' as const, content: selectedSummary.textContent };
    }

    if (selectedSummary.htmlContent) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(selectedSummary.htmlContent, 'text/html');
      return { type: 'text' as const, content: doc.body.textContent || 'No content available.' };
    }

    return { type: 'text' as const, content: 'No content available.' };
  }, [selectedSummary, displayFormat]);

  async function copyContent(type: 'html' | 'text') {
    if (!selectedSummary) return;

    let clipboardContent = '';

    if (type === 'html') {
      if (selectedSummary.htmlContent && selectedSummary.htmlContent.trim().length > 0) {
        clipboardContent = selectedSummary.htmlContent;
      } else if (selectedSummary.textContent) {
        clipboardContent = textToHtml(selectedSummary.textContent);
      }
    } else {
      if (selectedSummary.textContent) {
        clipboardContent = selectedSummary.textContent;
      } else if (selectedSummary.htmlContent) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(selectedSummary.htmlContent, 'text/html');
        clipboardContent = doc.body.textContent || '';
      }
    }

    if (clipboardContent.trim().length === 0) {
      alert('No content available to copy.');
      return;
    }

    if (!navigator?.clipboard?.writeText) {
      alert('Clipboard API is not available in this browser.');
      return;
    }

    try {
      await navigator.clipboard.writeText(clipboardContent);
      alert(`${type.toUpperCase()} copied to clipboard!`);
    } catch (err) {
      console.error('Failed to copy content:', err);
      alert('Failed to copy content to clipboard.');
    }
  }

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-slate-900">
          <Header />
          <Navigation />
          <main className="max-w-7xl mx-auto px-6 py-8">
            <div className="text-center text-slate-400">Loading...</div>
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
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeClasses(summary.status)}`}>
                      {summary.status}
                    </span>
                  </div>
                  ))}
                  {summaries.length === 0 && (
                    <div className="text-slate-400 text-sm text-center py-8">No summaries available.</div>
                  )}
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
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-2">
                    <span>{selectedSummary.articlesCount} articles</span>
                    <span className={`px-2 py-1 rounded-full ${getStatusBadgeClasses(selectedSummary.status)}`}>
                      {selectedSummary.status}
                    </span>
                  </div>
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
                      <span className="font-semibold">
                        {displayFormat === 'html' ? 'HTML' : 'Text'}
                      </span>
                      <span className="text-slate-500 ml-2">
                        {format === 'auto'
                          ? `Auto-detected ${displayFormat === 'html' ? 'HTML' : 'Text'}`
                          : `Manually selected ${format.toUpperCase()}`}
                      </span>
                    </div>

                    {renderedContent.type === 'html' ? (
                      <div
                        className="bg-slate-800 rounded p-4 text-slate-300 text-sm overflow-auto max-h-96 prose prose-invert prose-sm"
                        dangerouslySetInnerHTML={{ __html: renderedContent.content }}
                      />
                    ) : (
                      <div className="bg-slate-800 rounded p-4 text-slate-300 text-sm overflow-auto max-h-96 whitespace-pre-wrap leading-relaxed">
                        {renderedContent.content}
                      </div>
                    )}
                  </div>
                </div>

                {/* Articles List */}
                {selectedSummary.articles && selectedSummary.articles.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">
                      Articles ({selectedSummary.articlesCount ?? selectedSummary.articles.length})
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
                {(!selectedSummary.articles || selectedSummary.articles.length === 0) && (
                  <div className="text-slate-400 text-sm text-center py-8">
                    No article summaries available for this run.
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
    </AuthGuard>
  );
}


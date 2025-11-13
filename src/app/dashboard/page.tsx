'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import Card from '@/components/Card';
import { AuthGuard } from '@/components/AuthGuard';
import { AdminGuard } from '@/components/AdminGuard';
import { useAuth } from '@/hooks/useAuth';

interface DashboardStats {
  lastRun: string;
  articlesFound: number;
  summariesGenerated: number;
  nextScheduledRun: string;
}

interface RecentSummary {
  id: string;
  date: string;
  articlesCount: number;
  status: 'completed' | 'failed' | 'running';
}

type ThreadApi = {
  id: string;
  run_date: string;
  status: 'running' | 'completed' | 'failed';
  articles_found: number | null;
  articles_processed: number | null;
  email_sent?: boolean;
  started_at?: string | null;
  completed_at?: string | null;
  metadata?: Record<string, any>;
};

function formatRelativeTime(value?: string | null): string {
  if (!value) return 'Never';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Never';

  const diffMs = Date.now() - date.getTime();
  if (diffMs < 0) return 'Scheduled';

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  if (diffMinutes <= 1) return 'Just now';
  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  }

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) {
    return `${diffWeeks} week${diffWeeks === 1 ? '' : 's'} ago`;
  }

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) {
    return `${diffMonths} month${diffMonths === 1 ? '' : 's'} ago`;
  }

  const diffYears = Math.floor(diffDays / 365);
  return `${diffYears} year${diffYears === 1 ? '' : 's'} ago`;
}

function formatAbsoluteDateTime(value?: string | Date | null, options: { includeTime?: boolean } = {}): string {
  if (!value) return 'Not scheduled';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not scheduled';

  const formatter = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...(options.includeTime !== false && {
      hour: 'numeric',
      minute: '2-digit'
    })
  });

  const formatted = formatter.format(date);
  return options.includeTime === false ? formatted : `${formatted}`;
}

function computeNextRunDisplay(thread?: ThreadApi): string {
  if (!thread) return 'Not scheduled';

  const scheduledFromMetadata = thread.metadata?.nextScheduledRun || thread.metadata?.next_run_at;
  if (scheduledFromMetadata) {
    return formatAbsoluteDateTime(scheduledFromMetadata);
  }

  const reference = thread.completed_at || thread.started_at;
  if (!reference) return 'Not scheduled';

  const base = new Date(reference);
  if (Number.isNaN(base.getTime())) return 'Not scheduled';

  const next = new Date(base.getTime() + 24 * 60 * 60 * 1000);
  return formatAbsoluteDateTime(next);
}

export default function Dashboard() {
  const router = useRouter();
  const { isAdmin, user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentSummaries, setRecentSummaries] = useState<RecentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const loadDashboardData = async () => {
    try {
      const response = await fetch('/api/threads?limit=20', { cache: 'no-store' });

      if (response.ok) {
        const result = await response.json();
        const rawThreads: ThreadApi[] = Array.isArray(result.data) ? result.data : [];
        const threads = rawThreads.sort((a, b) => {
          const aTime = new Date(a.completed_at || a.started_at || a.run_date).getTime();
          const bTime = new Date(b.completed_at || b.started_at || b.run_date).getTime();
          return bTime - aTime;
        });

        setRecentSummaries(
          threads.map((thread) => ({
            id: thread.id,
            date: formatAbsoluteDateTime(thread.completed_at || thread.run_date, { includeTime: false }),
            articlesCount: Number(thread.articles_processed ?? 0),
            status: thread.status
          }))
        );

        const lastCompletedThread = threads.find((thread) => thread.status === 'completed');
        const mostRecentThread = threads[0];

        if (lastCompletedThread || mostRecentThread) {
          const referenceThread = lastCompletedThread || mostRecentThread;
          const referenceTimestamp = referenceThread.completed_at || referenceThread.started_at;

          setStats({
            lastRun: formatRelativeTime(referenceTimestamp),
            articlesFound: Number(referenceThread.articles_found ?? 0),
            summariesGenerated: Number(referenceThread.articles_processed ?? 0),
            nextScheduledRun: computeNextRunDisplay(referenceThread)
          });
        } else {
          setStats({
            lastRun: 'Never',
            articlesFound: 0,
            summariesGenerated: 0,
            nextScheduledRun: 'Not scheduled'
          });
        }
      } else {
        setStats({
          lastRun: '10 hours ago',
          articlesFound: 2,
          summariesGenerated: 23,
          nextScheduledRun: 'Not scheduled'
        });

        setRecentSummaries([
          { id: '1', date: formatAbsoluteDateTime('2025-10-09', { includeTime: false }), articlesCount: 10, status: 'completed' },
          { id: '2', date: formatAbsoluteDateTime('2025-10-08', { includeTime: false }), articlesCount: 8, status: 'completed' },
          { id: '3', date: formatAbsoluteDateTime('2025-10-07', { includeTime: false }), articlesCount: 5, status: 'completed' },
          { id: '4', date: formatAbsoluteDateTime('2025-10-06', { includeTime: false }), articlesCount: 12, status: 'completed' },
          { id: '5', date: formatAbsoluteDateTime('2025-10-05', { includeTime: false }), articlesCount: 7, status: 'completed' }
        ]);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function runNow() {
    setRunning(true);
    try {
      const response = await fetch('/api/daily-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ useLangChainAgent: true })
      });
      
      if (response.ok) {
        alert('Summary generation started! Check your email in a few minutes.');
        loadDashboardData();
      } else {
        alert('Failed to start summary generation');
      }
    } catch (error) {
      console.error('Error running summary:', error);
      alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setRunning(false);
    }
  }

  async function gradeNow() {
    // Use authenticated user's email if available
    if (user?.email) {
      try {
        // Navigate to grading page with authenticated user's email
        const params = new URLSearchParams({
          email: user.email
        });
        if (user.name) {
          params.append('name', user.name);
        }
        router.push(`/grading?${params.toString()}`);
      } catch (error) {
        console.error('Error navigating to grading page:', error);
        alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    } else {
      // Fallback: prompt for email if somehow user is not authenticated
      const email = prompt('Enter your email address to grade summaries:');
      if (!email) {
        return; // User cancelled
      }

      try {
        // Navigate to grading page with email
        router.push(`/grading?email=${encodeURIComponent(email)}`);
      } catch (error) {
        console.error('Error navigating to grading page:', error);
        alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
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
          {/* System Status */}
          <Card className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">System Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                <div className="text-slate-400 text-sm mb-1">Last Run</div>
                <div className="text-white text-xl font-semibold">{stats?.lastRun}</div>
              </div>
              <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                <div className="text-slate-400 text-sm mb-1">Articles Found</div>
                <div className="text-green-400 text-xl font-semibold">{stats?.articlesFound}</div>
              </div>
              <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                <div className="text-slate-400 text-sm mb-1">Summaries Generated</div>
                <div className="text-blue-400 text-xl font-semibold">{stats?.summariesGenerated}</div>
              </div>
              <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                <div className="text-slate-400 text-sm mb-1">Next Scheduled Run</div>
                <div className="text-orange-400 text-xl font-semibold text-sm">{stats?.nextScheduledRun}</div>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <AdminGuard
                fallback={
                  <button
                    disabled
                    className="w-full sm:w-auto bg-slate-700 text-slate-400 px-6 py-3 rounded-lg font-medium cursor-not-allowed"
                    title="Admin access required"
                  >
                    Run Now (Admin Only)
                  </button>
                }
              >
                <button
                  onClick={runNow}
                  disabled={running}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                >
                  {running ? 'Running...' : 'Run Now'}
                </button>
              </AdminGuard>
              <button
                onClick={gradeNow}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
              >
                Grade Now
              </button>
            </div>
          </Card>

        {/* Recent Summaries */}
        <Card>
          <h2 className="text-2xl font-bold text-white mb-6">Recent Summaries</h2>
          <div className="space-y-4">
            {recentSummaries.map((summary) => (
              <div
                key={summary.id}
                className="bg-slate-700 rounded-lg p-4 border border-slate-600 flex items-center justify-between hover:bg-slate-650 transition-colors"
              >
                <div>
                  <h3 className="text-white font-semibold">Daily Summary - {summary.date}</h3>
                  <p className="text-slate-400 text-sm">{summary.articlesCount} articles processed</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs bg-green-900 text-green-300 px-3 py-1 rounded-full">
                    {summary.status}
                  </span>
                  <button 
                    onClick={() => router.push(`/summaries?threadId=${summary.id}`)}
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
    </AuthGuard>
  );
}


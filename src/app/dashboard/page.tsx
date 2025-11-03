'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import Card from '@/components/Card';

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

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentSummaries, setRecentSummaries] = useState<RecentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      // Fetch recent threads from API
      const response = await fetch('/api/threads?limit=5');
      
      if (response.ok) {
        const result = await response.json();
        const threads = result.data || [];
        
        // Transform threads to recent summaries
        const summaries = threads.map((thread: any) => ({
          id: thread.id,
          date: thread.run_date,
          articlesCount: thread.articles_processed || 0,
          status: thread.status
        }));
        
        setRecentSummaries(summaries);
        
        // Calculate stats from threads
        const lastThread = threads[0];
        if (lastThread) {
          const lastRunDate = new Date(lastThread.started_at);
          const hoursAgo = Math.floor((Date.now() - lastRunDate.getTime()) / (1000 * 60 * 60));
          
          setStats({
            lastRun: `${hoursAgo} hours ago`,
            articlesFound: lastThread.articles_found || 0,
            summariesGenerated: threads.filter((t: any) => t.status === 'completed').length,
            nextScheduledRun: '15th October 2025 at 8:00 AM'
          });
        } else {
          // No threads yet - use defaults
          setStats({
            lastRun: 'Never',
            articlesFound: 0,
            summariesGenerated: 0,
            nextScheduledRun: '15th October 2025 at 8:00 AM'
          });
        }
      } else {
        // Fallback to mock data if API fails
        setStats({
          lastRun: '10 hours ago',
          articlesFound: 2,
          summariesGenerated: 23,
          nextScheduledRun: '15th October 2025 at 8:00 AM'
        });

        setRecentSummaries([
          { id: '1', date: '2025-10-09', articlesCount: 10, status: 'completed' },
          { id: '2', date: '2025-10-08', articlesCount: 8, status: 'completed' },
          { id: '3', date: '2025-10-07', articlesCount: 5, status: 'completed' },
          { id: '4', date: '2025-10-06', articlesCount: 12, status: 'completed' },
          { id: '5', date: '2025-10-05', articlesCount: 7, status: 'completed' },
        ]);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

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
          <div className="flex gap-4">
            <button
              onClick={runNow}
              disabled={running}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
            >
              {running ? 'Running...' : 'Run Now'}
            </button>
            <button
              onClick={gradeNow}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              ⭐ Grade Now
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
  );
}


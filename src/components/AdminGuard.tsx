'use client';

import { useAuth } from '@/hooks/useAuth';

interface AdminGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AdminGuard({ children, fallback }: AdminGuardProps) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="text-center text-slate-400 py-4">Loading...</div>
    );
  }

  if (!isAdmin) {
    return (
      <>{fallback || (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 text-center">
          <p className="text-slate-400">Access denied. Admin privileges required.</p>
        </div>
      )}</>
    );
  }

  return <>{children}</>;
}


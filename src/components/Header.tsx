'use client';

import { UserMenu } from './UserMenu';

export default function Header() {
  return (
    <header className="bg-slate-800 border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">AgentBioSummary</h1>
          <p className="text-slate-400 text-sm">Synthetic Biology Daily Digest</p>
        </div>
        <UserMenu />
      </div>
    </header>
  );
}


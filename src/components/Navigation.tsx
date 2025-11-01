'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

const navItems = [
  { id: 'dashboard', label: '📊Dashboard', href: '/dashboard' },
  { id: 'summaries', label: '📝Daily Summaries', href: '/summaries' },
  { id: 'evaluations', label: '⭐Evaluations', href: '/evaluations' },
  { id: 'settings', label: '⚙️Settings', href: '/settings' },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-slate-900 border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex space-x-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`px-6 py-3 text-base font-medium transition-colors ${
                  isActive
                    ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-800'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}


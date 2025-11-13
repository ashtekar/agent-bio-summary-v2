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
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap gap-2 md:flex-nowrap md:gap-0 md:space-x-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex-1 text-center px-4 py-2 text-sm font-medium rounded-md border border-transparent transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 md:flex-none md:px-6 md:py-3 md:text-base md:rounded-none ${
                  isActive
                    ? 'text-blue-400 bg-slate-800 border-blue-500 md:border-0 md:border-b-2 md:border-blue-400'
                    : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800'
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


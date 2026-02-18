'use client';

import Link from 'next/link';

const menuItems = [
  { href: '/vocabulary', label: 'Vocabulary', desc: 'Browse words by category' },
  { href: '/pagsusulit', label: 'Quiz', desc: 'Test your knowledge' },
  { href: '/pakikinig', label: 'Listening', desc: 'Hear it, pick the meaning' },
  { href: '/progreso', label: 'Progress', desc: 'Track your learning' },
  { href: '/parirala', label: 'Quick Phrases', desc: 'Essential phrases' },
  { href: '/mga-numero', label: 'Numbers', desc: 'Learn numbers 1–100' },
  { href: '/settings', label: 'Settings', desc: 'Text size and audio' },
];

export default function IbaPaPage() {
  return (
    <div className="px-5 pt-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Navigation</p>
        <h1 className="text-2xl font-bold text-slate-900">More</h1>
      </div>

      <div className="space-y-2">
        {menuItems.map(item => (
          <Link key={item.href} href={item.href}>
            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3.5 transition-colors hover:bg-slate-50">
              <div>
                <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
              </div>
              <span className="text-slate-300 text-sm">→</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 text-center text-slate-300 text-xs">
        <p>Italiano v1.0</p>
      </div>
    </div>
  );
}

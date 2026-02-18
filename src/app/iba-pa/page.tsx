'use client';

import Link from 'next/link';

const menuItems = [
  { href: '/vocabulary', icon: '📚', label: 'Vocabulary', desc: 'Browse words by category' },
  { href: '/pagsusulit', icon: '✅', label: 'Quiz', desc: 'Test your knowledge' },
  { href: '/progreso', icon: '📊', label: 'Progress', desc: 'Track your learning' },
  { href: '/parirala', icon: '💬', label: 'Quick Phrases', desc: 'Essential phrases' },
  { href: '/mga-numero', icon: '🔢', label: 'Numbers', desc: 'Learn numbers 1-100' },
  { href: '/settings', icon: '⚙️', label: 'Settings', desc: 'Text size and audio' },
];

export default function IbaPaPage() {
  return (
    <div className="px-4 pt-6">
      <h1 className="mb-6 text-2xl font-bold text-green-800">📋 More</h1>

      <div className="space-y-3">
        {menuItems.map(item => (
          <Link key={item.href} href={item.href}>
            <div className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm border border-gray-100 transition-transform active:scale-[0.98]">
              <span className="text-3xl">{item.icon}</span>
              <div className="flex-1">
                <p className="font-bold text-gray-800 text-lg">{item.label}</p>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
              <span className="text-xl text-green-500">→</span>
            </div>
          </Link>
        ))}
      </div>

      {/* App Info */}
      <div className="mt-8 text-center text-gray-400 text-sm">
        <p>Italiano v1.0</p>
        <p>Learn Italian from Tagalog</p>
        <p className="mt-1">🇵🇭 → 🇮🇹</p>
      </div>
    </div>
  );
}

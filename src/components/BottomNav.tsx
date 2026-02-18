'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/mga-aralin', label: 'Lessons', icon: '📖' },
  { href: '/vocabulary', label: 'Vocabulary', icon: '📚' },
  { href: '/repaso', label: 'Review', icon: '🔄' },
  { href: '/iba-pa', label: 'More', icon: '📋' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-amber-200 bg-white safe-bottom">
      <div className="mx-auto flex max-w-lg">
        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center py-3 text-center transition-colors ${
                isActive
                  ? 'text-green-700 bg-green-50'
                  : 'text-gray-500 hover:text-green-600'
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="mt-1 text-xs font-bold">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

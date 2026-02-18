'use client';

import { useState } from 'react';
import Link from 'next/link';
import { vocabCategories } from '@/data/vocabulary';

export default function VocabularyPage() {
  const [search, setSearch] = useState('');

  const filtered = vocabCategories.filter(cat =>
    cat.title.toLowerCase().includes(search.toLowerCase()) ||
    cat.titleItalian.toLowerCase().includes(search.toLowerCase()) ||
    cat.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="px-5 pt-8 pb-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Reference</p>
        <h1 className="text-2xl font-bold text-slate-900">Vocabulary</h1>
        <p className="text-sm text-slate-500 mt-1">Browse words by category. Tap any card to explore.</p>
      </div>

      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search categories..."
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-400 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {filtered.map(cat => (
          <Link key={cat.id} href={`/vocabulary/${cat.id}`}>
            <div className="rounded-xl border border-slate-100 bg-white p-4 transition-colors hover:bg-slate-50 active:bg-slate-100">
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{cat.icon}</span>
                <span className="rounded-full bg-slate-100 text-slate-500 text-xs font-medium px-2.5 py-1">
                  {cat.words.length} words
                </span>
              </div>
              <p className="text-sm font-bold text-slate-900">{cat.title}</p>
              <p className="text-xs font-medium text-blue-600 mt-0.5">{cat.titleItalian}</p>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{cat.description}</p>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-12 text-center text-sm text-slate-400">No categories found.</p>
      )}
    </div>
  );
}

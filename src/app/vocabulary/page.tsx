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
    <div className="px-4 pt-6 pb-8">
      {/* Header */}
      <h1 className="mb-1 text-3xl font-bold text-gray-900">Vocabulary</h1>
      <p className="mb-5 text-gray-500 text-base">
        Build your Italian vocabulary by category. Browse words, hear pronunciation, and practice with flashcards.
      </p>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search all vocabulary (Italian or English)..."
            className="w-full rounded-2xl border-2 border-gray-200 bg-white pl-11 pr-4 py-3 text-base focus:border-green-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {filtered.map(cat => (
          <Link key={cat.id} href={`/vocabulary/${cat.id}`}>
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 transition-transform active:scale-[0.97] hover:shadow-md cursor-pointer">
              {/* Top row: icon + word count badge */}
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{cat.icon}</span>
                <span className="rounded-full bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1">
                  {cat.words.length} words
                </span>
              </div>

              {/* Title */}
              <p className="text-lg font-bold text-gray-900 leading-tight">{cat.title}</p>

              {/* Italian subtitle */}
              <p className="text-sm font-semibold text-green-600 mt-0.5 mb-2">{cat.titleItalian}</p>

              {/* Description */}
              <p className="text-sm text-gray-500 leading-snug">{cat.description}</p>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-12 text-center text-gray-400">
          <p className="text-xl">No categories found.</p>
          <p className="text-sm mt-1">Try a different search term.</p>
        </div>
      )}
    </div>
  );
}

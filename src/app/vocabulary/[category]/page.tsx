'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { vocabCategories } from '@/data/vocabulary';
import AudioButton from '@/components/AudioButton';

export default function VocabCategoryPage() {
  const params = useParams();
  const categoryId = params.category as string;
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const category = vocabCategories.find(c => c.id === categoryId);

  if (!category) {
    return (
      <div className="px-4 pt-8 text-center">
        <p className="text-xl text-gray-500">Category not found.</p>
        <Link href="/vocabulary" className="mt-4 inline-block text-green-600 font-bold">
          ← Back to Vocabulary
        </Link>
      </div>
    );
  }

  const filtered = category.words.filter(w =>
    w.italian.toLowerCase().includes(search.toLowerCase()) ||
    w.english.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="px-4 pt-5 pb-8">
      {/* Back link */}
      <Link href="/vocabulary" className="inline-flex items-center gap-1 text-green-600 font-semibold text-sm mb-4">
        ← Vocabulary
      </Link>

      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <span className="text-4xl">{category.icon}</span>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">{category.title}</h1>
          <p className="text-base font-semibold text-green-600">{category.titleItalian}</p>
        </div>
      </div>
      <p className="text-gray-500 text-sm mb-5 mt-1">{category.description}</p>

      {/* Word count pill */}
      <div className="flex items-center gap-2 mb-4">
        <span className="rounded-full bg-blue-100 text-blue-700 text-sm font-bold px-3 py-1">
          {category.words.length} words
        </span>
        {search && (
          <span className="rounded-full bg-gray-100 text-gray-600 text-sm px-3 py-1">
            {filtered.length} results
          </span>
        )}
      </div>

      {/* Search */}
      <div className="mb-5">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search words..."
            className="w-full rounded-2xl border-2 border-gray-200 bg-white pl-11 pr-4 py-3 text-base focus:border-green-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Word list */}
      <div className="space-y-3">
        {filtered.map(word => {
          const isExpanded = expandedId === word.id;
          return (
            <div
              key={word.id}
              className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden"
            >
              {/* Main row */}
              <button
                className="w-full text-left px-4 py-4 flex items-center gap-3"
                onClick={() => setExpandedId(isExpanded ? null : word.id)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xl font-bold text-gray-900">{word.italian}</p>
                  <p className="text-base text-gray-600 mt-0.5">{word.english}</p>
                  <p className="text-xs text-blue-500 mt-1">🗣️ {word.pronunciation}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <AudioButton text={word.italian} />
                  <span className={`text-gray-400 text-sm transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </div>
              </button>

              {/* Expanded example sentences */}
              {isExpanded && word.exampleItalian && (
                <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
                  <div className="pt-3 flex items-start gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-700 italic">
                        &ldquo;{word.exampleItalian}&rdquo;
                      </p>
                      <p className="text-sm text-gray-500 mt-1">{word.exampleEnglish}</p>
                    </div>
                    <AudioButton text={word.exampleItalian} size="normal" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="mt-10 text-center text-gray-400">
          <p className="text-xl">No words found.</p>
          <p className="text-sm mt-1">Try a different search term.</p>
        </div>
      )}
    </div>
  );
}

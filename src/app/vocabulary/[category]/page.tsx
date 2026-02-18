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
      <div className="px-5 pt-8 text-center">
        <p className="text-sm text-slate-500">Category not found.</p>
        <Link href="/vocabulary" className="mt-4 inline-block text-blue-600 font-semibold text-sm">
          ← Vocabulary
        </Link>
      </div>
    );
  }

  const filtered = category.words.filter(w =>
    w.italian.toLowerCase().includes(search.toLowerCase()) ||
    w.english.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="px-5 pt-5 pb-8">
      <Link href="/vocabulary" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 mb-5">
        ← Vocabulary
      </Link>

      <div className="flex items-center gap-3 mb-1">
        <span className="text-3xl">{category.icon}</span>
        <div>
          <h1 className="text-xl font-bold text-slate-900">{category.title}</h1>
          <p className="text-sm font-medium text-blue-600">{category.titleItalian}</p>
        </div>
      </div>
      <p className="text-xs text-slate-400 mb-5 mt-1">{category.description}</p>

      <div className="flex items-center gap-2 mb-4">
        <span className="rounded-full bg-slate-100 text-slate-500 text-xs font-medium px-2.5 py-1">
          {category.words.length} words
        </span>
        {search && (
          <span className="rounded-full bg-slate-100 text-slate-500 text-xs px-2.5 py-1">
            {filtered.length} results
          </span>
        )}
      </div>

      <div className="mb-5">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search words..."
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-400 focus:outline-none"
        />
      </div>

      <div className="space-y-2">
        {filtered.map(word => {
          const isExpanded = expandedId === word.id;
          return (
            <div key={word.id} className="rounded-xl border border-slate-100 bg-white overflow-hidden">
              <button
                className="w-full text-left px-4 py-3.5 flex items-center gap-3"
                onClick={() => setExpandedId(isExpanded ? null : word.id)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-slate-900">{word.italian}</p>
                  <p className="text-sm text-slate-500 mt-0.5">{word.english}</p>
                  <p className="text-xs text-blue-500 mt-0.5">{word.pronunciation}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <AudioButton text={word.italian} />
                  <span className={`text-slate-300 text-xs transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                </div>
              </button>

              {isExpanded && word.exampleItalian && (
                <div className="px-4 pb-4 border-t border-slate-50 bg-slate-50">
                  <div className="pt-3 flex items-start gap-2">
                    <div className="flex-1">
                      <p className="text-sm text-slate-700 italic">&ldquo;{word.exampleItalian}&rdquo;</p>
                      <p className="text-xs text-slate-500 mt-1">{word.exampleEnglish}</p>
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
        <p className="mt-10 text-center text-sm text-slate-400">No words found.</p>
      )}
    </div>
  );
}

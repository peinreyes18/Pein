'use client';

import { useState } from 'react';
import { quickPhrases } from '@/data/phrasebook';
import AudioButton from '@/components/AudioButton';

export default function PariralaPage() {
  const [search, setSearch] = useState('');

  const filtered = quickPhrases.filter(p =>
    p.italian.toLowerCase().includes(search.toLowerCase()) ||
    p.tagalog.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="px-5 pt-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Reference</p>
        <h1 className="text-2xl font-bold text-slate-900">Quick Phrases</h1>
        <p className="text-sm text-slate-500 mt-1">Essential phrases for everyday use.</p>
      </div>

      <div className="mb-5">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search phrases..."
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-400 focus:outline-none"
        />
      </div>

      <div className="space-y-2">
        {filtered.map(phrase => (
          <div key={phrase.id} className="rounded-xl border border-slate-100 bg-white p-4">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="text-base font-bold text-slate-900">{phrase.italian}</p>
                <p className="text-sm text-slate-500 mt-0.5">{phrase.tagalog}</p>
                <p className="text-xs text-blue-500 mt-1">{phrase.pronunciation}</p>
              </div>
              <AudioButton text={phrase.italian} />
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-8 text-center text-sm text-slate-400">No phrases found.</p>
      )}
    </div>
  );
}

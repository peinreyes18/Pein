'use client';

import { useState } from 'react';
import Link from 'next/link';
import { quickPhrases } from '@/data/phrasebook';
import AudioButton from '@/components/AudioButton';

export default function PariralaPage() {
  const [search, setSearch] = useState('');

  const filtered = quickPhrases.filter(p =>
    p.italian.toLowerCase().includes(search.toLowerCase()) ||
    p.tagalog.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="px-4 pt-6">
      <h1 className="mb-2 text-2xl font-bold text-green-800">💬 Mabilisang Parirala</h1>
      <p className="mb-4 text-gray-600">
        Mga pinaka-importanteng parirala para sa araw-araw.
      </p>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Maghanap ng parirala..."
          className="w-full rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 text-lg focus:border-green-400 focus:outline-none"
        />
      </div>

      {/* Phrases List */}
      <div className="space-y-3">
        {filtered.map(phrase => (
          <div
            key={phrase.id}
            className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100"
          >
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="text-xl font-bold text-gray-900">
                  {phrase.italian}
                </p>
                <p className="text-base text-gray-600 mt-1">
                  {phrase.tagalog}
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  🗣️ {phrase.pronunciation}
                </p>
              </div>
              <AudioButton text={phrase.italian} />
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-8 text-center text-gray-500">
          <p className="text-xl">Walang nahanap na parirala.</p>
          <p className="text-sm mt-1">Subukan ang ibang salita.</p>
        </div>
      )}
    </div>
  );
}

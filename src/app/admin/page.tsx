'use client';

import { useState } from 'react';
import { lessons } from '@/data/lessons';
import { quickPhrases } from '@/data/phrasebook';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [showExport, setShowExport] = useState(false);

  const handleLogin = () => {
    // Check against env var or default password
    const adminPass = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'italiano2024';
    if (password === adminPass) {
      setAuthenticated(true);
    } else {
      alert('Mali ang password!');
    }
  };

  if (!authenticated) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <h1 className="mb-6 text-2xl font-bold text-green-800 text-center">
            🔒 Admin
          </h1>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="Ilagay ang password"
            className="mb-4 w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-lg focus:border-green-400 focus:outline-none"
          />
          <button
            onClick={handleLogin}
            className="w-full rounded-xl bg-green-600 py-3 text-center font-bold text-white text-lg"
          >
            Pumasok
          </button>
        </div>
      </div>
    );
  }

  const lesson = selectedLesson ? lessons.find(l => l.id === selectedLesson) : null;

  // Export all content as JSON for editing
  const exportData = () => {
    const data = {
      lessons,
      quickPhrases,
      exportDate: new Date().toISOString(),
      instructions: {
        tl: 'I-edit ang JSON na ito at palitan ang mga file sa src/data/ folder.',
        howToEdit: [
          '1. I-edit ang lessons array sa src/data/lessons.ts',
          '2. I-edit ang quickPhrases array sa src/data/phrasebook.ts',
          '3. I-restart ang dev server (npm run dev)',
          '4. Mag-deploy ulit sa Vercel kapag ready',
        ],
      },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'italiano-content.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="px-4 pt-6">
      <h1 className="mb-2 text-2xl font-bold text-green-800">🛠️ Admin Dashboard</h1>
      <p className="mb-6 text-gray-600">
        Tingnan at i-manage ang lahat ng content.
      </p>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-white p-3 text-center shadow-sm border border-gray-100">
          <p className="text-2xl font-bold text-green-600">{lessons.length}</p>
          <p className="text-xs text-gray-500">Mga Aralin</p>
        </div>
        <div className="rounded-xl bg-white p-3 text-center shadow-sm border border-gray-100">
          <p className="text-2xl font-bold text-blue-600">
            {lessons.reduce((sum, l) => sum + l.items.length, 0)}
          </p>
          <p className="text-xs text-gray-500">Mga Item</p>
        </div>
        <div className="rounded-xl bg-white p-3 text-center shadow-sm border border-gray-100">
          <p className="text-2xl font-bold text-purple-600">{quickPhrases.length}</p>
          <p className="text-xs text-gray-500">Quick Phrases</p>
        </div>
      </div>

      {/* Export Button */}
      <button
        onClick={exportData}
        className="mb-6 w-full rounded-xl bg-blue-600 py-3 text-center font-bold text-white text-lg transition-transform active:scale-[0.97]"
      >
        📥 I-download ang Lahat ng Content (JSON)
      </button>

      {/* Content Guide */}
      <div className="mb-6 rounded-2xl bg-yellow-50 p-4 border border-yellow-200">
        <h2 className="mb-2 font-bold text-yellow-800">📝 Paano Mag-edit ng Content</h2>
        <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-700">
          <li>I-download ang JSON file sa itaas</li>
          <li>I-edit ang mga aralin at parirala</li>
          <li>Kopyahin ang bagong data sa <code className="bg-yellow-100 px-1 rounded">src/data/lessons.ts</code></li>
          <li>I-restart ang dev server: <code className="bg-yellow-100 px-1 rounded">npm run dev</code></li>
          <li>I-deploy sa Vercel: <code className="bg-yellow-100 px-1 rounded">git push</code></li>
        </ol>
      </div>

      {/* Lesson List */}
      <h2 className="mb-3 font-bold text-gray-800 text-lg">Mga Aralin</h2>
      <div className="space-y-2 mb-6">
        {lessons.map(l => (
          <button
            key={l.id}
            onClick={() => setSelectedLesson(selectedLesson === l.id ? null : l.id)}
            className={`w-full rounded-xl p-4 text-left transition-all ${
              selectedLesson === l.id
                ? 'bg-green-100 border-2 border-green-400'
                : 'bg-white border border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-800">
                  {l.icon} {l.title}
                </p>
                <p className="text-sm text-gray-500">
                  {l.items.length} na item — ID: {l.id}
                </p>
              </div>
              <span className="text-xl">{selectedLesson === l.id ? '▼' : '▶'}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Selected Lesson Detail */}
      {lesson && (
        <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
          <h3 className="mb-3 font-bold text-gray-800">
            {lesson.icon} {lesson.title} — Mga Item
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {lesson.items.map((item, i) => (
              <div key={item.id} className="rounded-xl bg-gray-50 p-3 text-sm">
                <p className="font-bold text-gray-900">
                  {i + 1}. {item.italian}
                </p>
                <p className="text-gray-600">= {item.tagalog}</p>
                <p className="text-blue-600">🗣️ {item.pronunciation}</p>
                <p className="text-gray-500 text-xs mt-1">
                  Halimbawa: {item.exampleItalian}
                </p>
                {item.commonMistake && (
                  <p className="text-red-500 text-xs mt-1">
                    ⚠️ {item.commonMistake}
                  </p>
                )}
                <p className="text-gray-400 text-xs mt-1">ID: {item.id}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Phrases */}
      <h2 className="mb-3 font-bold text-gray-800 text-lg">Mabilisang Parirala</h2>
      <div className="space-y-2 mb-6">
        {quickPhrases.map((p, i) => (
          <div key={p.id} className="rounded-xl bg-white p-3 border border-gray-100 text-sm">
            <p className="font-bold text-gray-900">
              {i + 1}. {p.italian} = {p.tagalog}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

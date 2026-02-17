'use client';

import { useState } from 'react';
import { numbers, NumberItem } from '@/data/numbers';
import AudioButton from '@/components/AudioButton';

type Mode = 'list' | 'practice';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function MgaNumeroPage() {
  const [mode, setMode] = useState<Mode>('list');
  const [practiceItems, setPracticeItems] = useState<NumberItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [done, setDone] = useState(false);

  const startPractice = () => {
    const items = shuffle(numbers).slice(0, 10);
    setPracticeItems(items);
    setCurrentIndex(0);
    setShowAnswer(false);
    setScore(0);
    setTotal(0);
    setDone(false);
    setMode('practice');
  };

  if (mode === 'practice') {
    if (done) {
      return (
        <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
          <div className="mb-4 text-6xl">🔢</div>
          <h1 className="mb-2 text-3xl font-bold text-green-800">Great Job!</h1>
          <p className="mb-6 text-xl text-gray-700">
            {score} / {total} correct
          </p>
          <div className="w-full max-w-sm space-y-3">
            <button
              onClick={startPractice}
              className="block w-full rounded-2xl bg-green-600 py-4 text-center font-bold text-white text-lg"
            >
              🔄 Try Again
            </button>
            <button
              onClick={() => setMode('list')}
              className="block w-full rounded-2xl bg-white border border-gray-200 py-4 text-center font-bold text-gray-700 text-lg"
            >
              📋 View List
            </button>
          </div>
        </div>
      );
    }

    const item = practiceItems[currentIndex];

    return (
      <div className="px-4 pt-6">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => setMode('list')}
            className="text-green-700 font-bold text-lg"
          >
            ← Back
          </button>
          <span className="text-sm font-bold text-gray-500">
            {currentIndex + 1} / {practiceItems.length}
          </span>
        </div>

        <div className="mb-4 h-3 rounded-full bg-gray-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-green-500 progress-fill"
            style={{ width: `${(currentIndex / practiceItems.length) * 100}%` }}
          />
        </div>

        <div className="card-enter rounded-3xl bg-white p-8 shadow-lg border border-gray-100 text-center">
          <p className="text-sm font-bold text-gray-500 mb-2">What is this number in Italian?</p>
          <p className="text-6xl font-bold text-green-700 mb-4">{item.number}</p>
          <p className="text-lg text-gray-500 mb-6">({item.tagalog})</p>

          {!showAnswer ? (
            <button
              onClick={() => setShowAnswer(true)}
              className="w-full rounded-2xl border-2 border-dashed border-green-300 bg-green-50 py-6 text-center"
            >
              <p className="text-lg font-bold text-green-700">
                👆 Tap to see the answer
              </p>
            </button>
          ) : (
            <div className="card-enter">
              <div className="mb-4 flex items-center justify-center gap-3">
                <p className="text-4xl font-bold text-gray-900">{item.italian}</p>
                <AudioButton text={item.italian} size="large" />
              </div>
              <p className="mb-6 text-lg text-blue-600">🗣️ {item.pronunciation}</p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setTotal(t => t + 1);
                    setShowAnswer(false);
                    if (currentIndex < practiceItems.length - 1) {
                      setCurrentIndex(currentIndex + 1);
                    } else {
                      setDone(true);
                    }
                  }}
                  className="rounded-2xl bg-amber-100 py-4 font-bold text-amber-800 text-lg"
                >
                  🔄 Don't Know
                </button>
                <button
                  onClick={() => {
                    setScore(s => s + 1);
                    setTotal(t => t + 1);
                    setShowAnswer(false);
                    if (currentIndex < practiceItems.length - 1) {
                      setCurrentIndex(currentIndex + 1);
                    } else {
                      setDone(true);
                    }
                  }}
                  className="rounded-2xl bg-green-500 py-4 font-bold text-white text-lg"
                >
                  ✓ I Know It!
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // List mode
  return (
    <div className="px-4 pt-6">
      <h1 className="mb-2 text-2xl font-bold text-green-800">🔢 Numbers 1–100</h1>
      <p className="mb-4 text-gray-600">
        Learn Italian numbers.
      </p>

      <button
        onClick={startPractice}
        className="mb-6 w-full rounded-2xl bg-green-600 py-4 text-center font-bold text-white text-xl shadow-lg transition-transform active:scale-[0.97]"
      >
        ▶️ Practice Numbers
      </button>

      <div className="space-y-2">
        {numbers.map(item => (
          <div
            key={item.number}
            className="flex items-center gap-4 rounded-xl bg-white p-3 shadow-sm border border-gray-100"
          >
            <span className="w-12 text-center text-2xl font-bold text-green-700">
              {item.number}
            </span>
            <div className="flex-1">
              <p className="font-bold text-gray-900">{item.italian}</p>
              <p className="text-sm text-gray-500">{item.tagalog} — {item.pronunciation}</p>
            </div>
            <AudioButton text={item.italian} />
          </div>
        ))}
      </div>
    </div>
  );
}

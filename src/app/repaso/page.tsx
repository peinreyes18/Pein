'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getDueCards, reviewCard, updateStreak } from '@/lib/storage';
import { ReviewCard, PhraseItem } from '@/lib/types';
import { lessons } from '@/data/lessons';
import AudioButton from '@/components/AudioButton';

function findItem(itemId: string): PhraseItem | undefined {
  for (const lesson of lessons) {
    const item = lesson.items.find(i => i.id === itemId);
    if (item) return item;
  }
  return undefined;
}

export default function RepasoPage() {
  const [cards, setCards] = useState<ReviewCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [done, setDone] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const due = getDueCards();
    setCards(due);
    if (due.length === 0) setDone(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-2xl">Naglo-load...</div>
      </div>
    );
  }

  if (done || cards.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
        {sessionTotal > 0 ? (
          <>
            <div className="mb-4 text-6xl">🎯</div>
            <h1 className="mb-2 text-3xl font-bold text-green-800">
              Magaling!
            </h1>
            <p className="mb-4 text-xl text-gray-700">
              {sessionCorrect} / {sessionTotal} ang tama
            </p>
            <div className="mb-6 w-full max-w-xs rounded-2xl bg-green-50 p-4">
              <div className="h-4 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-green-500 progress-fill"
                  style={{ width: `${(sessionCorrect / sessionTotal) * 100}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-green-700 font-bold">
                {Math.round((sessionCorrect / sessionTotal) * 100)}% tama
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4 text-6xl">✨</div>
            <h1 className="mb-2 text-3xl font-bold text-green-800">
              Wala nang dapat repasuhin!
            </h1>
            <p className="mb-6 text-lg text-gray-600">
              Tapusin ang isang aralin para magkaroon ng mga flashcard.
            </p>
          </>
        )}

        <div className="w-full max-w-sm space-y-3">
          <Link
            href="/mga-aralin"
            className="block w-full rounded-2xl bg-green-600 py-4 text-center font-bold text-white text-lg transition-transform active:scale-[0.97]"
          >
            📖 Pumunta sa Mga Aralin
          </Link>
          <Link
            href="/"
            className="block w-full rounded-2xl bg-white border border-gray-200 py-4 text-center font-bold text-gray-700 text-lg transition-transform active:scale-[0.97]"
          >
            🏠 Bumalik sa Bahay
          </Link>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const currentItem = findItem(currentCard.itemId);

  if (!currentItem) {
    // Skip broken card
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setDone(true);
    }
    return null;
  }

  const handleCorrect = () => {
    reviewCard(currentCard.itemId, true);
    updateStreak();
    setSessionCorrect(prev => prev + 1);
    setSessionTotal(prev => prev + 1);
    goNext();
  };

  const handleIncorrect = () => {
    reviewCard(currentCard.itemId, false);
    updateStreak();
    setSessionTotal(prev => prev + 1);
    goNext();
  };

  const goNext = () => {
    setShowAnswer(false);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setDone(true);
    }
  };

  const boxLabels = ['', 'Bago', 'Natutunan', 'Pamilyar', 'Magaling', 'Master'];
  const boxColors = ['', 'bg-red-100 text-red-700', 'bg-orange-100 text-orange-700', 'bg-yellow-100 text-yellow-700', 'bg-blue-100 text-blue-700', 'bg-green-100 text-green-700'];

  return (
    <div className="px-4 pt-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <Link href="/" className="text-green-700 font-bold text-lg">
          ← Bumalik
        </Link>
        <span className="text-sm font-bold text-gray-500">
          {currentIndex + 1} / {cards.length}
        </span>
      </div>

      {/* Progress */}
      <div className="mb-4 h-3 rounded-full bg-gray-200 overflow-hidden">
        <div
          className="h-full rounded-full bg-green-500 progress-fill"
          style={{ width: `${(currentIndex / cards.length) * 100}%` }}
        />
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-green-800">🔄 Repaso</h1>
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${boxColors[currentCard.box]}`}>
          {boxLabels[currentCard.box]}
        </span>
      </div>

      {/* Card */}
      <div key={currentCard.itemId} className="card-enter rounded-3xl bg-white p-6 shadow-lg border border-gray-100">
        {/* Italian Phrase */}
        <div className="mb-4 flex items-start gap-3">
          <div className="flex-1">
            <p className="text-sm font-bold text-green-600 mb-1">Italyano:</p>
            <p className="text-3xl font-bold text-gray-900">
              {currentItem.italian}
            </p>
          </div>
          <AudioButton text={currentItem.italian} size="large" />
        </div>

        {/* Pronunciation */}
        <div className="mb-4 rounded-xl bg-blue-50 px-4 py-2">
          <p className="text-sm text-blue-600 font-medium">
            🗣️ Bigkas: <span className="font-bold">{currentItem.pronunciation}</span>
          </p>
        </div>

        {!showAnswer ? (
          <button
            onClick={() => setShowAnswer(true)}
            className="w-full rounded-2xl border-2 border-dashed border-green-300 bg-green-50 py-6 text-center transition-transform active:scale-[0.98]"
          >
            <p className="text-lg font-bold text-green-700">
              👆 Alam mo ba ito? I-tap para makita
            </p>
          </button>
        ) : (
          <div className="card-enter">
            {/* Tagalog */}
            <div className="mb-4 rounded-xl bg-yellow-50 p-4 border border-yellow-200">
              <p className="text-sm font-bold text-yellow-700 mb-1">Tagalog:</p>
              <p className="text-2xl font-bold text-gray-800">
                {currentItem.tagalog}
              </p>
            </div>

            {/* Example */}
            <div className="mb-4 rounded-xl bg-gray-50 p-4">
              <p className="text-sm font-bold text-gray-500 mb-2">Halimbawa:</p>
              <div className="flex items-start gap-2 mb-1">
                <p className="text-base font-semibold text-gray-800 flex-1">
                  &ldquo;{currentItem.exampleItalian}&rdquo;
                </p>
                <AudioButton text={currentItem.exampleItalian} />
              </div>
              <p className="text-sm text-gray-600">
                = &ldquo;{currentItem.exampleTagalog}&rdquo;
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={handleIncorrect}
                className="rounded-2xl bg-red-100 py-4 text-center font-bold text-red-700 text-lg transition-transform active:scale-[0.95]"
              >
                ✗ Hindi ko alam
              </button>
              <button
                onClick={handleCorrect}
                className="rounded-2xl bg-green-500 py-4 text-center font-bold text-white text-lg transition-transform active:scale-[0.95]"
              >
                ✓ Alam ko!
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

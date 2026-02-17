'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { lessons } from '@/data/lessons';
import { PhraseItem } from '@/lib/types';
import { markLessonCompleted, initializeReviewCards, updateStreak } from '@/lib/storage';
import AudioButton from '@/components/AudioButton';

interface Props {
  params: Promise<{ id: string }>;
}

export default function LessonPlayerPage({ params }: Props) {
  const { id } = use(params);
  const lesson = lessons.find(l => l.id === id);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [needsPractice, setNeedsPractice] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!lesson) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <p className="text-2xl">Hindi nahanap ang aralin.</p>
          <Link href="/mga-aralin" className="mt-4 inline-block text-green-600 font-bold">
            ← Bumalik sa mga aralin
          </Link>
        </div>
      </div>
    );
  }

  const items = lesson.items;
  const currentItem = items[currentIndex];
  const progress = ((currentIndex) / items.length) * 100;

  const handleGotIt = () => {
    goNext();
  };

  const handleNeedPractice = () => {
    setNeedsPractice(prev => [...prev, currentItem.id]);
    goNext();
  };

  const goNext = () => {
    setShowAnswer(false);
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Lesson complete
      markLessonCompleted(lesson.id);
      initializeReviewCards(lesson.id, items.map(i => i.id));
      updateStreak();
      setCompleted(true);
    }
  };

  if (completed) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
        <div className="mb-6 text-6xl">🎉</div>
        <h1 className="mb-2 text-3xl font-bold text-green-800">
          Magaling!
        </h1>
        <p className="mb-2 text-xl text-gray-700">
          Natapos mo ang aralin:
        </p>
        <p className="mb-6 text-2xl font-bold text-green-700">
          {lesson.title}
        </p>

        {needsPractice.length > 0 && (
          <div className="mb-6 rounded-2xl bg-amber-50 border border-amber-200 p-4 w-full max-w-sm">
            <p className="font-bold text-amber-800">
              {needsPractice.length} na item ang kailangan pang practisan
            </p>
            <p className="text-sm text-amber-700">
              Lalabas sila sa iyong repaso!
            </p>
          </div>
        )}

        <div className="space-y-3 w-full max-w-sm">
          <Link
            href={`/mga-aralin/${lesson.id}`}
            onClick={() => {
              setCurrentIndex(0);
              setShowAnswer(false);
              setNeedsPractice([]);
              setCompleted(false);
            }}
            className="block w-full rounded-2xl bg-green-100 py-4 text-center font-bold text-green-800 text-lg transition-transform active:scale-[0.97]"
          >
            🔄 Ulitin ang Aralin
          </Link>
          <Link
            href="/repaso"
            className="block w-full rounded-2xl bg-green-600 py-4 text-center font-bold text-white text-lg transition-transform active:scale-[0.97]"
          >
            📝 Mag-repaso Ngayon
          </Link>
          <Link
            href="/mga-aralin"
            className="block w-full rounded-2xl bg-white border border-gray-200 py-4 text-center font-bold text-gray-700 text-lg transition-transform active:scale-[0.97]"
          >
            ← Bumalik sa Mga Aralin
          </Link>
        </div>
      </div>
    );
  }

  if (!mounted) return null;

  return (
    <div className="px-4 pt-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <Link href="/mga-aralin" className="text-green-700 font-bold text-lg">
          ← Bumalik
        </Link>
        <span className="text-sm font-bold text-gray-500">
          {currentIndex + 1} / {items.length}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-4 h-3 rounded-full bg-gray-200 overflow-hidden">
        <div
          className="h-full rounded-full bg-green-500 progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Lesson Title */}
      <p className="mb-4 text-sm font-bold text-green-600">
        {lesson.icon} {lesson.title}
      </p>

      {/* Card */}
      <div key={currentItem.id} className="card-enter rounded-3xl bg-white p-6 shadow-lg border border-gray-100">
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

        {/* Tap to reveal */}
        {!showAnswer ? (
          <button
            onClick={() => setShowAnswer(true)}
            className="w-full rounded-2xl border-2 border-dashed border-green-300 bg-green-50 py-6 text-center transition-transform active:scale-[0.98]"
          >
            <p className="text-lg font-bold text-green-700">
              👆 I-tap para makita ang Tagalog
            </p>
          </button>
        ) : (
          <div className="card-enter">
            {/* Tagalog Translation */}
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
                <p className="text-lg font-semibold text-gray-800 flex-1">
                  &ldquo;{currentItem.exampleItalian}&rdquo;
                </p>
                <AudioButton text={currentItem.exampleItalian} />
              </div>
              <p className="text-base text-gray-600">
                = &ldquo;{currentItem.exampleTagalog}&rdquo;
              </p>
            </div>

            {/* Common Mistake */}
            {currentItem.commonMistake && (
              <div className="mb-4 rounded-xl bg-red-50 p-4 border border-red-100">
                <p className="text-sm font-bold text-red-700">
                  ⚠️ Tandaan:
                </p>
                <p className="text-sm text-red-600 mt-1">
                  {currentItem.commonMistake}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={handleNeedPractice}
                className="rounded-2xl bg-amber-100 py-4 text-center font-bold text-amber-800 text-lg transition-transform active:scale-[0.95]"
              >
                🔄 Ulitin
              </button>
              <button
                onClick={handleGotIt}
                className="rounded-2xl bg-green-500 py-4 text-center font-bold text-white text-lg transition-transform active:scale-[0.95]"
              >
                ✓ Alam ko na
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

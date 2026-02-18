'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { lessons } from '@/data/lessons';
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

  useEffect(() => { setMounted(true); }, []);

  if (!lesson) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <p className="text-slate-600 text-sm">Lesson not found.</p>
          <Link href="/mga-aralin" className="mt-4 inline-block text-blue-600 font-semibold text-sm">
            ← Back to Lessons
          </Link>
        </div>
      </div>
    );
  }

  const items = lesson.items;
  const currentItem = items[currentIndex];
  const progress = (currentIndex / items.length) * 100;

  const goNext = () => {
    setShowAnswer(false);
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      markLessonCompleted(lesson.id);
      initializeReviewCards(lesson.id, items.map(i => i.id));
      updateStreak();
      setCompleted(true);
    }
  };

  if (completed) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-5 text-center">
        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center mb-6">
          <span className="text-white text-xl font-bold">✓</span>
        </div>
        <h1 className="mb-1 text-2xl font-bold text-slate-900">Lesson complete</h1>
        <p className="text-slate-500 mb-1 text-sm">{lesson.titleItalian}</p>
        {needsPractice.length > 0 && (
          <p className="text-sm text-amber-600 mb-6">{needsPractice.length} items flagged for extra review</p>
        )}
        {!needsPractice.length && <div className="mb-6" />}
        <div className="space-y-2 w-full max-w-sm">
          <Link
            href="/repaso"
            className="block w-full rounded-xl bg-blue-600 py-3.5 text-center font-semibold text-white text-sm transition-colors hover:bg-blue-700"
          >
            Start review session
          </Link>
          <Link
            href={`/mga-aralin/${lesson.id}`}
            onClick={() => { setCurrentIndex(0); setShowAnswer(false); setNeedsPractice([]); setCompleted(false); }}
            className="block w-full rounded-xl border border-slate-200 py-3.5 text-center font-semibold text-slate-600 text-sm transition-colors hover:bg-slate-50"
          >
            Repeat lesson
          </Link>
          <Link
            href="/mga-aralin"
            className="block w-full rounded-xl border border-slate-200 py-3.5 text-center font-semibold text-slate-600 text-sm transition-colors hover:bg-slate-50"
          >
            Back to lessons
          </Link>
        </div>
      </div>
    );
  }

  if (!mounted) return null;

  return (
    <div className="px-5 pt-5">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/mga-aralin" className="text-sm text-slate-500 hover:text-slate-700">
          ← Lessons
        </Link>
        <span className="text-xs text-slate-400">{currentIndex + 1} / {items.length}</span>
      </div>

      <div className="mb-5 h-1 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-blue-600 progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
        {lesson.titleItalian}
      </p>

      <div key={currentItem.id} className="card-enter rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-start gap-3">
          <div className="flex-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Italian</p>
            <p className="text-3xl font-bold text-slate-900 leading-tight">{currentItem.italian}</p>
          </div>
          <AudioButton text={currentItem.italian} size="large" />
        </div>

        <div className="mb-4 rounded-lg bg-slate-50 px-3 py-2 border border-slate-100">
          <p className="text-xs text-slate-500">
            Pronunciation: <span className="font-semibold text-slate-700">{currentItem.pronunciation}</span>
          </p>
        </div>

        {!showAnswer ? (
          <button
            onClick={() => setShowAnswer(true)}
            className="w-full rounded-xl border-2 border-dashed border-slate-200 py-5 text-center text-sm font-semibold text-slate-400 transition-colors hover:border-blue-300 hover:text-blue-500"
          >
            Tap to reveal translation
          </button>
        ) : (
          <div className="card-enter">
            <div className="mb-4 rounded-lg border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Translation</p>
              <p className="text-xl font-semibold text-slate-800">{currentItem.tagalog}</p>
            </div>

            <div className="mb-4 rounded-lg border border-slate-100 p-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Example</p>
              <div className="flex items-start gap-2 mb-1">
                <p className="text-sm font-medium text-slate-700 flex-1 italic">
                  &ldquo;{currentItem.exampleItalian}&rdquo;
                </p>
                <AudioButton text={currentItem.exampleItalian} />
              </div>
              <p className="text-sm text-slate-500">{currentItem.exampleTagalog}</p>
            </div>

            {currentItem.commonMistake && (
              <div className="mb-4 rounded-lg border border-amber-100 bg-amber-50 p-4">
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Note</p>
                <p className="text-sm text-amber-800">{currentItem.commonMistake}</p>
              </div>
            )}

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                onClick={() => { setNeedsPractice(p => [...p, currentItem.id]); goNext(); }}
                className="rounded-xl border border-slate-200 py-3.5 text-center text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 active:bg-slate-100"
              >
                Review again
              </button>
              <button
                onClick={goNext}
                className="rounded-xl bg-blue-600 py-3.5 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-700 active:bg-blue-800"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

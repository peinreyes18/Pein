'use client';

import { use } from 'react';
import Link from 'next/link';
import { lessons } from '@/data/lessons';
import { markLessonCompleted, initializeReviewCards, updateStreak } from '@/lib/storage';
import AudioButton from '@/components/AudioButton';
import { useState } from 'react';

interface Props {
  params: Promise<{ id: string }>;
}

export default function LessonPlayerPage({ params }: Props) {
  const { id } = use(params);
  const lesson = lessons.find(l => l.id === id);
  const [completed, setCompleted] = useState(false);

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

  const handleComplete = () => {
    markLessonCompleted(lesson.id);
    initializeReviewCards(lesson.id, lesson.items.map(i => i.id));
    updateStreak();
    setCompleted(true);
  };

  if (completed) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-5 text-center">
        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center mb-6">
          <span className="text-white text-xl font-bold">✓</span>
        </div>
        <h1 className="mb-1 text-2xl font-bold text-slate-900">Lesson complete</h1>
        <p className="text-slate-500 mb-6 text-sm">{lesson.titleItalian}</p>
        <div className="space-y-2 w-full max-w-sm">
          <Link
            href="/repaso"
            className="block w-full rounded-xl bg-blue-600 py-3.5 text-center font-semibold text-white text-sm transition-colors hover:bg-blue-700"
          >
            Start review session
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

  return (
    <div className="px-5 pt-5 pb-8">
      <Link href="/mga-aralin" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 mb-5">
        ← Lessons
      </Link>

      <div className="flex items-center gap-3 mb-1">
        <span className="text-3xl">{lesson.icon}</span>
        <div>
          <h1 className="text-xl font-bold text-slate-900">{lesson.titleItalian}</h1>
          <p className="text-sm text-slate-500">{lesson.title}</p>
        </div>
      </div>
      <p className="text-xs text-slate-400 mb-5 mt-1">{lesson.items.length} items</p>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden mb-6">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_1fr_1fr] border-b border-slate-100 bg-slate-50 px-4 py-2.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Italian</p>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Translation</p>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Example</p>
        </div>

        {/* Table rows */}
        {lesson.items.map((item, index) => (
          <div
            key={item.id}
            className={`grid grid-cols-[1fr_1fr_1fr] px-4 py-3 gap-3 ${index !== lesson.items.length - 1 ? 'border-b border-slate-100' : ''}`}
          >
            {/* Italian column */}
            <div className="flex items-start gap-2 min-w-0">
              <AudioButton text={item.italian} size="small" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 leading-snug">{item.italian}</p>
                <p className="text-xs text-blue-500 mt-0.5">{item.pronunciation}</p>
              </div>
            </div>

            {/* Translation column */}
            <div className="flex items-start min-w-0">
              <p className="text-sm text-slate-600 leading-snug">{item.tagalog}</p>
            </div>

            {/* Example column */}
            <div className="flex items-start gap-2 min-w-0">
              {item.exampleItalian && (
                <>
                  <AudioButton text={item.exampleItalian} size="small" />
                  <div className="min-w-0">
                    <p className="text-xs text-slate-700 italic leading-snug">{item.exampleItalian}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{item.exampleTagalog}</p>
                    {item.commonMistake && (
                      <p className="text-xs text-amber-600 mt-1">{item.commonMistake}</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleComplete}
        className="w-full rounded-xl bg-blue-600 py-3.5 text-center font-semibold text-white text-sm transition-colors hover:bg-blue-700"
      >
        Mark as complete
      </button>
    </div>
  );
}

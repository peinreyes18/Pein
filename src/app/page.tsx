'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getProgress, getDueCards, updateStreak } from '@/lib/storage';
import { lessons } from '@/data/lessons';

export default function Home() {
  const [streak, setStreak] = useState(0);
  const [dueCount, setDueCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const progress = getProgress();
    const due = getDueCards();
    setStreak(progress.odayStreak);
    setDueCount(due.length);
    setCompletedCount(progress.lessonsCompleted.length);
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-slate-400 text-sm">Loading...</div>
      </div>
    );
  }

  const progressPct = Math.round((completedCount / lessons.length) * 100);

  return (
    <div className="px-5 pt-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Italian Learning</p>
        <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-2xl font-bold text-slate-900">{streak}</p>
          <p className="text-xs text-slate-500 mt-0.5">Day streak</p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-2xl font-bold text-slate-900">{completedCount}</p>
          <p className="text-xs text-slate-500 mt-0.5">Lessons done</p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-2xl font-bold text-slate-900">{dueCount}</p>
          <p className="text-xs text-slate-500 mt-0.5">Cards due</p>
        </div>
      </div>

      {/* Overall progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-slate-700">Overall progress</p>
          <p className="text-sm text-slate-500">{completedCount} / {lessons.length} lessons</p>
        </div>
        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-blue-600 progress-fill"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Review alert */}
      {dueCount > 0 && (
        <Link href="/repaso">
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-amber-900 text-sm">
                {dueCount} flashcard{dueCount !== 1 ? 's' : ''} ready to review
              </p>
              <p className="text-xs text-amber-700 mt-0.5">Keep your streak going</p>
            </div>
            <span className="text-amber-500 text-sm font-semibold">Review →</span>
          </div>
        </Link>
      )}

      {/* Quick actions */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Quick actions</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { href: '/mga-aralin', label: 'Lessons', sub: 'Learn something new' },
            { href: '/repaso', label: 'Flashcards', sub: 'Spaced repetition review' },
            { href: '/pagsusulit', label: 'Quiz', sub: 'Test your knowledge' },
            { href: '/vocabulary', label: 'Vocabulary', sub: 'Browse by category' },
          ].map(item => (
            <Link key={item.href} href={item.href}>
              <div className="rounded-xl border border-slate-100 bg-white p-4 transition-colors hover:bg-slate-50 active:bg-slate-100">
                <p className="font-semibold text-slate-800 text-sm">{item.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{item.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Continue learning */}
      {completedCount < lessons.length && (
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Continue learning</p>
          <div className="space-y-2">
            {lessons
              .sort((a, b) => a.order - b.order)
              .filter(l => !getProgress().lessonsCompleted.includes(l.id))
              .slice(0, 3)
              .map(lesson => (
                <Link key={lesson.id} href={`/mga-aralin/${lesson.id}`}>
                  <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3 transition-colors hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{lesson.icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{lesson.titleItalian}</p>
                        <p className="text-xs text-slate-400">{lesson.items.length} items</p>
                      </div>
                    </div>
                    <span className="text-slate-300 text-sm">→</span>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

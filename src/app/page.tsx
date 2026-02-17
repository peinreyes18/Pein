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
        <div className="text-2xl">🇮🇹 Naglo-load...</div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-green-800">
          🇮🇹 Italiano
        </h1>
        <p className="mt-1 text-gray-600">
          Matuto ng Italyano mula sa Tagalog
        </p>
      </div>

      {/* Streak Card */}
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 p-5 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-90">Sunod-sunod na Araw</p>
            <p className="text-4xl font-bold">{streak} 🔥</p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-90">Natapos na Aralin</p>
            <p className="text-2xl font-bold">{completedCount} / {lessons.length}</p>
          </div>
        </div>
      </div>

      {/* Daily Review Alert */}
      {dueCount > 0 && (
        <Link href="/repaso">
          <div className="mb-4 rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 transition-transform active:scale-[0.98]">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🔔</span>
              <div>
                <p className="font-bold text-amber-800">
                  May {dueCount} na dapat repasuhin!
                </p>
                <p className="text-sm text-amber-700">
                  I-tap para simulan ang repaso
                </p>
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Quick Actions */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        <Link href="/mga-aralin">
          <div className="rounded-2xl bg-white p-5 text-center shadow-md transition-transform active:scale-[0.97] border border-gray-100">
            <span className="text-4xl">📖</span>
            <p className="mt-2 font-bold text-gray-800">Mga Aralin</p>
            <p className="text-sm text-gray-500">Matuto ng bago</p>
          </div>
        </Link>

        <Link href="/repaso">
          <div className="rounded-2xl bg-white p-5 text-center shadow-md transition-transform active:scale-[0.97] border border-gray-100">
            <span className="text-4xl">🔄</span>
            <p className="mt-2 font-bold text-gray-800">Repaso</p>
            <p className="text-sm text-gray-500">Flashcards</p>
          </div>
        </Link>

        <Link href="/pagsusulit">
          <div className="rounded-2xl bg-white p-5 text-center shadow-md transition-transform active:scale-[0.97] border border-gray-100">
            <span className="text-4xl">✅</span>
            <p className="mt-2 font-bold text-gray-800">Pagsusulit</p>
            <p className="text-sm text-gray-500">Subukan ang alam mo</p>
          </div>
        </Link>

        <Link href="/parirala">
          <div className="rounded-2xl bg-white p-5 text-center shadow-md transition-transform active:scale-[0.97] border border-gray-100">
            <span className="text-4xl">💬</span>
            <p className="mt-2 font-bold text-gray-800">Parirala</p>
            <p className="text-sm text-gray-500">Mabilisang sanggunian</p>
          </div>
        </Link>
      </div>

      {/* Continue Learning */}
      {completedCount < lessons.length && (
        <div className="mb-6">
          <h2 className="mb-3 text-xl font-bold text-gray-800">
            Ituloy ang Pag-aaral
          </h2>
          {lessons
            .filter(l => !getProgress().lessonsCompleted.includes(l.id))
            .slice(0, 2)
            .map(lesson => (
              <Link key={lesson.id} href={`/mga-aralin/${lesson.id}`}>
                <div className="mb-3 flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm border border-gray-100 transition-transform active:scale-[0.98]">
                  <span className="text-3xl">{lesson.icon}</span>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">{lesson.title}</p>
                    <p className="text-sm text-gray-500">
                      {lesson.items.length} na salita at parirala
                    </p>
                  </div>
                  <span className="text-2xl text-green-500">→</span>
                </div>
              </Link>
            ))}
        </div>
      )}

      {/* Motivational */}
      <div className="mb-8 rounded-2xl bg-green-50 p-4 text-center border border-green-100">
        <p className="text-lg text-green-800">
          💪 Kaya mo ito! Unti-unti lang.
        </p>
      </div>
    </div>
  );
}

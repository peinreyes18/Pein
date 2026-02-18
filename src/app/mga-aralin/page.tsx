'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { lessons } from '@/data/lessons';
import { getProgress } from '@/lib/storage';

export default function LessonsPage() {
  const [completed, setCompleted] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCompleted(getProgress().lessonsCompleted);
  }, []);

  const sorted = [...lessons].sort((a, b) => a.order - b.order);
  const pct = mounted ? Math.round((completed.length / lessons.length) * 100) : 0;

  return (
    <div className="px-5 pt-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Study</p>
        <h1 className="text-2xl font-bold text-slate-900">Lessons</h1>
        <p className="text-sm text-slate-500 mt-1">{mounted ? completed.length : 0} of {lessons.length} completed</p>
      </div>

      <div className="mb-6 h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full rounded-full bg-blue-600 progress-fill" style={{ width: `${pct}%` }} />
      </div>

      <div className="space-y-2 mb-6">
        {sorted.map((lesson) => {
          const isDone = mounted && completed.includes(lesson.id);
          return (
            <Link key={lesson.id} href={`/mga-aralin/${lesson.id}`}>
              <div className={`flex items-center gap-4 rounded-xl border px-4 py-3.5 transition-colors ${
                isDone ? 'border-blue-100 bg-blue-50' : 'border-slate-100 bg-white hover:bg-slate-50'
              }`}>
                <span className="text-lg w-7 text-center flex-shrink-0">{lesson.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Lesson {lesson.order}</span>
                    {isDone && <span className="text-xs font-semibold text-blue-600">Completed</span>}
                  </div>
                  <p className="text-sm font-semibold text-slate-800 truncate">{lesson.titleItalian}</p>
                  <p className="text-xs text-slate-400 truncate">{lesson.title} — {lesson.items.length} items</p>
                </div>
                <span className={`text-sm flex-shrink-0 ${isDone ? 'text-blue-400' : 'text-slate-300'}`}>
                  {isDone ? '✓' : '→'}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Bonus</p>
      <Link href="/mga-numero">
        <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-white px-4 py-3.5 transition-colors hover:bg-slate-50 mb-4">
          <span className="text-lg w-7 text-center flex-shrink-0">🔢</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-800">Numbers 1–100</p>
            <p className="text-xs text-slate-400">Learn Italian numbers</p>
          </div>
          <span className="text-slate-300 text-sm">→</span>
        </div>
      </Link>
    </div>
  );
}

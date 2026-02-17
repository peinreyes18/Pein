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
    const progress = getProgress();
    setCompleted(progress.lessonsCompleted);
  }, []);

  return (
    <div className="px-4 pt-6">
      <h1 className="mb-2 text-2xl font-bold text-green-800">📖 Mga Aralin</h1>
      <p className="mb-6 text-gray-600">
        Pumili ng aralin para magsimula. Sundan ang pagkakasunod-sunod para sa pinakamabuting resulta.
      </p>

      <div className="space-y-3">
        {lessons
          .sort((a, b) => a.order - b.order)
          .map((lesson) => {
            const isCompleted = mounted && completed.includes(lesson.id);
            return (
              <Link key={lesson.id} href={`/mga-aralin/${lesson.id}`}>
                <div
                  className={`flex items-center gap-4 rounded-2xl p-5 shadow-sm transition-transform active:scale-[0.98] border ${
                    isCompleted
                      ? 'bg-green-50 border-green-200'
                      : 'bg-white border-gray-100'
                  }`}
                >
                  <span className="text-4xl">{lesson.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                        Aralin {lesson.order}
                      </span>
                      {isCompleted && (
                        <span className="text-xs font-bold text-green-700 bg-green-200 px-2 py-0.5 rounded-full">
                          ✓ Tapos na
                        </span>
                      )}
                    </div>
                    <p className="mt-1 font-bold text-gray-800 text-lg">
                      {lesson.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {lesson.titleItalian} — {lesson.items.length} na item
                    </p>
                  </div>
                  <span className="text-2xl text-green-500">→</span>
                </div>
              </Link>
            );
          })}
      </div>

      <div className="mt-6 mb-4">
        <Link href="/mga-numero">
          <div className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm border border-gray-100 transition-transform active:scale-[0.98]">
            <span className="text-4xl">🔢</span>
            <div className="flex-1">
              <p className="font-bold text-gray-800 text-lg">Mga Numero 1–100</p>
              <p className="text-sm text-gray-500">Matuto ng mga bilang sa Italyano</p>
            </div>
            <span className="text-2xl text-green-500">→</span>
          </div>
        </Link>
      </div>
    </div>
  );
}

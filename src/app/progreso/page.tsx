'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getProgress, getMasteredCount, getReviewCards } from '@/lib/storage';
import { UserProgress } from '@/lib/types';
import { lessons } from '@/data/lessons';

export default function ProgresoPage() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [mastered, setMastered] = useState(0);
  const [totalCards, setTotalCards] = useState(0);

  useEffect(() => {
    const p = getProgress();
    setProgress(p);
    setMastered(getMasteredCount());
    setTotalCards(getReviewCards().length);
  }, []);

  if (!progress) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  const totalItems = lessons.reduce((sum, l) => sum + l.items.length, 0);
  const accuracy = progress.totalReviews > 0
    ? Math.round((progress.totalCorrect / progress.totalReviews) * 100)
    : 0;

  const recentQuizzes = [...progress.quizResults]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="px-4 pt-6">
      <h1 className="mb-6 text-2xl font-bold text-green-800">📊 Progress</h1>

      {/* Streak */}
      <div className="mb-4 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 p-5 text-white shadow-lg">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-sm opacity-90">Streak</p>
            <p className="text-4xl font-bold">{progress.odayStreak} 🔥</p>
            <p className="text-xs opacity-75">consecutive days</p>
          </div>
          <div>
            <p className="text-sm opacity-90">Lessons Done</p>
            <p className="text-4xl font-bold">{progress.lessonsCompleted.length}</p>
            <p className="text-xs opacity-75">of {lessons.length} lessons</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-3xl font-bold text-blue-600">{totalCards}</p>
          <p className="text-sm text-gray-600">Total Flashcards</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-3xl font-bold text-green-600">{mastered}</p>
          <p className="text-sm text-gray-600">Mastered</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-3xl font-bold text-purple-600">{progress.totalReviews}</p>
          <p className="text-sm text-gray-600">Total Reviews</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-3xl font-bold text-amber-600">{accuracy}%</p>
          <p className="text-sm text-gray-600">Accuracy</p>
        </div>
      </div>

      {/* Lesson Progress */}
      <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
        <h2 className="mb-3 font-bold text-gray-800">Lessons</h2>
        <div className="space-y-2">
          {lessons.map(lesson => {
            const isCompleted = progress.lessonsCompleted.includes(lesson.id);
            return (
              <div key={lesson.id} className="flex items-center gap-3">
                <span className="text-xl">{lesson.icon}</span>
                <span className="flex-1 text-sm font-medium text-gray-700">
                  {lesson.title}
                </span>
                {isCompleted ? (
                  <span className="text-sm font-bold text-green-600">✓ Done</span>
                ) : (
                  <span className="text-sm text-gray-400">—</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mastery Progress Bar */}
      <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
        <h2 className="mb-2 font-bold text-gray-800">Mastery Progress</h2>
        <div className="h-4 rounded-full bg-gray-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-600 progress-fill"
            style={{ width: `${totalCards > 0 ? (mastered / totalCards) * 100 : 0}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-gray-600">
          {mastered} mastered out of {totalCards} items
        </p>
      </div>

      {/* Recent Quiz Results */}
      {recentQuizzes.length > 0 && (
        <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
          <h2 className="mb-3 font-bold text-gray-800">Recent Quizzes</h2>
          <div className="space-y-2">
            {recentQuizzes.map(q => (
              <div key={q.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {new Date(q.date).toLocaleDateString('tl-PH')}
                </span>
                <span className="font-bold text-gray-800">
                  {q.correctAnswers}/{q.totalQuestions}
                </span>
                <span className={`font-bold ${
                  (q.correctAnswers / q.totalQuestions) >= 0.8
                    ? 'text-green-600'
                    : 'text-amber-600'
                }`}>
                  {Math.round((q.correctAnswers / q.totalQuestions) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Motivational */}
      <div className="mb-6 rounded-2xl bg-green-50 p-4 text-center border border-green-100">
        <p className="text-lg text-green-800">
          {progress.odayStreak >= 7
            ? '🏆 One week streak! Amazing!'
            : progress.odayStreak >= 3
            ? '🌟 Keep it up! Great progress!'
            : '💪 Start your streak today!'}
        </p>
      </div>
    </div>
  );
}

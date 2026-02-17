'use client';

import { UserProgress, AppSettings, DEFAULT_PROGRESS, DEFAULT_SETTINGS, ReviewCard } from './types';

const PROGRESS_KEY = 'italiano_progress';
const SETTINGS_KEY = 'italiano_settings';

// --- Progress ---

export function getProgress(): UserProgress {
  if (typeof window === 'undefined') return DEFAULT_PROGRESS;
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    return JSON.parse(raw) as UserProgress;
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function saveProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

export function updateStreak(): UserProgress {
  const progress = getProgress();
  const today = new Date().toISOString().split('T')[0];
  const lastDate = progress.lastPracticeDate;

  if (lastDate === today) {
    return progress;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (lastDate === yesterdayStr) {
    progress.odayStreak += 1;
  } else if (lastDate !== today) {
    progress.odayStreak = 1;
  }

  progress.lastPracticeDate = today;
  saveProgress(progress);
  return progress;
}

export function markLessonCompleted(lessonId: string): UserProgress {
  const progress = getProgress();
  if (!progress.lessonsCompleted.includes(lessonId)) {
    progress.lessonsCompleted.push(lessonId);
  }
  saveProgress(progress);
  return progress;
}

// --- Leitner SRS ---

const BOX_INTERVALS = [0, 0, 2, 4, 8, 16]; // days for box 1-5

export function getReviewCards(): ReviewCard[] {
  const progress = getProgress();
  return progress.reviewCards;
}

export function initializeReviewCards(lessonId: string, itemIds: string[]): void {
  const progress = getProgress();
  const existing = new Set(progress.reviewCards.map(c => c.itemId));

  for (const itemId of itemIds) {
    if (!existing.has(itemId)) {
      progress.reviewCards.push({
        itemId,
        lessonId,
        box: 1,
        nextReviewDate: new Date().toISOString().split('T')[0],
        correctCount: 0,
        incorrectCount: 0,
      });
    }
  }

  saveProgress(progress);
}

export function getDueCards(): ReviewCard[] {
  const today = new Date().toISOString().split('T')[0];
  const cards = getReviewCards();
  return cards.filter(c => c.nextReviewDate <= today);
}

export function reviewCard(itemId: string, correct: boolean): void {
  const progress = getProgress();
  const card = progress.reviewCards.find(c => c.itemId === itemId);
  if (!card) return;

  const today = new Date().toISOString().split('T')[0];
  card.lastReviewed = today;

  if (correct) {
    card.correctCount++;
    card.box = Math.min(card.box + 1, 5);
  } else {
    card.incorrectCount++;
    card.box = Math.max(card.box - 1, 1);
  }

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + BOX_INTERVALS[card.box]);
  card.nextReviewDate = nextDate.toISOString().split('T')[0];

  progress.totalReviews++;
  if (correct) progress.totalCorrect++;

  saveProgress(progress);
}

export function getMasteredCount(): number {
  const cards = getReviewCards();
  return cards.filter(c => c.box >= 4).length;
}

// --- Settings ---

export function getSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return JSON.parse(raw) as AppSettings;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// --- Quiz Results ---

export function saveQuizResult(result: {
  type: 'tagalog-to-italian' | 'italian-to-tagalog';
  totalQuestions: number;
  correctAnswers: number;
  lessonId?: string;
}): void {
  const progress = getProgress();
  progress.quizResults.push({
    id: Date.now().toString(),
    date: new Date().toISOString(),
    ...result,
  });
  saveProgress(progress);
}

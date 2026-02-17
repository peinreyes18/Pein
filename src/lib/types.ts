// Core data types for the Italian learning app

export interface PhraseItem {
  id: string;
  italian: string;
  tagalog: string;
  pronunciation: string; // Tagalog-style phonetic hint
  exampleItalian: string;
  exampleTagalog: string;
  commonMistake?: string; // Tip in Tagalog
  category?: string;
}

export interface Lesson {
  id: string;
  title: string; // In Tagalog
  titleItalian: string;
  description: string; // In Tagalog
  icon: string;
  items: PhraseItem[];
  order: number;
}

// Leitner box system (1-5)
// Box 1: review every session
// Box 2: review every 2 days
// Box 3: review every 4 days
// Box 4: review every 8 days
// Box 5: mastered (review every 16 days)
export interface ReviewCard {
  itemId: string;
  lessonId: string;
  box: number; // 1-5
  nextReviewDate: string; // ISO date string
  lastReviewed?: string;
  correctCount: number;
  incorrectCount: number;
}

export interface QuizResult {
  id: string;
  date: string;
  type: 'tagalog-to-italian' | 'italian-to-tagalog';
  totalQuestions: number;
  correctAnswers: number;
  lessonId?: string;
}

export interface UserProgress {
  odayStreak: number;
  lastPracticeDate: string;
  lessonsCompleted: string[]; // lesson IDs
  totalReviews: number;
  totalCorrect: number;
  quizResults: QuizResult[];
  reviewCards: ReviewCard[];
}

export interface AppSettings {
  textSize: 'normal' | 'malaki' | 'mas-malaki'; // normal, large, extra-large
  audioEnabled: boolean;
  dailyGoal: number; // items per day
}

export const DEFAULT_SETTINGS: AppSettings = {
  textSize: 'malaki',
  audioEnabled: true,
  dailyGoal: 10,
};

export const DEFAULT_PROGRESS: UserProgress = {
  odayStreak: 0,
  lastPracticeDate: '',
  lessonsCompleted: [],
  totalReviews: 0,
  totalCorrect: 0,
  quizResults: [],
  reviewCards: [],
};

'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { lessons } from '@/data/lessons';
import { PhraseItem } from '@/lib/types';
import { saveQuizResult, updateStreak } from '@/lib/storage';
import AudioButton from '@/components/AudioButton';

type QuizMode = 'tagalog-to-italian' | 'italian-to-tagalog';
type QuizState = 'setup' | 'playing' | 'result';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getAllItems(): PhraseItem[] {
  return lessons.flatMap(l => l.items);
}

function getRandomChoices(correct: PhraseItem, all: PhraseItem[], count: number, field: 'italian' | 'tagalog'): string[] {
  const others = all.filter(i => i.id !== correct.id && i[field] !== correct[field]);
  const shuffled = shuffle(others).slice(0, count - 1);
  const choices = [...shuffled.map(i => i[field]), correct[field]];
  return shuffle(choices);
}

export default function PagsusulatPage() {
  const [state, setState] = useState<QuizState>('setup');
  const [mode, setMode] = useState<QuizMode>('tagalog-to-italian');
  const [selectedLesson, setSelectedLesson] = useState<string>('all');
  const [questions, setQuestions] = useState<PhraseItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [choices, setChoices] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [answered, setAnswered] = useState(false);

  const startQuiz = useCallback(() => {
    let items: PhraseItem[];
    if (selectedLesson === 'all') {
      items = getAllItems();
    } else {
      const lesson = lessons.find(l => l.id === selectedLesson);
      items = lesson ? lesson.items : getAllItems();
    }

    const quizItems = shuffle(items).slice(0, 10);
    setQuestions(quizItems);
    setCurrentIndex(0);
    setCorrect(0);
    setSelected(null);
    setAnswered(false);

    if (quizItems.length > 0) {
      const field = mode === 'tagalog-to-italian' ? 'italian' : 'tagalog';
      setChoices(getRandomChoices(quizItems[0], getAllItems(), 4, field));
    }

    setState('playing');
  }, [selectedLesson, mode]);

  useEffect(() => {
    if (state === 'playing' && questions.length > 0 && currentIndex < questions.length) {
      const field = mode === 'tagalog-to-italian' ? 'italian' : 'tagalog';
      setChoices(getRandomChoices(questions[currentIndex], getAllItems(), 4, field));
      setSelected(null);
      setAnswered(false);
    }
  }, [currentIndex, state, mode, questions]);

  const handleAnswer = (choice: string) => {
    if (answered) return;

    setSelected(choice);
    setAnswered(true);

    const currentQ = questions[currentIndex];
    const correctAnswer = mode === 'tagalog-to-italian' ? currentQ.italian : currentQ.tagalog;

    if (choice === correctAnswer) {
      setCorrect(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Quiz done
      updateStreak();
      saveQuizResult({
        type: mode,
        totalQuestions: questions.length,
        correctAnswers: correct + (selected === (mode === 'tagalog-to-italian' ? questions[currentIndex].italian : questions[currentIndex].tagalog) ? 0 : 0),
        lessonId: selectedLesson === 'all' ? undefined : selectedLesson,
      });
      setState('result');
    }
  };

  // Setup screen
  if (state === 'setup') {
    return (
      <div className="px-4 pt-6">
        <h1 className="mb-2 text-2xl font-bold text-green-800">✅ Quiz</h1>
        <p className="mb-6 text-gray-600">
          Test your knowledge! Choose a quiz type.
        </p>

        {/* Mode Selection */}
        <div className="mb-6">
          <p className="mb-3 font-bold text-gray-700">Quiz Type:</p>
          <div className="space-y-3">
            <button
              onClick={() => setMode('tagalog-to-italian')}
              className={`w-full rounded-2xl p-4 text-left font-bold text-lg transition-transform active:scale-[0.98] ${
                mode === 'tagalog-to-italian'
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-200'
              }`}
            >
              🇵🇭 → 🇮🇹 Tagalog → Italian
            </button>
            <button
              onClick={() => setMode('italian-to-tagalog')}
              className={`w-full rounded-2xl p-4 text-left font-bold text-lg transition-transform active:scale-[0.98] ${
                mode === 'italian-to-tagalog'
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-200'
              }`}
            >
              🇮🇹 → 🇵🇭 Italian → Tagalog
            </button>
          </div>
        </div>

        {/* Lesson Selection */}
        <div className="mb-6">
          <p className="mb-3 font-bold text-gray-700">Choose a Lesson:</p>
          <div className="space-y-2">
            <button
              onClick={() => setSelectedLesson('all')}
              className={`w-full rounded-xl p-3 text-left font-semibold transition-transform active:scale-[0.98] ${
                selectedLesson === 'all'
                  ? 'bg-green-100 text-green-800 border-2 border-green-400'
                  : 'bg-white text-gray-700 border border-gray-200'
              }`}
            >
              📚 All Lessons
            </button>
            {lessons.map(l => (
              <button
                key={l.id}
                onClick={() => setSelectedLesson(l.id)}
                className={`w-full rounded-xl p-3 text-left font-semibold transition-transform active:scale-[0.98] ${
                  selectedLesson === l.id
                    ? 'bg-green-100 text-green-800 border-2 border-green-400'
                    : 'bg-white text-gray-700 border border-gray-200'
                }`}
              >
                {l.icon} {l.title}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={startQuiz}
          className="w-full rounded-2xl bg-green-600 py-4 text-center font-bold text-white text-xl transition-transform active:scale-[0.97] shadow-lg"
        >
          ▶️ Start Quiz
        </button>
      </div>
    );
  }

  // Result screen
  if (state === 'result') {
    const percentage = Math.round((correct / questions.length) * 100);
    const emoji = percentage >= 80 ? '🌟' : percentage >= 60 ? '👍' : '💪';
    const message = percentage >= 80 ? 'Excellent!' : percentage >= 60 ? 'Good Job!' : 'Keep going! Practice again.';

    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
        <div className="mb-4 text-6xl">{emoji}</div>
        <h1 className="mb-2 text-3xl font-bold text-green-800">{message}</h1>
        <p className="mb-4 text-xl text-gray-700">
          {correct} / {questions.length} correct
        </p>
        <div className="mb-6 w-full max-w-xs">
          <div className="h-4 rounded-full bg-gray-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-green-500 progress-fill"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="mt-2 text-lg font-bold text-green-700">{percentage}%</p>
        </div>

        <div className="w-full max-w-sm space-y-3">
          <button
            onClick={() => {
              setState('setup');
            }}
            className="block w-full rounded-2xl bg-green-600 py-4 text-center font-bold text-white text-lg transition-transform active:scale-[0.97]"
          >
            🔄 Try Again
          </button>
          <Link
            href="/"
            className="block w-full rounded-2xl bg-white border border-gray-200 py-4 text-center font-bold text-gray-700 text-lg transition-transform active:scale-[0.97]"
          >
            🏠 Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Playing screen
  const currentQ = questions[currentIndex];
  const questionText = mode === 'tagalog-to-italian' ? currentQ.tagalog : currentQ.italian;
  const correctAnswer = mode === 'tagalog-to-italian' ? currentQ.italian : currentQ.tagalog;
  const questionLabel = mode === 'tagalog-to-italian' ? 'What is this in Italian?' : 'What is this in Tagalog?';
  const questionFlag = mode === 'tagalog-to-italian' ? '🇵🇭' : '🇮🇹';

  return (
    <div className="px-4 pt-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => setState('setup')}
          className="text-green-700 font-bold text-lg"
        >
          ← Back
        </button>
        <span className="text-sm font-bold text-gray-500">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      {/* Progress */}
      <div className="mb-6 h-3 rounded-full bg-gray-200 overflow-hidden">
        <div
          className="h-full rounded-full bg-green-500 progress-fill"
          style={{ width: `${(currentIndex / questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="mb-6 rounded-2xl bg-white p-6 shadow-md border border-gray-100 text-center">
        <p className="text-sm font-bold text-gray-500 mb-2">{questionLabel}</p>
        <div className="flex items-center justify-center gap-3">
          <span className="text-3xl">{questionFlag}</span>
          <p className="text-2xl font-bold text-gray-900">{questionText}</p>
          {mode === 'italian-to-tagalog' && (
            <AudioButton text={currentQ.italian} />
          )}
        </div>
      </div>

      {/* Choices */}
      <div className="space-y-3">
        {choices.map((choice, i) => {
          let bgClass = 'bg-white border-gray-200 text-gray-800';

          if (answered) {
            if (choice === correctAnswer) {
              bgClass = 'bg-green-100 border-green-500 text-green-800';
            } else if (choice === selected && choice !== correctAnswer) {
              bgClass = 'bg-red-100 border-red-500 text-red-800';
            }
          }

          return (
            <button
              key={i}
              onClick={() => handleAnswer(choice)}
              disabled={answered}
              className={`w-full rounded-2xl border-2 p-4 text-left font-bold text-lg transition-transform active:scale-[0.98] ${bgClass}`}
            >
              <span className="mr-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-600">
                {String.fromCharCode(65 + i)}
              </span>
              {choice}
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      {answered && (
        <div className="mt-6 card-enter">
          {selected === correctAnswer ? (
            <p className="mb-3 text-center text-lg font-bold text-green-700">
              ✅ Correct!
            </p>
          ) : (
            <p className="mb-3 text-center text-lg font-bold text-red-700">
              ❌ Correct answer: <span className="text-green-700">{correctAnswer}</span>
            </p>
          )}
          <button
            onClick={handleNext}
            className="w-full rounded-2xl bg-green-600 py-4 text-center font-bold text-white text-lg transition-transform active:scale-[0.97]"
          >
            {currentIndex < questions.length - 1 ? 'Next →' : 'See Results'}
          </button>
        </div>
      )}
    </div>
  );
}

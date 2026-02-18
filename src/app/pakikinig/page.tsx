'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { lessons } from '@/data/lessons';
import { PhraseItem } from '@/lib/types';
import { getSettings } from '@/lib/storage';
import { speakItalian } from '@/lib/tts';

type GameState = 'setup' | 'playing' | 'result';
type Difficulty = 'madali' | 'katamtaman' | 'mahirap';

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

function getWrongChoices(correct: PhraseItem, all: PhraseItem[], count: number): string[] {
  const others = all.filter(i => i.id !== correct.id && i.tagalog !== correct.tagalog);
  return shuffle(others).slice(0, count).map(i => i.tagalog);
}

export default function PakikinigPage() {
  const [state, setState] = useState<GameState>('setup');
  const [difficulty, setDifficulty] = useState<Difficulty>('madali');
  const [selectedLesson, setSelectedLesson] = useState<string>('all');
  const [questions, setQuestions] = useState<PhraseItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [choices, setChoices] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [playCount, setPlayCount] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const autoPlayedRef = useRef(false);

  useEffect(() => {
    const settings = getSettings();
    setAudioEnabled(settings.audioEnabled);
  }, []);

  // Number of choices per difficulty
  const choiceCount = difficulty === 'madali' ? 3 : difficulty === 'katamtaman' ? 4 : 5;
  // Max plays per difficulty
  const maxPlays = difficulty === 'madali' ? 3 : difficulty === 'katamtaman' ? 2 : 1;

  const buildChoices = useCallback((item: PhraseItem, all: PhraseItem[]) => {
    const wrongs = getWrongChoices(item, all, choiceCount - 1);
    return shuffle([item.tagalog, ...wrongs]);
  }, [choiceCount]);

  const startGame = useCallback(() => {
    let items: PhraseItem[];
    if (selectedLesson === 'all') {
      items = getAllItems();
    } else {
      const lesson = lessons.find(l => l.id === selectedLesson);
      items = lesson ? lesson.items : getAllItems();
    }
    const picked = shuffle(items).slice(0, 10);
    setQuestions(picked);
    setCurrentIndex(0);
    setCorrect(0);
    setSelected(null);
    setAnswered(false);
    setPlayCount(0);
    autoPlayedRef.current = false;
    setChoices(buildChoices(picked[0], getAllItems()));
    setState('playing');
  }, [selectedLesson, buildChoices]);

  // Auto-play audio when a new question loads
  useEffect(() => {
    if (state === 'playing' && questions.length > 0 && !autoPlayedRef.current) {
      autoPlayedRef.current = true;
      const item = questions[currentIndex];
      if (item && audioEnabled) {
        setTimeout(() => {
          speakItalian(item.italian);
          setPlayCount(1);
        }, 400);
      }
    }
  }, [state, currentIndex, questions, audioEnabled]);

  const handleReplay = () => {
    if (playCount >= maxPlays) return;
    const item = questions[currentIndex];
    if (item && audioEnabled) {
      speakItalian(item.italian);
      setPlayCount(prev => prev + 1);
    }
  };

  const handleAnswer = (choice: string) => {
    if (answered) return;
    setSelected(choice);
    setAnswered(true);
    if (choice === questions[currentIndex].tagalog) {
      setCorrect(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      const next = currentIndex + 1;
      setCurrentIndex(next);
      setSelected(null);
      setAnswered(false);
      setPlayCount(0);
      autoPlayedRef.current = false;
      setChoices(buildChoices(questions[next], getAllItems()));
    } else {
      setState('result');
    }
  };

  // ── Setup screen ──────────────────────────────────────────────
  if (state === 'setup') {
    return (
      <div className="px-4 pt-6 pb-8">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Listening</p>
          <h1 className="text-2xl font-bold text-slate-900">Pakikinig</h1>
          <p className="mt-1 text-sm text-slate-500">
            Pakinggan ang salitang Italyano at piliin ang tamang salin sa Tagalog.
          </p>
        </div>

        {/* Difficulty */}
        <div className="mb-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">Antas ng Kahirapan</p>
          <div className="space-y-2">
            {([
              { value: 'madali', label: 'Madali', desc: '3 pagpipilian · maaaring pakinggan nang 3x', color: 'green' },
              { value: 'katamtaman', label: 'Katamtaman', desc: '4 pagpipilian · maaaring pakinggan nang 2x', color: 'blue' },
              { value: 'mahirap', label: 'Mahirap', desc: '5 pagpipilian · isang beses lang marinig', color: 'red' },
            ] as { value: Difficulty; label: string; desc: string; color: string }[]).map(d => (
              <button
                key={d.value}
                onClick={() => setDifficulty(d.value)}
                className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                  difficulty === d.value
                    ? d.color === 'green'
                      ? 'border-green-400 bg-green-50'
                      : d.color === 'blue'
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-red-400 bg-red-50'
                    : 'border-slate-100 bg-white hover:bg-slate-50'
                }`}
              >
                <p className={`font-semibold text-sm ${
                  difficulty === d.value
                    ? d.color === 'green' ? 'text-green-800' : d.color === 'blue' ? 'text-blue-800' : 'text-red-800'
                    : 'text-slate-800'
                }`}>{d.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{d.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Lesson selection */}
        <div className="mb-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">Aralin</p>
          <div className="space-y-1.5">
            <button
              onClick={() => setSelectedLesson('all')}
              className={`w-full rounded-xl border px-4 py-2.5 text-left text-sm font-semibold transition-colors ${
                selectedLesson === 'all'
                  ? 'border-blue-300 bg-blue-50 text-blue-800'
                  : 'border-slate-100 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              📚 Lahat ng Aralin
            </button>
            {lessons.map(l => (
              <button
                key={l.id}
                onClick={() => setSelectedLesson(l.id)}
                className={`w-full rounded-xl border px-4 py-2.5 text-left text-sm font-semibold transition-colors ${
                  selectedLesson === l.id
                    ? 'border-blue-300 bg-blue-50 text-blue-800'
                    : 'border-slate-100 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {l.icon} {l.title}
              </button>
            ))}
          </div>
        </div>

        {!audioEnabled && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Naka-off ang audio sa Settings. I-on muna bago maglaro.
          </div>
        )}

        <button
          onClick={startGame}
          disabled={!audioEnabled}
          className="w-full rounded-xl bg-blue-600 py-4 text-center font-bold text-white text-base transition-colors hover:bg-blue-700 disabled:opacity-40"
        >
          ▶ Simulan
        </button>
      </div>
    );
  }

  // ── Result screen ─────────────────────────────────────────────
  if (state === 'result') {
    const pct = Math.round((correct / questions.length) * 100);
    const emoji = pct >= 80 ? '🌟' : pct >= 60 ? '👍' : '💪';
    const msg = pct >= 80 ? 'Napakahusay!' : pct >= 60 ? 'Magaling!' : 'Mag-practice pa!';
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
        <div className="mb-3 text-6xl">{emoji}</div>
        <h1 className="mb-1 text-2xl font-bold text-slate-900">{msg}</h1>
        <p className="mb-4 text-slate-500 text-sm">
          {correct} sa {questions.length} ang tama
        </p>
        <div className="mb-6 w-full max-w-xs">
          <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-1.5 text-lg font-bold text-blue-600">{pct}%</p>
        </div>
        <div className="w-full max-w-sm space-y-3">
          <button
            onClick={() => setState('setup')}
            className="w-full rounded-xl bg-blue-600 py-3.5 font-bold text-white text-sm transition-colors hover:bg-blue-700"
          >
            🔄 Subukan Ulit
          </button>
          <Link
            href="/"
            className="block w-full rounded-xl border border-slate-200 bg-white py-3.5 font-bold text-slate-700 text-sm text-center transition-colors hover:bg-slate-50"
          >
            🏠 Bumalik sa Home
          </Link>
        </div>
      </div>
    );
  }

  // ── Playing screen ────────────────────────────────────────────
  const currentQ = questions[currentIndex];
  const playsLeft = maxPlays - playCount;

  return (
    <div className="px-4 pt-4 pb-8">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <button onClick={() => setState('setup')} className="text-sm font-semibold text-slate-500 hover:text-slate-700">
          ← Bumalik
        </button>
        <span className="text-xs font-bold text-slate-400">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-5 h-2 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-blue-500 transition-all"
          style={{ width: `${(currentIndex / questions.length) * 100}%` }}
        />
      </div>

      {/* Audio card */}
      <div className="mb-5 rounded-xl border border-slate-100 bg-white px-6 py-8 text-center shadow-sm">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
          Pakinggan at piliin ang tamang salin
        </p>

        {/* Play button */}
        <button
          onClick={handleReplay}
          disabled={playsLeft <= 0}
          className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full text-4xl shadow-md transition-all active:scale-95 ${
            playsLeft > 0
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-slate-200 cursor-not-allowed'
          }`}
        >
          🔊
        </button>

        <p className="mt-3 text-xs text-slate-400">
          {answered
            ? currentQ.italian
            : playsLeft > 0
            ? `${playsLeft} ${playsLeft === 1 ? 'pagkakataon' : 'pagkakataon'} pa`
            : 'Hindi na maaaring pakinggan ulit'}
        </p>

        {/* Show pronunciation after answering */}
        {answered && (
          <p className="mt-1 text-xs text-slate-400 italic">{currentQ.pronunciation}</p>
        )}
      </div>

      {/* Choices */}
      <div className="space-y-2.5">
        {choices.map((choice, i) => {
          let style = 'border-slate-100 bg-white text-slate-800 hover:bg-slate-50';
          if (answered) {
            if (choice === currentQ.tagalog) {
              style = 'border-green-400 bg-green-50 text-green-800';
            } else if (choice === selected) {
              style = 'border-red-400 bg-red-50 text-red-800';
            }
          }
          return (
            <button
              key={i}
              onClick={() => handleAnswer(choice)}
              disabled={answered}
              className={`w-full rounded-xl border-2 px-4 py-3.5 text-left text-sm font-semibold transition-colors ${style}`}
            >
              <span className="mr-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
                {String.fromCharCode(65 + i)}
              </span>
              {choice}
            </button>
          );
        })}
      </div>

      {/* Feedback + Next */}
      {answered && (
        <div className="mt-5">
          {selected === currentQ.tagalog ? (
            <p className="mb-3 text-center text-sm font-bold text-green-700">✅ Tama!</p>
          ) : (
            <div className="mb-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-center">
              <p className="text-sm font-bold text-red-600">❌ Mali</p>
              <p className="mt-0.5 text-xs text-slate-500">
                Tamang sagot: <span className="font-semibold text-slate-700">{currentQ.tagalog}</span>
              </p>
            </div>
          )}
          <button
            onClick={handleNext}
            className="w-full rounded-xl bg-blue-600 py-3.5 font-bold text-white text-sm transition-colors hover:bg-blue-700"
          >
            {currentIndex < questions.length - 1 ? 'Susunod →' : 'Tingnan ang Resulta'}
          </button>
        </div>
      )}
    </div>
  );
}

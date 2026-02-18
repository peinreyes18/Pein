'use client';

import { useEffect, useState } from 'react';
import { speakItalian, isTTSAvailable } from '@/lib/tts';
import { getSettings } from '@/lib/storage';

interface AudioButtonProps {
  text: string;
  size?: 'small' | 'normal' | 'large';
}

export default function AudioButton({ text, size = 'normal' }: AudioButtonProps) {
  const [available, setAvailable] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    setAvailable(isTTSAvailable());
  }, []);

  if (!available) return null;

  const handlePlay = () => {
    const settings = getSettings();
    if (!settings.audioEnabled) return;

    setPlaying(true);
    speakItalian(text);
    setTimeout(() => setPlaying(false), Math.max(1500, text.length * 100));
  };

  const sizeClasses =
    size === 'large' ? 'w-10 h-10 text-lg' :
    size === 'small' ? 'w-6 h-6 text-xs' :
    'w-8 h-8 text-base';

  return (
    <button
      onClick={handlePlay}
      className={`${sizeClasses} flex-shrink-0 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-all active:scale-95 hover:bg-blue-50 hover:text-blue-600 ${
        playing ? 'animate-pulse ring-2 ring-blue-300' : ''
      }`}
      aria-label={`Listen: ${text}`}
      title="Listen"
    >
      {playing ? '🔊' : '🔈'}
    </button>
  );
}

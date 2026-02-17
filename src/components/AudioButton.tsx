'use client';

import { useEffect, useState } from 'react';
import { speakItalian, isTTSAvailable } from '@/lib/tts';
import { getSettings } from '@/lib/storage';

interface AudioButtonProps {
  text: string;
  size?: 'normal' | 'large';
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
    // Reset after estimated duration
    setTimeout(() => setPlaying(false), Math.max(1500, text.length * 100));
  };

  const sizeClasses = size === 'large'
    ? 'w-16 h-16 text-3xl'
    : 'w-12 h-12 text-2xl';

  return (
    <button
      onClick={handlePlay}
      className={`${sizeClasses} flex items-center justify-center rounded-full bg-green-100 text-green-700 transition-all active:scale-95 hover:bg-green-200 ${
        playing ? 'animate-pulse ring-2 ring-green-400' : ''
      }`}
      aria-label={`Pakinggan: ${text}`}
      title="Pakinggan (Listen)"
    >
      {playing ? '🔊' : '🔈'}
    </button>
  );
}

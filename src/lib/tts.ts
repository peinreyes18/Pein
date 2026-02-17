'use client';

let italianVoice: SpeechSynthesisVoice | null = null;
let voicesLoaded = false;

function loadVoices(): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  const voices = window.speechSynthesis.getVoices();
  // Try to find an Italian voice
  italianVoice =
    voices.find(v => v.lang === 'it-IT') ||
    voices.find(v => v.lang.startsWith('it')) ||
    null;
  voicesLoaded = true;
}

// Voices may load async
if (typeof window !== 'undefined' && window.speechSynthesis) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

export function speakItalian(text: string): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  if (!voicesLoaded) {
    loadVoices();
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'it-IT';
  utterance.rate = 0.8; // Slower for learners
  utterance.pitch = 1;

  if (italianVoice) {
    utterance.voice = italianVoice;
  }

  window.speechSynthesis.speak(utterance);
}

export function isTTSAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

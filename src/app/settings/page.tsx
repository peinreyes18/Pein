'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSettings, saveSettings } from '@/lib/storage';
import { AppSettings } from '@/lib/types';
import { speakItalian } from '@/lib/tts';

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    if (!settings) return;
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveSettings(newSettings);
    // Dispatch event for same-tab components
    window.dispatchEvent(new Event('settingsChanged'));
  };

  if (!settings) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-2xl">Naglo-load...</div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/iba-pa" className="text-green-700 font-bold text-lg">
          ← Bumalik
        </Link>
      </div>

      <h1 className="mb-6 text-2xl font-bold text-green-800">⚙️ Settings</h1>

      {/* Text Size */}
      <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
        <h2 className="mb-3 font-bold text-gray-800 text-lg">📏 Laki ng Teksto</h2>
        <p className="mb-3 text-sm text-gray-500">Piliin ang laki ng teksto na komportable para sa iyo.</p>
        <div className="space-y-2">
          {[
            { value: 'normal' as const, label: 'Normal', preview: 'Ciao!' },
            { value: 'malaki' as const, label: 'Malaki', preview: 'Ciao!' },
            { value: 'mas-malaki' as const, label: 'Mas Malaki', preview: 'Ciao!' },
          ].map(option => (
            <button
              key={option.value}
              onClick={() => updateSetting('textSize', option.value)}
              className={`w-full rounded-xl p-4 text-left transition-transform active:scale-[0.98] ${
                settings.textSize === option.value
                  ? 'bg-green-100 border-2 border-green-400'
                  : 'bg-gray-50 border-2 border-transparent'
              }`}
            >
              <span className="font-bold text-gray-800">{option.label}</span>
              <span className={`ml-3 ${
                option.value === 'normal' ? 'text-base' :
                option.value === 'malaki' ? 'text-lg' : 'text-xl'
              }`}>
                {option.preview}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Audio */}
      <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
        <h2 className="mb-3 font-bold text-gray-800 text-lg">🔊 Audio</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-gray-700">Buksan ang Audio</p>
            <p className="text-sm text-gray-500">Marinig ang tamang bigkas ng Italyano</p>
          </div>
          <button
            onClick={() => updateSetting('audioEnabled', !settings.audioEnabled)}
            className={`relative h-8 w-14 rounded-full transition-colors ${
              settings.audioEnabled ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-md transition-transform ${
                settings.audioEnabled ? 'left-7' : 'left-1'
              }`}
            />
          </button>
        </div>

        {settings.audioEnabled && (
          <button
            onClick={() => speakItalian('Ciao! Come stai?')}
            className="mt-3 w-full rounded-xl bg-green-50 py-3 text-center font-bold text-green-700 transition-transform active:scale-[0.98]"
          >
            🔈 Subukan ang Audio
          </button>
        )}
      </div>

      {/* Daily Goal */}
      <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
        <h2 className="mb-3 font-bold text-gray-800 text-lg">🎯 Daily Goal</h2>
        <p className="mb-3 text-sm text-gray-500">Ilang item ang gusto mong aralin bawat araw?</p>
        <div className="flex gap-2">
          {[5, 10, 15, 20].map(goal => (
            <button
              key={goal}
              onClick={() => updateSetting('dailyGoal', goal)}
              className={`flex-1 rounded-xl py-3 text-center font-bold transition-transform active:scale-[0.98] ${
                settings.dailyGoal === goal
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {goal}
            </button>
          ))}
        </div>
      </div>

      {/* Reset */}
      <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
        <h2 className="mb-3 font-bold text-gray-800 text-lg">🗑️ I-reset ang Data</h2>
        <p className="mb-3 text-sm text-gray-500">Tanggalin lahat ng progreso at magsimula ulit.</p>
        <button
          onClick={() => {
            if (confirm('Sigurado ka bang gusto mong i-reset lahat ng data? Hindi na ito pwedeng ibalik.')) {
              localStorage.removeItem('italiano_progress');
              localStorage.removeItem('italiano_settings');
              window.location.href = '/';
            }
          }}
          className="w-full rounded-xl bg-red-50 py-3 text-center font-bold text-red-600 border border-red-200 transition-transform active:scale-[0.98]"
        >
          I-reset Lahat
        </button>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { Apartment } from '@/app/api/apartments/route';
import {
  getPrefs,
  savePrefs,
  getSeenIds,
  markSeen,
  clearSeen,
  filterApartments,
  playAlertBeep,
  requestNotificationPermission,
  sendBrowserNotification,
  type AlertPrefs,
} from '@/lib/apartmentStorage';

const CITIES = ['Amsterdam', 'Rotterdam', 'Eindhoven', 'Utrecht', 'Delft', 'The Hague', 'Groningen'];
const INTERVALS = [
  { label: '30 sec', value: 30 },
  { label: '1 min', value: 60 },
  { label: '2 min', value: 120 },
  { label: '5 min', value: 300 },
];

type Status = 'idle' | 'polling' | 'error';

interface FetchResult {
  ok: boolean;
  apartments: Apartment[];
  error?: string;
  checkedAt: string;
}

export default function ApartmentsPage() {
  const [mounted, setMounted] = useState(false);
  const [prefs, setPrefs] = useState<AlertPrefs | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [isRunning, setIsRunning] = useState(false);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [nextCheckIn, setNextCheckIn] = useState<number>(0);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>('default');
  const [showSettings, setShowSettings] = useState(false);
  const [newCount, setNewCount] = useState(0);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isRunningRef = useRef(false);

  useEffect(() => {
    setMounted(true);
    setPrefs(getPrefs());
    if ('Notification' in window) setNotifPermission(Notification.permission);
  }, []);

  const fetchApartments = useCallback(async (currentPrefs: AlertPrefs) => {
    setStatus('polling');
    setFetchError(null);

    try {
      const cityParam = currentPrefs.cities.length === 1
        ? `?city=${encodeURIComponent(currentPrefs.cities[0])}`
        : '';
      const res = await fetch(`/api/apartments${cityParam}`, { cache: 'no-store' });
      const data: FetchResult = await res.json();

      if (!data.ok) {
        setStatus('error');
        setFetchError(data.error || 'Unknown error from Holland2stay');
        return;
      }

      const filtered = filterApartments(data.apartments, currentPrefs);
      const seenIds = getSeenIds();
      const discovered = filtered.filter(apt => !seenIds.has(apt.id));

      if (discovered.length > 0) {
        const discoveredIds = discovered.map(a => a.id);
        markSeen(discoveredIds);
        setNewIds(prev => new Set([...prev, ...discoveredIds]));
        setNewCount(c => c + discovered.length);

        if (currentPrefs.soundEnabled) playAlertBeep();

        if (currentPrefs.notificationsEnabled) {
          const first = discovered[0];
          sendBrowserNotification(
            `${discovered.length} new apartment${discovered.length > 1 ? 's' : ''} on Holland2stay!`,
            `${first.title} — ${first.priceStr}${first.city ? ` in ${first.city}` : ''}`,
            first.url,
          );
        }
      }

      // Mark all current listings as seen on first run (seenIds empty = first run)
      if (seenIds.size === 0) {
        markSeen(filtered.map(a => a.id));
      }

      setApartments(filtered);
      setLastChecked(new Date(data.checkedAt));
      setStatus('idle');
    } catch (err) {
      setStatus('error');
      setFetchError(String(err));
    }
  }, []);

  const startPolling = useCallback((currentPrefs: AlertPrefs) => {
    if (isRunningRef.current) return;
    isRunningRef.current = true;
    setIsRunning(true);
    setNewCount(0);

    const tick = () => {
      if (!isRunningRef.current) return;
      fetchApartments(currentPrefs).then(() => {
        if (!isRunningRef.current) return;
        const interval = currentPrefs.pollIntervalSec * 1000;
        setNextCheckIn(currentPrefs.pollIntervalSec);

        if (countdownRef.current) clearInterval(countdownRef.current);
        countdownRef.current = setInterval(() => {
          setNextCheckIn(n => Math.max(0, n - 1));
        }, 1000);

        timerRef.current = setTimeout(tick, interval);
      });
    };

    tick();
  }, [fetchApartments]);

  const stopPolling = useCallback(() => {
    isRunningRef.current = false;
    setIsRunning(false);
    setStatus('idle');
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  }, []);

  // Cleanup on unmount
  useEffect(() => () => stopPolling(), [stopPolling]);

  const handleToggle = () => {
    if (!prefs) return;
    if (isRunning) {
      stopPolling();
    } else {
      startPolling(prefs);
    }
  };

  const updatePrefs = (partial: Partial<AlertPrefs>) => {
    if (!prefs) return;
    const next = { ...prefs, ...partial };
    setPrefs(next);
    savePrefs(next);
    // Restart polling with new prefs if currently running
    if (isRunning) {
      stopPolling();
      setTimeout(() => startPolling(next), 100);
    }
  };

  const toggleCity = (city: string) => {
    if (!prefs) return;
    const lower = city.toLowerCase();
    const cities = prefs.cities.includes(lower)
      ? prefs.cities.filter(c => c !== lower)
      : [...prefs.cities, lower];
    updatePrefs({ cities });
  };

  const handleEnableNotifications = async () => {
    const perm = await requestNotificationPermission();
    setNotifPermission(perm);
    if (perm === 'granted') updatePrefs({ notificationsEnabled: true });
  };

  const handleClearNew = () => {
    setNewIds(new Set());
    setNewCount(0);
    clearSeen();
  };

  if (!mounted || !prefs) return null;

  const statusColor = status === 'polling' ? 'text-amber-500' : status === 'error' ? 'text-red-500' : 'text-slate-400';
  const statusLabel = status === 'polling' ? 'Checking...' : status === 'error' ? 'Error' : isRunning ? `Next in ${nextCheckIn}s` : 'Stopped';

  return (
    <div className="px-5 pt-8 pb-4">

      {/* Header */}
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Holland2stay</p>
        <div className="flex items-start justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Apartment Alerts</h1>
          <button
            onClick={() => setShowSettings(s => !s)}
            className="mt-1 text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showSettings ? 'Hide' : 'Settings'}
          </button>
        </div>
        {lastChecked && (
          <p className="text-xs text-slate-400 mt-1">
            Last checked: {lastChecked.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">

          {/* Cities */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Cities (empty = all)</p>
            <div className="flex flex-wrap gap-2">
              {CITIES.map(city => {
                const active = prefs.cities.includes(city.toLowerCase());
                return (
                  <button
                    key={city}
                    onClick={() => toggleCity(city)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      active
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-400'
                    }`}
                  >
                    {city}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price limit */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Max price: {prefs.maxPrice > 0 ? `€${prefs.maxPrice}/mo` : 'No limit'}
            </p>
            <input
              type="range"
              min={0}
              max={3000}
              step={50}
              value={prefs.maxPrice}
              onChange={e => updatePrefs({ maxPrice: Number(e.target.value) })}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-0.5">
              <span>No limit</span><span>€3000</span>
            </div>
          </div>

          {/* Bedrooms */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Min bedrooms</p>
            <div className="flex gap-2">
              {[0, 1, 2, 3, 4].map(n => (
                <button
                  key={n}
                  onClick={() => updatePrefs({ minBedrooms: n })}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                    prefs.minBedrooms === n
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-400'
                  }`}
                >
                  {n === 0 ? 'Any' : n}
                </button>
              ))}
            </div>
          </div>

          {/* Poll interval */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Check every</p>
            <div className="flex gap-2">
              {INTERVALS.map(iv => (
                <button
                  key={iv.value}
                  onClick={() => updatePrefs({ pollIntervalSec: iv.value })}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    prefs.pollIntervalSec === iv.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-400'
                  }`}
                >
                  {iv.label}
                </button>
              ))}
            </div>
          </div>

          {/* Alerts */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Alerts</p>

            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => updatePrefs({ soundEnabled: !prefs.soundEnabled })}
                className={`w-9 h-5 rounded-full transition-colors relative ${prefs.soundEnabled ? 'bg-blue-600' : 'bg-slate-200'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${prefs.soundEnabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-sm text-slate-700">Sound alert</span>
            </label>

            {notifPermission === 'granted' ? (
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => updatePrefs({ notificationsEnabled: !prefs.notificationsEnabled })}
                  className={`w-9 h-5 rounded-full transition-colors relative ${prefs.notificationsEnabled ? 'bg-blue-600' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${prefs.notificationsEnabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </div>
                <span className="text-sm text-slate-700">Push notifications</span>
              </label>
            ) : (
              <button
                onClick={handleEnableNotifications}
                className="text-sm text-blue-600 font-medium hover:underline"
              >
                Enable push notifications →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Start / Stop button */}
      <button
        onClick={handleToggle}
        className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all mb-4 ${
          isRunning
            ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
            : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98]'
        }`}
      >
        {isRunning ? 'Stop monitoring' : 'Start monitoring'}
      </button>

      {/* Status bar */}
      <div className="flex items-center justify-between mb-5 px-1">
        <div className="flex items-center gap-2">
          {isRunning && (
            <span className={`inline-block w-2 h-2 rounded-full ${status === 'polling' ? 'bg-amber-400 animate-pulse' : 'bg-green-400'}`} />
          )}
          <span className={`text-xs font-medium ${statusColor}`}>{statusLabel}</span>
        </div>
        {newCount > 0 && (
          <button onClick={handleClearNew} className="text-xs text-slate-400 hover:text-slate-600">
            Clear {newCount} new
          </button>
        )}
      </div>

      {/* Error banner */}
      {fetchError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-xs font-semibold text-red-700 mb-1">Could not reach Holland2stay</p>
          <p className="text-xs text-red-600">{fetchError}</p>
          <p className="text-xs text-red-500 mt-2">
            The site may be temporarily blocking requests. Try again in a few minutes.
          </p>
        </div>
      )}

      {/* New listing alert banner */}
      {newCount > 0 && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-green-800">
              {newCount} new listing{newCount !== 1 ? 's' : ''} found!
            </p>
            <p className="text-xs text-green-600 mt-0.5">Highlighted below in green</p>
          </div>
          <span className="text-2xl">🏠</span>
        </div>
      )}

      {/* Listings */}
      {apartments.length === 0 && !fetchError && (
        <div className="text-center py-16 text-slate-400">
          {isRunning ? (
            <p className="text-sm">Fetching listings...</p>
          ) : (
            <div>
              <p className="text-4xl mb-3">🏠</p>
              <p className="text-sm font-medium text-slate-500">Press start to begin monitoring</p>
              <p className="text-xs text-slate-400 mt-1">
                You&apos;ll be alerted the moment a new apartment appears
              </p>
            </div>
          )}
        </div>
      )}

      <div className="space-y-3">
        {apartments.map(apt => {
          const isNew = newIds.has(apt.id);
          return (
            <a
              key={apt.id}
              href={apt.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`block rounded-xl border p-4 transition-all hover:shadow-sm active:scale-[0.99] ${
                isNew
                  ? 'border-green-300 bg-green-50'
                  : 'border-slate-100 bg-white hover:border-slate-200'
              }`}
            >
              {isNew && (
                <span className="inline-block mb-2 rounded-full bg-green-500 px-2 py-0.5 text-xs font-semibold text-white">
                  NEW
                </span>
              )}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 text-sm leading-snug truncate">{apt.title}</p>
                  {apt.city && (
                    <p className="text-xs text-slate-500 mt-0.5">{apt.city}</p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-semibold text-slate-900 text-sm">{apt.priceStr}</p>
                  {apt.priceStr !== 'Check listing' && (
                    <p className="text-xs text-slate-400">/mo</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 mt-2.5 flex-wrap">
                {apt.bedrooms !== null && (
                  <span className="text-xs text-slate-500 bg-slate-100 rounded-md px-2 py-0.5">
                    {apt.bedrooms} bed{apt.bedrooms !== 1 ? 's' : ''}
                  </span>
                )}
                {apt.surface && (
                  <span className="text-xs text-slate-500 bg-slate-100 rounded-md px-2 py-0.5">
                    {apt.surface}
                  </span>
                )}
                {apt.availableFrom && (
                  <span className="text-xs text-slate-500 bg-slate-100 rounded-md px-2 py-0.5">
                    From {apt.availableFrom}
                  </span>
                )}
                <span className="ml-auto text-xs text-blue-600 font-medium">View →</span>
              </div>
            </a>
          );
        })}
      </div>

      {apartments.length > 0 && (
        <p className="text-center text-xs text-slate-400 mt-6">
          {apartments.length} listing{apartments.length !== 1 ? 's' : ''} matched your filters
        </p>
      )}
    </div>
  );
}

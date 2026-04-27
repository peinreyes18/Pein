import type { Apartment } from '@/app/api/apartments/route';

export interface AlertPrefs {
  cities: string[];        // empty = all cities
  maxPrice: number;        // 0 = no limit
  minBedrooms: number;     // 0 = any
  pollIntervalSec: number; // default 60
  soundEnabled: boolean;
  notificationsEnabled: boolean;
}

export interface SeenListing {
  id: string;
  seenAt: string;
}

const PREFS_KEY = 'h2s_alert_prefs';
const SEEN_KEY = 'h2s_seen_listings';

export function getPrefs(): AlertPrefs {
  if (typeof window === 'undefined') return defaultPrefs();
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? { ...defaultPrefs(), ...JSON.parse(raw) } : defaultPrefs();
  } catch {
    return defaultPrefs();
  }
}

export function savePrefs(prefs: AlertPrefs): void {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

export function getSeenIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    const arr: SeenListing[] = raw ? JSON.parse(raw) : [];
    return new Set(arr.map(s => s.id));
  } catch {
    return new Set();
  }
}

export function markSeen(ids: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    const existing: SeenListing[] = raw ? JSON.parse(raw) : [];
    const existingIds = new Set(existing.map(s => s.id));
    const now = new Date().toISOString();
    const added = ids.filter(id => !existingIds.has(id)).map(id => ({ id, seenAt: now }));
    // Keep last 500 to avoid unbounded growth
    const updated = [...existing, ...added].slice(-500);
    localStorage.setItem(SEEN_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export function clearSeen(): void {
  localStorage.removeItem(SEEN_KEY);
}

export function filterApartments(apartments: Apartment[], prefs: AlertPrefs): Apartment[] {
  return apartments.filter(apt => {
    if (prefs.cities.length > 0) {
      const aptCity = apt.city.toLowerCase();
      if (!prefs.cities.some(c => aptCity.includes(c.toLowerCase()))) return false;
    }
    if (prefs.maxPrice > 0 && apt.price > 0 && apt.price > prefs.maxPrice) return false;
    if (prefs.minBedrooms > 0 && apt.bedrooms !== null && apt.bedrooms < prefs.minBedrooms) return false;
    return true;
  });
}

function defaultPrefs(): AlertPrefs {
  return {
    cities: [],
    maxPrice: 0,
    minBedrooms: 0,
    pollIntervalSec: 60,
    soundEnabled: true,
    notificationsEnabled: false,
  };
}

// Generate a short alert beep using Web Audio API — no external files needed
export function playAlertBeep(): void {
  if (typeof window === 'undefined') return;
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const schedule = (freq: number, start: number, dur: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + dur);
    };
    schedule(880, 0, 0.15);
    schedule(1100, 0.18, 0.15);
    schedule(1320, 0.36, 0.25);
  } catch {
    // Audio context not available
  }
}

export function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return Promise.resolve('denied');
  return Notification.requestPermission();
}

export function sendBrowserNotification(title: string, body: string, url: string): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const n = new Notification(title, {
    body,
    icon: '/icon.svg',
    tag: 'h2s-alert',
    requireInteraction: true,
  });
  n.onclick = () => {
    window.open(url, '_blank');
    n.close();
  };
}

/**
 * Holland2stay Apartment Monitor
 *
 * Sends a phone notification (ntfy.sh or Telegram) the moment a new
 * apartment matching your criteria appears on Holland2stay.
 *
 * ── Quick start ──────────────────────────────────────────────────────────────
 *
 *  1. Install the free "ntfy" app on your phone (iOS or Android).
 *     Open it and subscribe to a topic — pick any unique name, e.g.:
 *       pein-apartments-2024
 *
 *  2. Create a file called ".env" in the project root (next to package.json):
 *       NTFY_TOPIC=pein-apartments-2024
 *
 *  3. Run the monitor:
 *       node --env-file=.env scripts/monitor.mjs
 *
 *  4. Keep the terminal open. You'll get a phone notification the instant
 *     a new matching apartment appears.
 *
 * ── Configuration ────────────────────────────────────────────────────────────
 *
 *  All settings are controlled via environment variables (in .env or shell):
 *
 *   NTFY_TOPIC          Your ntfy topic name (e.g. pein-apartments-2024)
 *   TELEGRAM_TOKEN      Telegram bot token (alternative to ntfy)
 *   TELEGRAM_CHAT_ID    Your Telegram chat ID (used with TELEGRAM_TOKEN)
 *   CITIES              Comma-separated city list (default: see below)
 *   MAX_PRICE           Maximum monthly rent in euros (default: 1300)
 *   INTERVAL_SECONDS    How often to check in seconds (default: 60)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, '..');
const SEEN_FILE = join(ROOT, 'data', 'seen-listings.json');

// ── Your personal filter settings (change these or use .env) ─────────────────

const CITIES = (process.env.CITIES || 'utrecht,amsterdam,nieuwegein,zeist,hilversum')
  .split(',').map(c => c.trim().toLowerCase()).filter(Boolean);

const MAX_PRICE = Number(process.env.MAX_PRICE || 1300);
const INTERVAL_MS = Number(process.env.INTERVAL_SECONDS || 60) * 1000;

const NTFY_TOPIC      = process.env.NTFY_TOPIC || '';
const TELEGRAM_TOKEN  = process.env.TELEGRAM_TOKEN || '';
const TELEGRAM_CHAT   = process.env.TELEGRAM_CHAT_ID || '';

// ONE_SHOT=1 is set automatically by GitHub Actions — runs once then exits
const ONE_SHOT = process.env.ONE_SHOT === '1';

// ─────────────────────────────────────────────────────────────────────────────

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9,nl;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
  'Sec-Ch-Ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
  'Sec-Ch-Ua-Mobile': '?0',
  'Sec-Ch-Ua-Platform': '"Windows"',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': '1',
};

// ── State persistence ─────────────────────────────────────────────────────────

function loadSeen() {
  if (!existsSync(SEEN_FILE)) return new Set();
  try {
    return new Set(JSON.parse(readFileSync(SEEN_FILE, 'utf8')));
  } catch { return new Set(); }
}

function saveSeen(seen) {
  mkdirSync(join(ROOT, 'data'), { recursive: true });
  writeFileSync(SEEN_FILE, JSON.stringify([...seen], null, 2));
}

// ── Parsing ───────────────────────────────────────────────────────────────────

function slugify(str) {
  return String(str).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function parsePrice(raw) {
  // Handles €1.200,- (Dutch) and €1200 (international)
  const cleaned = String(raw).replace(/[€\s]/g, '').replace(/\.(?=\d{3})/g, '').replace(',', '.');
  const n = parseFloat(cleaned.replace(/[^0-9.]/g, ''));
  return isNaN(n) ? 0 : Math.round(n);
}

function parseListings(html) {
  // Strategy 1 — Next.js SSR JSON blob
  const nextMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
  if (nextMatch) {
    try {
      const root = JSON.parse(nextMatch[1]);
      const pp = root?.props?.pageProps;
      const arr = pp?.residences ?? pp?.apartments ?? pp?.listings ?? pp?.products;
      if (Array.isArray(arr) && arr.length > 0) return arr.map(normalizeSSRItem);
    } catch { /* fall through */ }
  }

  // Strategy 2 — JSON-LD structured data
  const ldItems = [];
  for (const [, raw] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const d = JSON.parse(raw);
      const items = Array.isArray(d) ? d : d['@graph'] ? d['@graph'] : [d];
      for (const item of items) {
        if (!['Apartment', 'ApartmentComplex', 'Residence', 'Product'].includes(item['@type'])) continue;
        const price = parsePrice(item.offers?.price ?? 0);
        ldItems.push({
          id: slugify(item.name || ldItems.length),
          title: item.name || 'Apartment',
          city: item.address?.addressLocality || '',
          price,
          priceStr: price > 0 ? `€${price}` : 'Check listing',
          url: item.url || 'https://holland2stay.com/residences',
          bedrooms: item.numberOfRooms ?? null,
          surface: item.floorSize?.value ? `${item.floorSize.value} m²` : null,
        });
      }
    } catch { /* skip bad JSON */ }
  }
  if (ldItems.length > 0) return ldItems;

  // Strategy 3 — scrape every /residences/ link from the HTML
  return scrapeLinks(html);
}

function normalizeSSRItem(item, idx) {
  const title = String(item.title ?? item.name ?? item.address ?? `Apartment ${idx + 1}`);
  const priceRaw = String(item.price ?? item.rent ?? item.monthly_price ?? 0);
  const price = parsePrice(priceRaw);
  const slug = String(item.slug ?? item.id ?? slugify(title));
  const rawUrl = String(item.url ?? item.link ?? `/residences/${slug}`);
  return {
    id: slug,
    title,
    city: String(item.city ?? item.location ?? item.region ?? ''),
    price,
    priceStr: `€${price}`,
    url: rawUrl.startsWith('http') ? rawUrl : `https://holland2stay.com${rawUrl}`,
    bedrooms: typeof item.bedrooms === 'number' ? item.bedrooms : null,
    surface: item.surface ? String(item.surface) : null,
  };
}

function scrapeLinks(html) {
  const seen = new Set();
  const results = [];

  for (const [, link] of html.matchAll(/href="(https?:\/\/holland2stay\.com\/residences\/[^"#?]+)"/g)) {
    if (seen.has(link)) continue;
    seen.add(link);

    const i = html.indexOf(`href="${link}"`);
    const chunk = html.slice(Math.max(0, i - 600), i + 600);

    const priceMatch  = chunk.match(/€\s*[\d.,]+/);
    const priceStr    = priceMatch ? priceMatch[0].replace(/\s/g, '') : '';
    const price       = priceStr ? parsePrice(priceStr) : 0;

    const titleMatch  = chunk.match(/alt="([^"]{5,80})"/)
                     || chunk.match(/<h[1-6][^>]*>([^<]{5,80})<\/h[1-6]>/);
    const title       = titleMatch
                     ? titleMatch[1].trim()
                     : link.split('/').pop()?.replace(/-/g, ' ') || 'Apartment';

    const parts   = link.replace('https://holland2stay.com/residences/', '').split('/');
    const city    = parts.length > 1 ? parts[0].replace(/-/g, ' ') : '';

    const bedMatch  = chunk.match(/(\d+)\s*(bedroom|slaapkamer|kamer)/i);
    const bedrooms  = bedMatch ? parseInt(bedMatch[1]) : null;

    const m2Match = chunk.match(/(\d+)\s*m[²2]/i);
    const surface = m2Match ? `${m2Match[1]} m²` : null;

    results.push({
      id: slugify(link.replace('https://holland2stay.com/residences/', '')),
      title,
      city,
      price,
      priceStr: priceStr || 'Check listing',
      url: link,
      bedrooms,
      surface,
    });
  }

  return results;
}

function matchesFilter(apt) {
  const cityOk = CITIES.length === 0
    || CITIES.some(c => apt.city.toLowerCase().includes(c) || apt.title.toLowerCase().includes(c));
  const priceOk = MAX_PRICE === 0 || apt.price === 0 || apt.price <= MAX_PRICE;
  return cityOk && priceOk;
}

// ── Notifications ─────────────────────────────────────────────────────────────

function formatDetails(apt) {
  return [
    apt.city              ? `📍 ${apt.city}`                                      : null,
    apt.priceStr !== 'Check listing' ? `💶 ${apt.priceStr}/month`                 : null,
    apt.bedrooms != null  ? `🛏 ${apt.bedrooms} bedroom${apt.bedrooms !== 1 ? 's' : ''}` : null,
    apt.surface           ? `📐 ${apt.surface}`                                   : null,
  ].filter(Boolean).join('  ·  ');
}

async function sendNtfy(apt) {
  if (!NTFY_TOPIC) return;
  try {
    await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Priority: 'urgent', Tags: 'house' },
      body: JSON.stringify({
        topic:   NTFY_TOPIC,
        title:   `🏠 New: ${apt.title}`,
        message: formatDetails(apt) || 'Tap to view listing',
        actions: [{ action: 'view', label: 'Open listing', url: apt.url }],
        click:   apt.url,
      }),
    });
  } catch (err) {
    console.error('  ntfy error:', err.message);
  }
}

async function sendTelegram(apt) {
  if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT) return;
  const text = [
    `🏠 *New apartment on Holland2stay!*`,
    ``,
    `*${apt.title}*`,
    apt.city              ? `📍 ${apt.city}`      : null,
    apt.priceStr !== 'Check listing' ? `💶 ${apt.priceStr}/month` : null,
    apt.bedrooms != null  ? `🛏 ${apt.bedrooms} bedroom${apt.bedrooms !== 1 ? 's' : ''}` : null,
    apt.surface           ? `📐 ${apt.surface}`   : null,
    ``,
    `[View listing →](${apt.url})`,
  ].filter(s => s !== null).join('\n');

  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT, text, parse_mode: 'Markdown' }),
    });
  } catch (err) {
    console.error('  Telegram error:', err.message);
  }
}

// ── Core check ────────────────────────────────────────────────────────────────

async function check() {
  const ts = new Date().toLocaleTimeString('en-GB');
  process.stdout.write(`[${ts}] Checking Holland2stay... `);

  let html;
  try {
    const res = await fetch('https://holland2stay.com/residences', {
      headers: BROWSER_HEADERS,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} — site may be blocking server requests`);
    html = await res.text();
  } catch (err) {
    console.log(`❌  ${err.message}`);
    return;
  }

  const all      = parseListings(html);
  const filtered = all.filter(matchesFilter);
  const seen     = loadSeen();
  const isFirstRun = seen.size === 0;

  if (isFirstRun) {
    // On first run just record everything as seen — don't flood with notifications
    for (const apt of filtered) seen.add(apt.id);
    saveSeen(seen);
    console.log(`✓  First run — recorded ${filtered.length} existing listing${filtered.length !== 1 ? 's' : ''} as seen`);
    return;
  }

  const newOnes = filtered.filter(apt => !seen.has(apt.id));

  if (newOnes.length === 0) {
    console.log(`✓  ${filtered.length} listing${filtered.length !== 1 ? 's' : ''} matched, none new`);
    return;
  }

  console.log(`\n🚨  ${newOnes.length} NEW listing${newOnes.length !== 1 ? 's' : ''} found!\n`);
  for (const apt of newOnes) {
    console.log(`  → ${apt.title}`);
    console.log(`     ${formatDetails(apt) || apt.url}`);
    console.log(`     ${apt.url}\n`);
    seen.add(apt.id);
    await sendNtfy(apt);
    await sendTelegram(apt);
  }

  saveSeen(seen);
}

// ── Entry point ───────────────────────────────────────────────────────────────

if (!NTFY_TOPIC && !(TELEGRAM_TOKEN && TELEGRAM_CHAT)) {
  console.error('');
  console.error('No notification method configured. Please set up one of:');
  console.error('');
  console.error('  Option A — ntfy (recommended, free):');
  console.error('    1. Install "ntfy" app on your phone');
  console.error('    2. Subscribe to any topic name, e.g.:  my-apartment-alerts');
  console.error('    3. Add to .env:  NTFY_TOPIC=my-apartment-alerts');
  console.error('');
  console.error('  Option B — Telegram:');
  console.error('    1. Message @BotFather on Telegram → /newbot → copy the token');
  console.error('    2. Message your bot once, then visit:');
  console.error('       https://api.telegram.org/bot<TOKEN>/getUpdates');
  console.error('       Copy the "id" from "chat" — that is your TELEGRAM_CHAT_ID');
  console.error('    3. Add to .env:');
  console.error('         TELEGRAM_TOKEN=1234567890:ABC...');
  console.error('         TELEGRAM_CHAT_ID=123456789');
  console.error('');
  process.exit(1);
}

console.log('');
console.log('═══════════════════════════════════════════');
console.log('  Holland2stay Monitor');
console.log('═══════════════════════════════════════════');
console.log(`  Cities   : ${CITIES.join(', ')}`);
console.log(`  Max rent : €${MAX_PRICE}/month`);
console.log(`  Interval : every ${INTERVAL_MS / 1000}s`);
if (NTFY_TOPIC)     console.log(`  Alerts   : ntfy.sh/${NTFY_TOPIC}`);
if (TELEGRAM_TOKEN) console.log(`  Alerts   : Telegram`);
console.log('═══════════════════════════════════════════');
console.log('');

if (ONE_SHOT) {
  await check();
} else {
  await check();
  setInterval(check, INTERVAL_MS);
}

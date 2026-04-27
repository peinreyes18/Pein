import { NextRequest, NextResponse } from 'next/server';

export interface Apartment {
  id: string;
  title: string;
  city: string;
  price: number;
  priceStr: string;
  bedrooms: number | null;
  surface: string | null;
  url: string;
  imageUrl: string | null;
  availableFrom: string | null;
  type: string | null;
}

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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city') || '';
  const debug = searchParams.get('debug') === '1';

  try {
    const baseUrl = 'https://holland2stay.com/residences';
    const url = city ? `${baseUrl}?city=${encodeURIComponent(city)}` : baseUrl;

    const response = await fetch(url, {
      headers: BROWSER_HEADERS,
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json({
        ok: false,
        error: `Holland2stay returned HTTP ${response.status}. The site may be blocking automated requests.`,
        apartments: [],
        checkedAt: new Date().toISOString(),
      });
    }

    const html = await response.text();
    const apartments = parseApartments(html);

    return NextResponse.json({
      ok: true,
      apartments,
      count: apartments.length,
      checkedAt: new Date().toISOString(),
      ...(debug ? { rawHtml: html.slice(0, 5000) } : {}),
    });
  } catch (err) {
    return NextResponse.json({
      ok: false,
      error: String(err),
      apartments: [],
      checkedAt: new Date().toISOString(),
    });
  }
}

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function parsePrice(raw: string): number {
  // Handle both Dutch (€1.200,-) and international (€1200) formats
  const cleaned = raw.replace(/[€$\s.]/g, '').replace(',', '.');
  const num = parseFloat(cleaned.replace(/[^0-9.]/g, ''));
  return isNaN(num) ? 0 : Math.round(num);
}

function parseApartments(html: string): Apartment[] {
  // Strategy 1: Next.js SSR data blob
  const nextData = tryParseNextData(html);
  if (nextData.length > 0) return nextData;

  // Strategy 2: JSON-LD structured data
  const jsonLd = tryParseJsonLd(html);
  if (jsonLd.length > 0) return jsonLd;

  // Strategy 3: HTML pattern extraction
  return tryParseHtml(html);
}

function tryParseNextData(html: string): Apartment[] {
  const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
  if (!match) return [];

  try {
    const data = JSON.parse(match[1]);
    // Traverse common data paths
    const candidates = [
      data?.props?.pageProps?.residences,
      data?.props?.pageProps?.apartments,
      data?.props?.pageProps?.listings,
      data?.props?.pageProps?.products,
      data?.props?.pageProps?.items,
    ].find(Array.isArray);

    if (!candidates) return [];

    return candidates.map((item: Record<string, unknown>, idx: number) => normalizeNextItem(item, idx));
  } catch {
    return [];
  }
}

function normalizeNextItem(item: Record<string, unknown>, idx: number): Apartment {
  const title = String(item.title || item.name || item.address || `Apartment ${idx + 1}`);
  const city = String(item.city || item.location || item.region || '');
  const priceRaw = String(item.price || item.rent || item.monthly_price || '0');
  const price = parsePrice(priceRaw);
  const slug = String(item.slug || item.id || slugify(title));
  const url = String(item.url || item.link || `/residences/${slug}`);

  return {
    id: slug,
    title,
    city,
    price,
    priceStr: priceRaw.includes('€') ? priceRaw : `€${price}`,
    bedrooms: typeof item.bedrooms === 'number' ? item.bedrooms : null,
    surface: item.surface ? String(item.surface) : null,
    url: url.startsWith('http') ? url : `https://holland2stay.com${url}`,
    imageUrl: item.image ? String(item.image) : null,
    availableFrom: item.available_from ? String(item.available_from) : null,
    type: item.type ? String(item.type) : null,
  };
}

function tryParseJsonLd(html: string): Apartment[] {
  const results: Apartment[] = [];
  const matches = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];

  for (const match of matches) {
    try {
      const data = JSON.parse(match[1]);
      const items = Array.isArray(data) ? data : data['@graph'] ? data['@graph'] : [data];

      for (const item of items) {
        const type = item['@type'];
        if (!type || !['Apartment', 'ApartmentComplex', 'Residence', 'Product', 'Offer'].includes(type)) continue;

        const name = item.name || item.description || '';
        const priceSpec = item.offers?.price || item.priceSpecification?.price || '';
        const price = parsePrice(String(priceSpec));

        results.push({
          id: slugify(name || String(results.length)),
          title: name,
          city: item.address?.addressLocality || '',
          price,
          priceStr: priceSpec ? `€${price}` : 'Check listing',
          bedrooms: item.numberOfRooms ?? null,
          surface: item.floorSize?.value ? `${item.floorSize.value} m²` : null,
          url: item.url || 'https://holland2stay.com/residences',
          imageUrl: item.image?.url || item.image || null,
          availableFrom: null,
          type: type,
        });
      }
    } catch {
      continue;
    }
  }

  return results;
}

function tryParseHtml(html: string): Apartment[] {
  const apartments: Apartment[] = [];

  // Extract links to /residences/ pages — each is a listing
  const linkPattern = /href="(https?:\/\/holland2stay\.com\/residences\/[^"]+)"/g;
  const seen = new Set<string>();
  const links = [...html.matchAll(linkPattern)].map(m => m[1]).filter(u => {
    if (seen.has(u)) return false;
    seen.add(u);
    return true;
  });

  for (const link of links) {
    // Try to grab surrounding context (up to 800 chars before/after the href)
    const idx = html.indexOf(`href="${link}"`);
    if (idx === -1) continue;
    const chunk = html.slice(Math.max(0, idx - 400), idx + 400);

    // Extract price
    const priceMatch = chunk.match(/€\s*[\d.,]+/);
    const priceStr = priceMatch ? priceMatch[0].replace(/\s/g, '') : '';
    const price = priceStr ? parsePrice(priceStr) : 0;

    // Extract title from alt text, aria-label, or heading tags
    const titleMatch =
      chunk.match(/alt="([^"]{5,80})"/) ||
      chunk.match(/aria-label="([^"]{5,80})"/) ||
      chunk.match(/<h[1-6][^>]*>([^<]{5,80})<\/h[1-6]>/);
    const title = titleMatch ? titleMatch[1].trim() : link.split('/').pop()?.replace(/-/g, ' ') || 'Apartment';

    // Extract city from URL path
    const urlParts = link.replace('https://holland2stay.com/residences/', '').split('/');
    const city = urlParts.length > 1 ? urlParts[0].replace(/-/g, ' ') : '';

    // Bedrooms
    const bedroomMatch = chunk.match(/(\d+)\s*(bedroom|slaapkamer|kamer|room)/i);
    const bedrooms = bedroomMatch ? parseInt(bedroomMatch[1]) : null;

    // Surface
    const surfaceMatch = chunk.match(/(\d+)\s*m[²2]/i);
    const surface = surfaceMatch ? `${surfaceMatch[1]} m²` : null;

    // Image
    const imgMatch = chunk.match(/src="(https?:\/\/[^"]*\.(jpg|jpeg|png|webp)[^"]*)"/);
    const imageUrl = imgMatch ? imgMatch[1] : null;

    apartments.push({
      id: slugify(link.replace('https://holland2stay.com/residences/', '')),
      title,
      city,
      price,
      priceStr: priceStr || 'Check listing',
      bedrooms,
      surface,
      url: link,
      imageUrl,
      availableFrom: null,
      type: null,
    });
  }

  return apartments;
}

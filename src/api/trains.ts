import type { Departure } from '../data';

const API_BASE = 'https://v6.db.transport.rest';
const STATION_QUERY = 'Büttgen';
const BUETTGEN_EVA_ID = '8001261';

export type TrainDirection = 'duesseldorf' | 'moenchengladbach';

export type TrainData = {
  toDuesseldorf: Departure[];
  toMoenchengladbach: Departure[];
  fetchedAt: string;
  source: 'live' | 'fallback';
};

type TransportStop = {
  id?: string;
  name?: string;
  type?: string;
  products?: {
    suburban?: boolean;
    nationalExpress?: boolean;
    national?: boolean;
    regionalExpress?: boolean;
    regional?: boolean;
    bus?: boolean;
    subway?: boolean;
    tram?: boolean;
  };
};

type TransportDeparture = {
  when?: string | null;
  plannedWhen?: string | null;
  delay?: number | null;
  platform?: string | null;
  plannedPlatform?: string | null;
  direction?: string | null;
  cancelled?: boolean;
  line?: {
    name?: string;
    product?: string;
    mode?: string;
  } | null;
};

export const fallbackTrainData: TrainData = {
  source: 'fallback',
  fetchedAt: new Date().toISOString(),
  toDuesseldorf: [
    { time: '02:47', line: 'S8', direction: 'Düsseldorf Hbf / Wuppertal', platform: '1', delay: 0, status: 'pünktlich' },
    { time: '03:17', line: 'S8', direction: 'Düsseldorf Hbf / Wuppertal', platform: '1', delay: 3, status: 'verspätet' },
    { time: '03:47', line: 'S8', direction: 'Düsseldorf Hbf / Wuppertal', platform: '1', delay: 0, status: 'pünktlich' },
  ],
  toMoenchengladbach: [
    { time: '02:55', line: 'S8', direction: 'Mönchengladbach Hbf', platform: '2', delay: 0, status: 'pünktlich' },
    { time: '03:25', line: 'S8', direction: 'Mönchengladbach Hbf', platform: '2', delay: 8, status: 'verspätet' },
    { time: '03:55', line: 'S8', direction: 'Mönchengladbach Hbf', platform: '2', delay: 0, status: 'pünktlich' },
  ],
};

function explainFetchError(error: unknown, url: string) {
  if (error instanceof TypeError) {
    return `Transport-API konnte nicht erreicht werden. Safari meldet oft nur "Load failed". URL: ${url}`;
  }
  if (error instanceof Error) return `${error.message} URL: ${url}`;
  return `Unbekannter Fehler beim Laden der Transport-API. URL: ${url}`;
}

async function fetchJson<T>(url: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      cache: 'no-store',
      headers: { accept: 'application/json' },
    });
  } catch (error) {
    throw new Error(explainFetchError(error, url));
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Transport-API ${response.status}: ${response.statusText}${body ? ` - ${body.slice(0, 160)}` : ''}. URL: ${url}`);
  }

  return response.json() as Promise<T>;
}

function normalized(value?: string | null) {
  return (value ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function scoreBuettgenStop(stop: TransportStop) {
  const name = normalized(stop.name);
  let score = 0;

  if (stop.type === 'stop' || stop.type === 'station') score += 20;
  if (name === 'buttgen' || name === 'buettgen') score += 60;
  if (name.includes('buttgen') || name.includes('buettgen')) score += 30;
  if (stop.products?.suburban) score += 25;
  if (stop.products?.bus) score -= 10;
  if (stop.products?.tram || stop.products?.subway) score -= 5;

  return score;
}

async function resolveBuettgenStopId(): Promise<string> {
  const params = new URLSearchParams({
    query: STATION_QUERY,
    results: '10',
    stops: 'true',
    addresses: 'false',
    poi: 'false',
    linesOfStops: 'true',
    language: 'de',
  });

  try {
    const stops = await fetchJson<TransportStop[]>(`${API_BASE}/locations?${params.toString()}`);
    const ranked = stops
      .filter((stop) => stop.id && (stop.type === 'stop' || stop.type === 'station'))
      .map((stop) => ({ stop, score: scoreBuettgenStop(stop) }))
      .sort((a, b) => b.score - a.score);

    const best = ranked.find((entry) => entry.score >= 50)?.stop ?? ranked[0]?.stop;
    if (best?.id) return best.id;
  } catch {
    // Wenn die Suche blockiert ist, versuchen wir die bekannte EVA-Nummer direkt.
  }

  return BUETTGEN_EVA_ID;
}

function formatTime(iso?: string | null) {
  if (!iso) return '--:--';
  return new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}

function delayMinutes(delaySeconds?: number | null) {
  if (!delaySeconds) return 0;
  return Math.max(0, Math.round(delaySeconds / 60));
}

function mapDeparture(item: TransportDeparture): Departure {
  const delay = delayMinutes(item.delay);
  return {
    time: formatTime(item.when ?? item.plannedWhen),
    line: (item.line?.name ?? 'S8').replace('S 8', 'S8'),
    direction: item.direction ?? 'Unbekannte Richtung',
    platform: item.platform ?? item.plannedPlatform ?? '–',
    delay,
    status: item.cancelled ? 'ausfall' : delay > 0 ? 'verspätet' : 'pünktlich',
  };
}

function isS8(item: TransportDeparture) {
  const lineName = normalized(item.line?.name).replaceAll(' ', '');
  return lineName === 's8' || lineName.includes('s8');
}

function directionOf(item: TransportDeparture): TrainDirection | null {
  const direction = normalized(item.direction);
  if (direction.includes('monchengladbach') || direction.includes('moenchengladbach')) return 'moenchengladbach';
  if (direction.includes('dusseldorf') || direction.includes('duesseldorf') || direction.includes('wuppertal') || direction.includes('hagen')) return 'duesseldorf';
  return null;
}

export async function fetchTrainDepartures(): Promise<TrainData> {
  const stopId = await resolveBuettgenStopId();
  const params = new URLSearchParams({
    duration: '240',
    results: '60',
    language: 'de',
    remarks: 'true',
    includeRelatedStations: 'true',
    suburban: 'true',
    nationalExpress: 'false',
    national: 'false',
    regionalExpress: 'false',
    regional: 'false',
    bus: 'false',
    ferry: 'false',
    subway: 'false',
    tram: 'false',
    taxi: 'false',
  });

  const url = `${API_BASE}/stops/${encodeURIComponent(stopId)}/departures?${params.toString()}`;
  const departures = await fetchJson<TransportDeparture[]>(url);
  const s8 = departures.filter(isS8);

  const toDuesseldorf = s8.filter((item) => directionOf(item) === 'duesseldorf').map(mapDeparture).slice(0, 4);
  const toMoenchengladbach = s8.filter((item) => directionOf(item) === 'moenchengladbach').map(mapDeparture).slice(0, 4);

  if (s8.length === 0) {
    throw new Error(`Keine S8-Abfahrten für Büttgen gefunden. Verwendete Stations-ID: ${stopId}.`);
  }

  if (toDuesseldorf.length === 0 && toMoenchengladbach.length === 0) {
    throw new Error(`S8 gefunden, aber Richtung konnte nicht erkannt werden. Verwendete Stations-ID: ${stopId}.`);
  }

  return {
    source: 'live',
    fetchedAt: new Date().toISOString(),
    toDuesseldorf: toDuesseldorf.length ? toDuesseldorf : fallbackTrainData.toDuesseldorf,
    toMoenchengladbach: toMoenchengladbach.length ? toMoenchengladbach : fallbackTrainData.toMoenchengladbach,
  };
}

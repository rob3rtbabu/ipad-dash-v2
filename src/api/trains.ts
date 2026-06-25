import type { Departure } from '../data';

const API_BASE = 'https://v6.db.transport.rest';
const STATION_QUERY = 'Buettgen-S';

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

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: { accept: 'application/json' } });
  if (!response.ok) throw new Error(`API ${response.status}: ${response.statusText}`);
  return response.json() as Promise<T>;
}

function isBuettgenStop(stop: TransportStop) {
  const name = (stop.name ?? '').toLowerCase();
  return name === 'büttgen' || name.includes('büttgen s') || name.includes('bü ttgen');
}

async function resolveBuettgenStopId(): Promise<string> {
  const params = new URLSearchParams({
    query: STATION_QUERY,
    results: '8',
    stops: 'true',
    addresses: 'false',
    poi: 'false',
    language: 'de',
  });
  const stops = await fetchJson<TransportStop[]>(`${API_BASE}/locations?${params.toString()}`);
  const exact = stops.find(isBuettgenStop) ?? stops.find((stop) => (stop.name ?? '').toLowerCase().includes('büttgen'));
  if (!exact?.id) throw new Error('Bahnhof Büttgen S wurde in der Transport-API nicht gefunden.');
  return exact.id;
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
    line: item.line?.name ?? 'S8',
    direction: item.direction ?? 'Unbekannte Richtung',
    platform: item.platform ?? item.plannedPlatform ?? '–',
    delay,
    status: item.cancelled ? 'ausfall' : delay > 0 ? 'verspätet' : 'pünktlich',
  };
}

function isS8(item: TransportDeparture) {
  return (item.line?.name ?? '').replaceAll(' ', '').toUpperCase() === 'S8';
}

function directionOf(item: TransportDeparture): TrainDirection | null {
  const direction = (item.direction ?? '').toLowerCase();
  if (direction.includes('mönchengladbach') || direction.includes('moenchengladbach')) return 'moenchengladbach';
  if (direction.includes('düsseldorf') || direction.includes('duesseldorf') || direction.includes('wuppertal') || direction.includes('hagen')) return 'duesseldorf';
  return null;
}

export async function fetchTrainDepartures(): Promise<TrainData> {
  const stopId = await resolveBuettgenStopId();
  const params = new URLSearchParams({
    duration: '180',
    results: '24',
    language: 'de',
    remarks: 'true',
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

  const departures = await fetchJson<TransportDeparture[]>(`${API_BASE}/stops/${encodeURIComponent(stopId)}/departures?${params.toString()}`);
  const s8 = departures.filter(isS8);

  const toDuesseldorf = s8.filter((item) => directionOf(item) === 'duesseldorf').map(mapDeparture).slice(0, 4);
  const toMoenchengladbach = s8.filter((item) => directionOf(item) === 'moenchengladbach').map(mapDeparture).slice(0, 4);

  if (toDuesseldorf.length === 0 && toMoenchengladbach.length === 0) {
    throw new Error('Keine S8-Abfahrten für Büttgen in den nächsten 180 Minuten gefunden.');
  }

  return {
    source: 'live',
    fetchedAt: new Date().toISOString(),
    toDuesseldorf: toDuesseldorf.length ? toDuesseldorf : fallbackTrainData.toDuesseldorf,
    toMoenchengladbach: toMoenchengladbach.length ? toMoenchengladbach : fallbackTrainData.toMoenchengladbach,
  };
}

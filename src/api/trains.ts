import type { Departure } from '../data';

const VRR_EFA_URL = 'https://efa.vrr.de/standard/XML_DM_REQUEST';
const BUETTGEN_STOP_ID = '20020049';
const CACHE_KEY = 'buettgen-vrr-departures-last-good';

export type TrainData = {
  toDuesseldorf: Departure[];
  toMoenchengladbach: Departure[];
  buses: Departure[];
  fetchedAt: string;
  source: 'live' | 'cached' | 'fallback';
  error?: string;
};

export type DeparturesData = TrainData;

type EfaDeparture = {
  dateTime?: {
    year?: string;
    month?: string;
    day?: string;
    hour?: string;
    minute?: string;
  };
  realDateTime?: {
    year?: string;
    month?: string;
    day?: string;
    hour?: string;
    minute?: string;
  };
  servingLine?: {
    number?: string;
    name?: string;
    direction?: string;
    directionFrom?: string;
    motType?: string;
    delay?: string;
    stateless?: string;
    realtime?: string;
  };
  platform?: string;
  countdown?: string;
};

type EfaResponse = {
  departureMonitor?: {
    departureList?: EfaDeparture[];
  };
};

export const fallbackTrainData: TrainData = {
  source: 'fallback',
  fetchedAt: new Date().toISOString(),
  error: 'Live-Abfahrten aktuell nicht erreichbar.',
  toDuesseldorf: [
    {
      time: '--:--',
      line: 'Bahn',
      direction: 'Düsseldorf / Neuss',
      platform: '–',
      delay: 0,
      status: 'pünktlich',
    },
  ],
  toMoenchengladbach: [
    {
      time: '--:--',
      line: 'Bahn',
      direction: 'Mönchengladbach',
      platform: '–',
      delay: 0,
      status: 'pünktlich',
    },
  ],
  buses: [
    {
      time: '--:--',
      line: 'Bus',
      direction: 'Ziel aktuell nicht verfügbar',
      platform: '–',
      delay: 0,
      status: 'pünktlich',
    },
  ],
};

export const fallbackDeparturesData = fallbackTrainData;

function normalize(value?: string | null) {
  return (value ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ß/g, 'ss')
    .replace(/\s+/g, ' ')
    .trim();
}

function pad(value?: string | number) {
  return String(value ?? '0').padStart(2, '0');
}

function formatEfaTime(item: EfaDeparture) {
  const time = item.realDateTime ?? item.dateTime;
  if (!time?.hour || !time?.minute) return '--:--';
  return `${pad(time.hour)}:${pad(time.minute)}`;
}

function plannedMinutes(item: EfaDeparture) {
  const planned = item.dateTime;
  if (!planned?.hour || !planned?.minute) return null;
  return Number(planned.hour) * 60 + Number(planned.minute);
}

function realMinutes(item: EfaDeparture) {
  const real = item.realDateTime;
  if (!real?.hour || !real?.minute) return null;
  return Number(real.hour) * 60 + Number(real.minute);
}

function delayMinutes(item: EfaDeparture) {
  const delayRaw = item.servingLine?.delay;
  if (delayRaw && !Number.isNaN(Number(delayRaw))) {
    return Math.max(0, Math.round(Number(delayRaw) / 60));
  }

  const planned = plannedMinutes(item);
  const real = realMinutes(item);
  if (planned === null || real === null) return 0;

  let diff = real - planned;
  if (diff < -720) diff += 1440;
  if (diff < 0) return 0;
  return diff;
}

function getLine(item: EfaDeparture) {
  const number = item.servingLine?.number?.trim();
  const name = item.servingLine?.name?.trim();
  return number || name || '–';
}

function getDirection(item: EfaDeparture) {
  return item.servingLine?.direction?.trim() || 'Unbekanntes Ziel';
}

function isBus(item: EfaDeparture) {
  const line = normalize(getLine(item));
  const motType = item.servingLine?.motType;
  return motType === '5' || line.includes('bus');
}

function isToMoenchengladbach(item: EfaDeparture) {
  const direction = normalize(getDirection(item));
  return direction.includes('monchengladbach') || direction.includes('moenchengladbach');
}

function isToDuesseldorf(item: EfaDeparture) {
  const direction = normalize(getDirection(item));
  return (
    direction.includes('dusseldorf') ||
    direction.includes('duesseldorf') ||
    direction.includes('neuss') ||
    direction.includes('wuppertal') ||
    direction.includes('hagen')
  );
}

function mapDeparture(item: EfaDeparture): Departure {
  const delay = delayMinutes(item);

  return {
    time: formatEfaTime(item),
    line: getLine(item).replace('S 8', 'S8'),
    direction: getDirection(item),
    platform: item.platform || '–',
    delay,
    status: delay > 0 ? 'verspätet' : 'pünktlich',
  };
}

async function fetchWithTimeout(url: string, timeoutMs = 12000): Promise<EfaResponse> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`VRR/EFA HTTP ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<EfaResponse>;
  } finally {
    window.clearTimeout(timeout);
  }
}

function getCachedDepartures(): TrainData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw) as TrainData;
    return { ...cached, source: 'cached' };
  } catch {
    return null;
  }
}

function saveCachedDepartures(data: TrainData) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // localStorage may be unavailable in private browsing or restricted environments.
  }
}

function buildVrrEfaUrl() {
  const params = new URLSearchParams({
    outputFormat: 'JSON',
    language: 'de',
    type_dm: 'stopID',
    name_dm: BUETTGEN_STOP_ID,
    useRealtime: '1',
    mode: 'direct',
    limit: '40',
  });

  return `${VRR_EFA_URL}?${params.toString()}`;
}

export async function fetchTrainDepartures(): Promise<TrainData> {
  const url = buildVrrEfaUrl();

  try {
    const json = await fetchWithTimeout(url);
    const departures = json.departureMonitor?.departureList ?? [];

    if (!Array.isArray(departures) || departures.length === 0) {
      throw new Error('VRR/EFA liefert keine Abfahrten fuer Kaarst Buettgen S.');
    }

    const toDuesseldorf = departures
      .filter((item) => !isBus(item))
      .filter(isToDuesseldorf)
      .map(mapDeparture)
      .slice(0, 5);

    const toMoenchengladbach = departures
      .filter((item) => !isBus(item))
      .filter(isToMoenchengladbach)
      .map(mapDeparture)
      .slice(0, 5);

    const buses = departures
      .filter(isBus)
      .map(mapDeparture)
      .slice(0, 6);

    const data: TrainData = {
      source: 'live',
      fetchedAt: new Date().toISOString(),
      toDuesseldorf,
      toMoenchengladbach,
      buses,
    };

    saveCachedDepartures(data);
    return data;
  } catch (error) {
    console.error('VRR/EFA Abfahrten konnten nicht geladen werden:', error);

    const cached = getCachedDepartures();
    if (cached) {
      return {
        ...cached,
        error: 'Live-Daten aktuell nicht erreichbar. Es werden die zuletzt geladenen Abfahrten angezeigt.',
      };
    }

    return {
      ...fallbackTrainData,
      error: error instanceof Error ? error.message : 'Live-Abfahrten aktuell nicht erreichbar.',
    };
  }
}

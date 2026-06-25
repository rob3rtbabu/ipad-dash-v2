import type { Departure } from '../data';

const VRR_EFA_URL = 'https://efa.vrr.de/standard/XML_DM_REQUEST';
const BUETTGEN_STOP_ID = '20020049';
const CACHE_KEY = 'buettgen-vrr-efa-last-good-v2';

export type TrainData = {
  toDuesseldorf: Departure[];
  toMoenchengladbach: Departure[];
  buses: Departure[];
  fetchedAt: string;
  source: 'live' | 'cached' | 'fallback';
  error?: string;
};

export type DeparturesData = TrainData;

type EfaTime = {
  year?: string;
  month?: string;
  day?: string;
  hour?: string;
  minute?: string;
};

type EfaDeparture = {
  dateTime?: EfaTime;
  realDateTime?: EfaTime;
  servingLine?: {
    number?: string;
    name?: string;
    direction?: string;
    directionFrom?: string;
    motType?: string;
    delay?: string;
    realtime?: string;
  };
  platform?: string;
  stopName?: string;
  countdown?: string;
};

type EfaResponse = Record<string, unknown>;

export const fallbackTrainData: TrainData = {
  source: 'fallback',
  fetchedAt: new Date().toISOString(),
  error: 'Live-Abfahrten aktuell nicht erreichbar. Es werden Platzhalter angezeigt.',
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
    .replace(/[^a-z0-9]+/g, ' ')
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

function minutesFromTime(time?: EfaTime) {
  if (!time?.hour || !time?.minute) return null;
  return Number(time.hour) * 60 + Number(time.minute);
}

function delayMinutes(item: EfaDeparture) {
  const rawDelay = item.servingLine?.delay;
  if (rawDelay && !Number.isNaN(Number(rawDelay))) {
    // EFA usually returns delay in seconds.
    return Math.max(0, Math.round(Number(rawDelay) / 60));
  }

  const planned = minutesFromTime(item.dateTime);
  const real = minutesFromTime(item.realDateTime);
  if (planned === null || real === null) return 0;

  let diff = real - planned;
  if (diff < -720) diff += 1440;
  return Math.max(0, diff);
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
  const name = normalize(item.servingLine?.name);
  const motType = String(item.servingLine?.motType ?? '');

  return (
    motType === '5' ||
    motType === '6' ||
    line.includes('bus') ||
    name.includes('bus') ||
    /^\d{2,4}$/.test(line)
  );
}

function isToMoenchengladbach(item: EfaDeparture) {
  const direction = normalize(getDirection(item));
  return direction.includes('monchengladbach') || direction.includes('moenchengladbach') || direction.includes('mg hbf');
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
  const line = getLine(item).replace(/^S\s*8$/i, 'S8');

  return {
    time: formatEfaTime(item),
    line,
    direction: getDirection(item),
    platform: item.platform || '–',
    delay,
    status: delay > 0 ? 'verspätet' : 'pünktlich',
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function looksLikeDeparture(value: unknown): value is EfaDeparture {
  if (!isObject(value)) return false;
  return isObject(value.servingLine) && (isObject(value.dateTime) || isObject(value.realDateTime));
}

function collectDepartures(value: unknown, result: EfaDeparture[] = []): EfaDeparture[] {
  if (Array.isArray(value)) {
    value.forEach((item) => collectDepartures(item, result));
    return result;
  }

  if (!isObject(value)) return result;

  if (looksLikeDeparture(value)) {
    result.push(value);
    return result;
  }

  Object.values(value).forEach((nested) => collectDepartures(nested, result));
  return result;
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

    const text = await response.text();
    return JSON.parse(text) as EfaResponse;
  } finally {
    window.clearTimeout(timeout);
  }
}

function fetchJsonp(url: string, timeoutMs = 12000): Promise<EfaResponse> {
  return new Promise((resolve, reject) => {
    const callbackName = `__vrrEfaCallback_${Date.now()}_${Math.round(Math.random() * 100000)}`;
    const script = document.createElement('script');
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error('VRR/EFA JSONP Timeout'));
    }, timeoutMs);

    function cleanup() {
      window.clearTimeout(timeout);
      script.remove();
      delete (window as unknown as Record<string, unknown>)[callbackName];
    }

    (window as unknown as Record<string, unknown>)[callbackName] = (payload: EfaResponse) => {
      cleanup();
      resolve(payload);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error('VRR/EFA JSONP konnte nicht geladen werden'));
    };

    const separator = url.includes('?') ? '&' : '?';
    script.src = `${url}${separator}callback=${callbackName}`;
    document.head.appendChild(script);
  });
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
    // localStorage may be unavailable in private browsing.
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
    limit: '60',
  });

  return `${VRR_EFA_URL}?${params.toString()}`;
}

async function loadEfaJson(url: string) {
  try {
    return await fetchWithTimeout(url);
  } catch (fetchError) {
    console.warn('VRR/EFA fetch fehlgeschlagen, versuche JSONP:', fetchError);
    return fetchJsonp(url);
  }
}

export async function fetchTrainDepartures(): Promise<TrainData> {
  const url = buildVrrEfaUrl();

  try {
    const json = await loadEfaJson(url);
    const departures = collectDepartures(json);

    if (departures.length === 0) {
      throw new Error('VRR/EFA hat geantwortet, aber keine Abfahrten geliefert. Prüfe die Haltestellen-ID 20020049.');
    }

    const railDepartures = departures.filter((item) => !isBus(item));

    const toDuesseldorf = railDepartures
      .filter(isToDuesseldorf)
      .map(mapDeparture)
      .slice(0, 5);

    const toMoenchengladbach = railDepartures
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
      fetchedAt: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Live-Abfahrten aktuell nicht erreichbar.',
    };
  }
}

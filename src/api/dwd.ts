export type WarningTone = 'ok' | 'info' | 'warning' | 'severe' | 'extreme';

export type WeatherWarning = {
  id: string;
  title: string;
  event: string;
  region: string;
  description: string;
  instruction?: string;
  start: string;
  end: string;
  level: number;
  tone: WarningTone;
};

export type WarningData = {
  source: 'live' | 'fallback';
  fetchedAt: string;
  warnings: WeatherWarning[];
  regionLabel: string;
};

type DwdRawWarning = {
  identifier?: string;
  regionName?: string;
  headline?: string;
  event?: string;
  description?: string;
  instruction?: string;
  level?: number;
  start?: number;
  end?: number;
};

type DwdResponse = {
  warnings?: Record<string, DwdRawWarning[]>;
};

const DWD_WARNINGS_URL = 'https://www.dwd.de/DWD/warnungen/warnapp/json/warnings.json';
const TARGET_REGION_TERMS = ['rhein-kreis neuss', 'rhein kreis neuss', 'neuss', 'kaarst'];

export const fallbackWarningData: WarningData = {
  source: 'fallback',
  fetchedAt: new Date().toISOString(),
  regionLabel: 'Kaarst / Rhein-Kreis Neuss',
  warnings: [
    {
      id: 'fallback-ok',
      title: 'Keine Live-Warnung geladen',
      event: 'Statushinweis',
      region: 'Kaarst / Rhein-Kreis Neuss',
      description: 'Die App zeigt diesen Hinweis, wenn die DWD-Abfrage blockiert ist oder aktuell keine Warnung gefunden wurde.',
      instruction: 'Bei unsicherer Wetterlage bitte die offizielle DWD-Warnkarte prüfen.',
      start: new Date().toISOString(),
      end: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      level: 0,
      tone: 'ok',
    },
  ],
};

function stripJsonp(text: string) {
  const trimmed = text.trim();
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error('DWD-Antwort enthält kein JSON.');
  }
  return trimmed.slice(firstBrace, lastBrace + 1);
}

function toneFromLevel(level = 0): WarningTone {
  if (level >= 4) return 'extreme';
  if (level === 3) return 'severe';
  if (level === 2) return 'warning';
  if (level === 1) return 'info';
  return 'ok';
}

function isTargetRegion(warning: DwdRawWarning) {
  const region = (warning.regionName ?? '').toLowerCase();
  return TARGET_REGION_TERMS.some((term) => region.includes(term));
}

function toIso(ms?: number) {
  if (!ms) return new Date().toISOString();
  return new Date(ms).toISOString();
}

function normalizeWarning(raw: DwdRawWarning, index: number): WeatherWarning {
  const level = raw.level ?? 0;
  return {
    id: raw.identifier ?? `${raw.regionName ?? 'dwd'}-${raw.event ?? 'warning'}-${index}`,
    title: raw.headline ?? raw.event ?? 'Amtliche Wetterwarnung',
    event: raw.event ?? 'Wetterwarnung',
    region: raw.regionName ?? 'Kaarst / Rhein-Kreis Neuss',
    description: raw.description ?? 'Es liegt eine amtliche Wetterwarnung vor.',
    instruction: raw.instruction,
    start: toIso(raw.start),
    end: toIso(raw.end),
    level,
    tone: toneFromLevel(level),
  };
}

export async function fetchDwdWarnings(): Promise<WarningData> {
  const response = await fetch(`${DWD_WARNINGS_URL}?_=${Date.now()}`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`DWD-Warnungen nicht erreichbar (${response.status}).`);
  }

  const text = await response.text();
  const parsed = JSON.parse(stripJsonp(text)) as DwdResponse;
  const allWarnings = Object.values(parsed.warnings ?? {}).flat();
  const targetWarnings = allWarnings.filter(isTargetRegion).map(normalizeWarning);

  return {
    source: 'live',
    fetchedAt: new Date().toISOString(),
    regionLabel: 'Kaarst / Rhein-Kreis Neuss',
    warnings: targetWarnings.length > 0 ? targetWarnings : [],
  };
}

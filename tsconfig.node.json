import { AlertTriangle, CloudRain, CloudSun, Droplets, Gauge, Sunrise, Sunset, ThermometerSun, TrainFront, Umbrella, Wind } from 'lucide-react';
import type { ReactNode } from 'react';

export type Metric = {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
};

export type HourForecast = {
  time: string;
  temp: number;
  rain: number;
  uv: number;
  icon: ReactNode;
};

export type Departure = {
  time: string;
  line: string;
  direction: string;
  platform: string;
  delay: number;
  status: 'pünktlich' | 'verspätet' | 'ausfall';
};

export const weatherMetrics: Metric[] = [
  { label: 'Temperatur', value: '14°', detail: 'gefühlt 13°', icon: <ThermometerSun size={20} /> },
  { label: 'Niederschlag', value: '18%', detail: 'leicht möglich', icon: <Umbrella size={20} /> },
  { label: 'UV-Index', value: '1', detail: 'niedrig', icon: <CloudSun size={20} /> },
  { label: 'Wind', value: '9 km/h', detail: 'aus Westen', icon: <Wind size={20} /> },
  { label: 'Feuchte', value: '82%', detail: 'milde Nacht', icon: <Droplets size={20} /> },
  { label: 'Luftdruck', value: '1018', detail: 'hPa stabil', icon: <Gauge size={20} /> },
  { label: 'Aufgang', value: '05:19', detail: 'Sonnenaufgang', icon: <Sunrise size={20} /> },
  { label: 'Untergang', value: '21:52', detail: 'Sonnenuntergang', icon: <Sunset size={20} /> },
];

export const hourlyForecast: HourForecast[] = [
  { time: '02:40', temp: 14, rain: 18, uv: 0, icon: <CloudRain size={20} /> },
  { time: '04:00', temp: 13, rain: 12, uv: 0, icon: <CloudSun size={20} /> },
  { time: '06:00', temp: 14, rain: 8, uv: 1, icon: <CloudSun size={20} /> },
  { time: '08:00', temp: 17, rain: 6, uv: 2, icon: <CloudSun size={20} /> },
  { time: '10:00', temp: 20, rain: 5, uv: 4, icon: <CloudSun size={20} /> },
  { time: '12:00', temp: 23, rain: 7, uv: 6, icon: <CloudSun size={20} /> },
];

export const departuresToDuesseldorf: Departure[] = [
  { time: '02:47', line: 'S8', direction: 'Düsseldorf Hbf / Wuppertal', platform: '1', delay: 0, status: 'pünktlich' },
  { time: '03:17', line: 'S8', direction: 'Düsseldorf Hbf / Wuppertal', platform: '1', delay: 3, status: 'verspätet' },
  { time: '03:47', line: 'S8', direction: 'Düsseldorf Hbf / Wuppertal', platform: '1', delay: 0, status: 'pünktlich' },
];

export const departuresToMoenchengladbach: Departure[] = [
  { time: '02:55', line: 'S8', direction: 'Mönchengladbach Hbf', platform: '2', delay: 0, status: 'pünktlich' },
  { time: '03:25', line: 'S8', direction: 'Mönchengladbach Hbf', platform: '2', delay: 8, status: 'verspätet' },
  { time: '03:55', line: 'S8', direction: 'Mönchengladbach Hbf', platform: '2', delay: 0, status: 'pünktlich' },
];

export const alertItems = [
  {
    title: 'Keine amtliche Warnung aktiv',
    text: 'DWD-Warnungen werden in Schritt 5 live angebunden.',
    tone: 'ok',
  },
  {
    title: 'Regenradar beobachten',
    text: 'Leichte Schauer in der Nacht möglich. Live-Niederschlag folgt mit Open-Meteo.',
    tone: 'info',
  },
];

export const tomorrowSummary = [
  { label: 'Morgen früh', value: '17°', detail: 'trocken' },
  { label: 'Mittag', value: '24°', detail: 'UV 6' },
  { label: 'Abend', value: '20°', detail: '10% Regen' },
];

export const moduleStatus = [
  { label: 'Wetter', value: 'Mock aktiv', icon: <CloudSun size={18} /> },
  { label: 'S8', value: 'Mock aktiv', icon: <TrainFront size={18} /> },
  { label: 'Warnungen', value: 'bereit', icon: <AlertTriangle size={18} /> },
];

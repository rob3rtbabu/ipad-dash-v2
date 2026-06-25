export type WeatherCondition = {
  label: string;
  icon: 'sun' | 'cloud-sun' | 'cloud' | 'rain' | 'storm' | 'snow' | 'fog';
};

export type WeatherMetric = {
  label: string;
  value: string;
  detail: string;
  icon: 'temperature' | 'umbrella' | 'uv' | 'wind' | 'humidity' | 'pressure' | 'sunrise' | 'sunset';
};

export type HourForecast = {
  time: string;
  temp: number;
  rain: number;
  uv: number;
  weatherCode: number;
  condition: WeatherCondition;
};

export type TomorrowPeriod = {
  label: string;
  value: string;
  detail: string;
};

export type WeatherData = {
  source: 'live' | 'mock';
  fetchedAt: string;
  current: {
    temperature: number;
    apparentTemperature: number;
    precipitation: number;
    rainProbability: number;
    uvIndex: number;
    windSpeed: number;
    humidity: number;
    pressure: number;
    weatherCode: number;
    condition: WeatherCondition;
  };
  metrics: WeatherMetric[];
  hourly: HourForecast[];
  tomorrow: {
    title: string;
    periods: TomorrowPeriod[];
  };
};

type OpenMeteoResponse = {
  current?: Record<string, number | string>;
  hourly?: Record<string, Array<number | string>>;
  daily?: Record<string, Array<number | string>>;
};

const LATITUDE = 51.2009;
const LONGITUDE = 6.6087;
const TIMEZONE = 'Europe/Berlin';

const fmtTime = new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' });

export const mockWeatherData: WeatherData = {
  source: 'mock',
  fetchedAt: new Date().toISOString(),
  current: {
    temperature: 14,
    apparentTemperature: 13,
    precipitation: 0,
    rainProbability: 18,
    uvIndex: 0,
    windSpeed: 9,
    humidity: 82,
    pressure: 1018,
    weatherCode: 3,
    condition: { label: 'Leicht bewölkt', icon: 'cloud-sun' },
  },
  metrics: [
    { label: 'Temperatur', value: '14°', detail: 'gefühlt 13°', icon: 'temperature' },
    { label: 'Niederschlag', value: '18%', detail: 'leicht möglich', icon: 'umbrella' },
    { label: 'UV-Index', value: '0', detail: 'niedrig', icon: 'uv' },
    { label: 'Wind', value: '9 km/h', detail: 'ruhig', icon: 'wind' },
    { label: 'Feuchte', value: '82%', detail: 'milde Nacht', icon: 'humidity' },
    { label: 'Luftdruck', value: '1018', detail: 'hPa stabil', icon: 'pressure' },
    { label: 'Aufgang', value: '05:19', detail: 'Sonnenaufgang', icon: 'sunrise' },
    { label: 'Untergang', value: '21:52', detail: 'Sonnenuntergang', icon: 'sunset' },
  ],
  hourly: [
    { time: '02:40', temp: 14, rain: 18, uv: 0, weatherCode: 61, condition: { label: 'Leichter Regen', icon: 'rain' } },
    { time: '04:00', temp: 13, rain: 12, uv: 0, weatherCode: 3, condition: { label: 'Bewölkt', icon: 'cloud-sun' } },
    { time: '06:00', temp: 14, rain: 8, uv: 1, weatherCode: 2, condition: { label: 'Auflockernd', icon: 'cloud-sun' } },
    { time: '08:00', temp: 17, rain: 6, uv: 2, weatherCode: 2, condition: { label: 'Freundlich', icon: 'cloud-sun' } },
    { time: '10:00', temp: 20, rain: 5, uv: 4, weatherCode: 1, condition: { label: 'Sonnig', icon: 'sun' } },
    { time: '12:00', temp: 23, rain: 7, uv: 6, weatherCode: 1, condition: { label: 'Sonnig', icon: 'sun' } },
  ],
  tomorrow: {
    title: 'Freundlich & mild',
    periods: [
      { label: 'Morgen früh', value: '17°', detail: 'trocken' },
      { label: 'Mittag', value: '24°', detail: 'UV 6' },
      { label: 'Abend', value: '20°', detail: '10% Regen' },
    ],
  },
};

function conditionFromCode(code: number): WeatherCondition {
  if (code === 0) return { label: 'Klar', icon: 'sun' };
  if ([1, 2].includes(code)) return { label: 'Leicht bewölkt', icon: 'cloud-sun' };
  if (code === 3) return { label: 'Bewölkt', icon: 'cloud' };
  if ([45, 48].includes(code)) return { label: 'Nebel', icon: 'fog' };
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { label: 'Regen', icon: 'rain' };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { label: 'Schnee', icon: 'snow' };
  if ([95, 96, 99].includes(code)) return { label: 'Gewitter', icon: 'storm' };
  return { label: 'Wechselhaft', icon: 'cloud-sun' };
}

function round(value: unknown, fallback = 0) {
  return Math.round(Number(value ?? fallback));
}

function atNumber(values: unknown[] | undefined, index: number, fallback = 0) {
  if (!values || index < 0 || index >= values.length) return fallback;
  return Number(values[index] ?? fallback);
}

function closestHourlyIndex(times: unknown[] | undefined, target = new Date()) {
  if (!times?.length) return 0;
  let best = 0;
  let bestDistance = Number.POSITIVE_INFINITY;
  times.forEach((time, index) => {
    const distance = Math.abs(new Date(String(time)).getTime() - target.getTime());
    if (distance < bestDistance) {
      best = index;
      bestDistance = distance;
    }
  });
  return best;
}

function upcomingHourlyIndexes(times: unknown[] | undefined, start = new Date(), count = 8) {
  if (!times?.length) return [];
  const startMs = start.getTime() - 30 * 60 * 1000;
  const indexes = times
    .map((time, index) => ({ index, ms: new Date(String(time)).getTime() }))
    .filter((item) => Number.isFinite(item.ms) && item.ms >= startMs)
    .slice(0, count)
    .map((item) => item.index);
  return indexes.length ? indexes : Array.from({ length: Math.min(count, times.length) }, (_, index) => index);
}

function buildTomorrowPeriods(hourly: OpenMeteoResponse['hourly']) {
  const times = hourly?.time;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateKey = tomorrow.toISOString().slice(0, 10);
  const picks = [
    { label: 'Morgen früh', hour: '07:00' },
    { label: 'Mittag', hour: '12:00' },
    { label: 'Abend', hour: '18:00' },
  ];

  return picks.map((pick) => {
    const needle = `${dateKey}T${pick.hour}`;
    const index = times?.findIndex((time) => String(time).startsWith(needle)) ?? -1;
    const temp = round(atNumber(hourly?.temperature_2m, index, 0));
    const rain = round(atNumber(hourly?.precipitation_probability, index, 0));
    const uv = Math.round(atNumber(hourly?.uv_index, index, 0));
    return {
      label: pick.label,
      value: index >= 0 ? `${temp}°` : '—',
      detail: index >= 0 ? `${rain}% Regen · UV ${uv}` : 'noch keine Daten',
    };
  });
}

export async function fetchWeather(): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(LATITUDE),
    longitude: String(LONGITUDE),
    timezone: TIMEZONE,
    forecast_days: '3',
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m',
    hourly: 'temperature_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,uv_index,wind_speed_10m,relative_humidity_2m,surface_pressure',
    daily: 'sunrise,sunset,uv_index_max,precipitation_probability_max,temperature_2m_max,temperature_2m_min',
  });

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Open-Meteo HTTP ${response.status}`);
  const json = (await response.json()) as OpenMeteoResponse;

  const current = json.current ?? {};
  const hourly = json.hourly ?? {};
  const daily = json.daily ?? {};
  const nowIndex = closestHourlyIndex(hourly.time);
  const weatherCode = round(current.weather_code ?? atNumber(hourly.weather_code, nowIndex, 3));
  const rainProbability = round(atNumber(hourly.precipitation_probability, nowIndex, 0));
  const uvIndex = Math.round(atNumber(hourly.uv_index, nowIndex, 0));
  const temperature = round(current.temperature_2m ?? atNumber(hourly.temperature_2m, nowIndex, 0));
  const apparentTemperature = round(current.apparent_temperature ?? atNumber(hourly.apparent_temperature, nowIndex, temperature));
  const precipitation = Number(current.precipitation ?? atNumber(hourly.precipitation, nowIndex, 0));
  const humidity = round(current.relative_humidity_2m ?? atNumber(hourly.relative_humidity_2m, nowIndex, 0));
  const pressure = round(current.surface_pressure ?? atNumber(hourly.surface_pressure, nowIndex, 0));
  const windSpeed = round(current.wind_speed_10m ?? atNumber(hourly.wind_speed_10m, nowIndex, 0));
  const sunrise = daily.sunrise?.[0] ? fmtTime.format(new Date(String(daily.sunrise[0]))) : '—';
  const sunset = daily.sunset?.[0] ? fmtTime.format(new Date(String(daily.sunset[0]))) : '—';
  const condition = conditionFromCode(weatherCode);

  const indexes = upcomingHourlyIndexes(hourly.time, new Date(), 8);
  const forecast = indexes.map((index) => {
    const code = round(atNumber(hourly.weather_code, index, 3));
    return {
      time: hourly.time?.[index] ? fmtTime.format(new Date(String(hourly.time[index]))) : '—',
      temp: round(atNumber(hourly.temperature_2m, index, 0)),
      rain: round(atNumber(hourly.precipitation_probability, index, 0)),
      uv: Math.round(atNumber(hourly.uv_index, index, 0)),
      weatherCode: code,
      condition: conditionFromCode(code),
    };
  });

  const tomorrowMax = round(daily.temperature_2m_max?.[1], 0);
  const tomorrowMin = round(daily.temperature_2m_min?.[1], 0);
  const tomorrowRain = round(daily.precipitation_probability_max?.[1], 0);
  const tomorrowUv = Math.round(Number(daily.uv_index_max?.[1] ?? 0));

  return {
    source: 'live',
    fetchedAt: new Date().toISOString(),
    current: {
      temperature,
      apparentTemperature,
      precipitation,
      rainProbability,
      uvIndex,
      windSpeed,
      humidity,
      pressure,
      weatherCode,
      condition,
    },
    metrics: [
      { label: 'Temperatur', value: `${temperature}°`, detail: `gefühlt ${apparentTemperature}°`, icon: 'temperature' },
      { label: 'Niederschlag', value: `${rainProbability}%`, detail: `${precipitation.toFixed(1).replace('.', ',')} mm aktuell`, icon: 'umbrella' },
      { label: 'UV-Index', value: `${uvIndex}`, detail: uvIndex >= 6 ? 'hoch' : uvIndex >= 3 ? 'mittel' : 'niedrig', icon: 'uv' },
      { label: 'Wind', value: `${windSpeed} km/h`, detail: windSpeed >= 25 ? 'auffrischend' : 'ruhig', icon: 'wind' },
      { label: 'Feuchte', value: `${humidity}%`, detail: humidity >= 80 ? 'feucht' : 'angenehm', icon: 'humidity' },
      { label: 'Luftdruck', value: `${pressure}`, detail: 'hPa', icon: 'pressure' },
      { label: 'Aufgang', value: sunrise, detail: 'Sonnenaufgang', icon: 'sunrise' },
      { label: 'Untergang', value: sunset, detail: 'Sonnenuntergang', icon: 'sunset' },
    ],
    hourly: forecast,
    tomorrow: {
      title: `${tomorrowMin}° bis ${tomorrowMax}°`,
      periods: buildTomorrowPeriods(hourly).map((period) => ({
        ...period,
        detail: period.detail === 'noch keine Daten' ? `${tomorrowRain}% Regen · UV ${tomorrowUv}` : period.detail,
      })),
    },
  };
}

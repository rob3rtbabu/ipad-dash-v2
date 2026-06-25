import { AnalogClock } from './components/AnalogClock';
import { AlertsPanel } from './components/AlertsPanel';
import { Card } from './components/Card';
import { Header } from './components/Header';
import { SystemStatus } from './components/SystemStatus';
import { TrainDepartures } from './components/TrainDepartures';
import { WeatherOverview } from './components/WeatherOverview';
import { useCurrentTime } from './hooks/useCurrentTime';
import { useWeather } from './hooks/useWeather';
import { useTrains } from './hooks/useTrains';
import { useWarnings } from './hooks/useWarnings';
import { useOnlineStatus } from './hooks/useOnlineStatus';

export default function App() {
  const now = useCurrentTime();
  const weather = useWeather();
  const trains = useTrains();
  const warnings = useWarnings();
  const online = useOnlineStatus();

  return (
    <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_8%_0%,#dff3ff_0,transparent_27%),radial-gradient(circle_at_95%_10%,#fff0c2_0,transparent_22%),linear-gradient(135deg,#f8fbff_0%,#eef7f5_55%,#f7fbff_100%)] px-3 py-3 text-slate-950 sm:px-4 lg:px-5">
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] w-full max-w-[1366px] flex-col gap-3">
        <Header now={now} online={online} />

        <section className="grid flex-1 gap-3 xl:grid-cols-[1.55fr_0.75fr]">
          <div className="grid content-start gap-3">
            <WeatherOverview weather={weather.data} loading={weather.loading} error={weather.error} onRefresh={() => void weather.refresh()} />
            <TrainDepartures data={trains.data} loading={trains.loading} error={trains.error} onRefresh={() => void trains.refresh()} />
          </div>

          <aside className="grid content-start gap-3 md:grid-cols-2 xl:grid-cols-1">
            <Card className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">Live Uhr</p>
              <div className="mt-3 flex justify-center">
                <AnalogClock date={now} />
              </div>
              <p className="mt-3 font-mono text-3xl font-semibold tracking-tight tabular-nums text-slate-950">
                {now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
              <p className="mt-1 text-xs text-slate-500">Gerätezeit · jede Sekunde</p>
            </Card>
            <AlertsPanel data={warnings.data} loading={warnings.loading} error={warnings.error} onRefresh={() => void warnings.refresh()} />
            <SystemStatus weatherSource={weather.data.source} weatherError={weather.error} weatherFetchedAt={weather.data.fetchedAt} trainSource={trains.data.source} trainError={trains.error} trainFetchedAt={trains.data.fetchedAt} warningSource={warnings.data.source} warningError={warnings.error} warningFetchedAt={warnings.data.fetchedAt} />
          </aside>
        </section>
      </div>
    </main>
  );
}

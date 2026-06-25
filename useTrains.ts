import { CheckCircle2, Download, Smartphone, WifiOff } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Card } from './Card';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

type PwaCardProps = {
  online: boolean;
};

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || ('standalone' in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
}

export function PwaCard({ online }: PwaCardProps) {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [standalone, setStandalone] = useState(false);

  useEffect(() => {
    setStandalone(isStandalone());
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
  }, []);

  const installHint = useMemo(() => {
    if (standalone) return 'Als App installiert';
    if (installEvent) return 'Installation verfügbar';
    return 'Safari: Teilen -> Zum Home-Bildschirm';
  }, [installEvent, standalone]);

  async function install() {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
    setStandalone(isStandalone());
  }

  return (
    <Card subtle>
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">PWA</p>
      <h2 className="mt-1 text-2xl font-semibold text-slate-950">App-Modus</h2>
      <div className="mt-5 grid gap-3">
        <div className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3 ring-1 ring-white">
          <div className="flex items-center gap-2 text-slate-700"><Smartphone size={18} /><span className="font-medium">Installation</span></div>
          <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">{installHint}</span>
        </div>
        <div className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3 ring-1 ring-white">
          <div className="flex items-center gap-2 text-slate-700">{online ? <CheckCircle2 size={18} /> : <WifiOff size={18} />}<span className="font-medium">Verbindung</span></div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${online ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{online ? 'Online' : 'Offline'}</span>
        </div>
      </div>
      {installEvent ? (
        <button onClick={() => void install()} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-300 transition active:scale-[0.99]">
          <Download size={17} /> App installieren
        </button>
      ) : (
        <p className="mt-5 rounded-2xl bg-sky-50 px-4 py-3 text-sm leading-6 text-slate-600">Auf iPad/iPhone in Safari öffnen, Teilen antippen und <strong>Zum Home-Bildschirm</strong> wählen.</p>
      )}
    </Card>
  );
}

# Büttgen Dashboard PWA

Installierbare Smart-Home-Dashboard-App für iPad und iPhone.

## Stand: Schritt 6 / Finaler Feinschliff

Enthalten:

- React + Vite + TypeScript
- Tailwind CSS
- PWA-Manifest und verbesserter Service Worker
- GitHub-Pages-Deployment per GitHub Actions
- responsive Dashboard-Layout für iPad Landscape, iPad Portrait und iPhone
- Live-Uhr mit lokaler Gerätezeit
- Wetter live über Open-Meteo
- S8-Abfahrten ab Büttgen S über transport.rest
- DWD-Warnungen für Kaarst / Rhein-Kreis Neuss
- Ladezustände, sichtbare Fehler und Fallback-Daten
- automatische Aktualisierung alle 15 Minuten
- App-Installationshinweis für iPad/iPhone
- Online-/Offline-Status
- verbesserte Meta-Tags für iOS Home-Screen und Vollbildmodus

## Lokal starten

```bash
npm install
npm run dev
```

## Produktionsbuild testen

```bash
npm run build
npm run preview
```

## GitHub Pages

1. Repository auf GitHub erstellen, z. B. `buettgen-dashboard`.
2. Diese ZIP entpacken.
3. Den Inhalt des Ordners `buettgen-dashboard` in das Repository hochladen.
4. Dein Repository sollte direkt `index.html`, `package.json`, `src`, `public` und `.github` enthalten.
5. In GitHub unter `Settings -> Pages` als Source `GitHub Actions` auswählen.
6. Unter `Actions` warten, bis `Deploy to GitHub Pages` erfolgreich durchgelaufen ist.
7. Die ausgegebene GitHub-Pages-URL in Safari auf dem iPad öffnen.
8. Teilen -> `Zum Home-Bildschirm` wählen.

## Wichtig zur Ordnerstruktur

Richtig:

```text
index.html
package.json
src/
public/
.github/
README.md
```

Falsch:

```text
buettgen-dashboard/
  index.html
  package.json
  src/
```

## Datenquellen

- Wetter: Open-Meteo Forecast API
- S-Bahn: v6.db.transport.rest
- Warnungen: DWD WarnWetter JSON

Hinweis: Browser oder einzelne APIs können gelegentlich Anfragen blockieren. In diesem Fall zeigt die App eine sichtbare Fehlermeldung und stabile Fallback-Daten, damit das Dashboard nicht leer bleibt.

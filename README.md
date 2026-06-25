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

## Update: S8-Live-Daten Fix

Die S8-Anbindung nutzt jetzt eine robustere Stationsauflösung:

- sucht Büttgen automatisch über `https://v6.db.transport.rest/locations`
- bevorzugt Stop-/Station-Ergebnisse mit S-Bahn-Produkt
- fällt auf die bekannte EVA-ID `8001261` für Bahnhof Büttgen zurück
- lädt danach Abfahrten über `/stops/:id/departures`
- filtert nur `S8`/`S 8`
- zeigt genauere Fehlermeldungen inklusive verwendeter URL oder Stations-ID

Wenn auf iPhone/iPad nach dem Deployment noch alte Daten erscheinen, die PWA einmal vom Home-Bildschirm löschen und neu hinzufügen. Der Service-Worker-Cache wurde auf `buettgen-dashboard-v7-s8-fix` erhöht.


## S8-Fix v8

Die S8-Abfrage versucht zuerst `https://v6.db.transport.rest` und danach automatisch `https://v5.db.api.bahn.guru`. Dadurch bleibt die App robuster, falls einer der freien Transport-Endpunkte im Browser zeitweise nicht erreichbar ist.

## Layout-Update: kompakter iPad-Modus

Diese Version fasst alle Wetterinformationen in einer gemeinsamen Wetterkarte zusammen: aktuelle Werte, Hauptmetriken, Stundenverlauf und Morgen-Vorschau. Das Dashboard nutzt kleinere Abstände und Karten, damit es auf dem iPad deutlich besser in eine Bildschirmhöhe passt.

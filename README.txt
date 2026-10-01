FSD Kartenverwaltung Cloud V5 – 50 Hz Anlagen 9,10

Dieses Update erweitert die vorhandene Flughafen-Cloud V4.2.
Die enthaltenen 19 Anlagenpositionen können als zusätzliche Karte angelegt werden.
Die vorhandenen Flughafen-Haupt- und Truppkarten bleiben enthalten.

AKTIVIERUNG

1. Im bestehenden Supabase-Projekt FSD-Flaechenkarten den SQL-Editor öffnen.
   Inhalt von supabase-50hz.sql einfügen und ausführen.
   Die Erweiterung legt eine Rückmeldungstabelle und drei Funktionen an.
   Bestehende Flughafentabellen und Freigaben werden nicht ersetzt.

2. Im bestehenden GitHub-Repository jdp12-ux/FSD-Flughafenfl-chen
   diese acht Dateien gemeinsam in den bisherigen Veröffentlichungsordner laden:
   index.html
   mastermap.html
   truppkarte.html
   handykarte.html
   handykarte-core.js
   point-manager.js
   point-cloud.js
   50hz-anlagen-9-10.json
   Vorhandene Dateien gleichen Namens durch diese Paketversion ersetzen.
   README.txt und supabase-50hz.sql brauchen nicht auf die Webseite.

3. Nach dem GitHub-Pages-Update die bekannte Adresse öffnen:
   https://jdp12-ux.github.io/FSD-Flughafenfl-chen/
   Gegebenenfalls mit Strg+F5 aktualisieren. Wie bisher anmelden.
   Auf „+ 50-Hz-Anlagenkarte“ klicken und den Entwurf speichern.
   „Ansehen“ öffnet eine Vorschau. „Freigeben“ erzeugt den Trupplink.
   Der Trupplink öffnet handykarte.html?t=… und kann wie bisher geteilt werden.

BEDIENUNG

- Offen / Erledigt / Nicht gefunden, Notizen und Fotos liegen gemeinsam in Supabase.
- Neue Version: aktualisierte FSD-HTML oder JSON wählen, dann Entwurf speichern.
  Die Rückmeldungen passender Objekt-IDs werden in die neue Karte kopiert.
  Die alte freigegebene Karte und ihr Link bleiben als eigener Stand bestehen.
  Änderungen auf alten Links nach dem Kopieren werden nicht in die neue Version
  übertragen. Nach der Freigabe daher den neuen Link verwenden.
- Ansehen in der Verwaltung ist eine Ansicht ohne Änderungen.
  Rückmeldungen erfolgen über den freigegebenen Trupplink.
- Neue Karten können auch aus anderen FSD-HTML-Dateien mit eingebettetem
  JSON-Array DATA oder JSON-Dateien mit einer points-Liste geladen werden.
  Feste Objekt-IDs und gültige Koordinaten sind Voraussetzung.

OFFLINE UND FOTOS

Die Karte muss zuvor auf dem Gerät online geöffnet worden sein.
Änderungen werden lokal gepuffert und bei bestehender Verbindung hochgeladen.
Der Cloud-Hinweis zeigt wartende und bestätigte Rückmeldungen an.
Bei parallelen Änderungen derselben Position ist eine Auswahl nötig.
Bei vollem Handyspeicher die Seite geöffnet lassen und Rückmeldung exportieren.
Es gibt keine vollständig offline verfügbare Karte: Kartenkacheln und die
Programmbibliotheken benötigen eine Verbindung oder den Browser-Cache.
Fotos werden auf maximal 960 Pixel verkleinert. Höchstens 10 Fotos je Position;
übermäßig große Fotos werden abgelehnt. In dieser ersten Erweiterung liegen
komprimierte Fotos im Rückmeldungsdatensatz, nicht in einem separaten Fotobucket.

VALIDIERUNG

JavaScript-Syntax und PostgreSQL-Funktionen wurden lokal geprüft.
Die SQL-Prüfung verwendet eine Testdatenbank mit den vorhandenen Tabellen-
Schnittstellen und simulierten Benutzerrechten. Das produktive Supabase-Projekt
wurde nicht verändert. Browserprüfungen verwenden simulierte Cloud-Antworten;
ein Live-Test folgt nach Aktivierung im bestehenden Projekt.

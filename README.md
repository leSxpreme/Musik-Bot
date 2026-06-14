# 🎵 Discord Musik-Bot (Discord.js v14)

Ein moderner, vollständig funktionsfähiger Discord Musik-Bot mit Slash Commands,
Queue-System, Loop, Shuffle, Lautstärkeregelung, schönen Embeds und automatischem
Verlassen leerer Voice-Channels.

## 📂 Projektstruktur

```
musicbot/
├── commands/          # Alle Slash Commands (/play, /skip, ...)
├── events/            # Discord Client Events (ready, interactionCreate, ...)
├── handlers/          # Loader, Logger, Cooldowns, Command-Deployment
├── music/             # Queue-Logik, Embeds, Suche, Checks
├── config/            # Konfigurationsdatei (liest .env)
├── main.js            # Einstiegspunkt
├── package.json
├── railway.json       # Railway Deploy-Konfiguration
├── nixpacks.toml      # Stellt sicher, dass ffmpeg installiert wird
└── .env.example       # Vorlage für Umgebungsvariablen
```

## ⚙️ Setup (lokal)

1. **Dependencies installieren:**
   ```bash
   npm install
   ```

2. **`.env` Datei erstellen** (Kopie von `.env.example`):
   ```bash
   cp .env.example .env
   ```

3. **`.env` ausfüllen:**
   - `DISCORD_TOKEN`: Bot-Token aus dem [Discord Developer Portal](https://discord.com/developers/applications)
   - `CLIENT_ID`: Application ID deines Bots
   - `GUILD_ID`: (optional) Server-ID für sofortige Slash-Command-Registrierung beim Testen
   - `EMBED_COLOR`: Hex-Farbcode ohne `#` für die Embeds

4. **Bot starten:**
   ```bash
   npm start
   ```

   Beim Start werden alle Slash Commands automatisch registriert.

## 🚀 Deployment auf Railway

1. Repository zu GitHub pushen (oder Railway CLI verwenden).
2. In Railway: **New Project → Deploy from GitHub repo**.
3. Unter **Variables** folgende Umgebungsvariablen setzen:
   - `DISCORD_TOKEN`
   - `CLIENT_ID`
   - `GUILD_ID` (optional)
   - `EMBED_COLOR` (optional, Standard: `5865F2`)
4. Railway erkennt das Projekt automatisch über `nixpacks.toml` (installiert auch `ffmpeg`)
   und startet den Bot mit `node main.js`.
5. Fertig! Der Bot loggt sich ein, registriert die Slash Commands und ist online.

> ⚠️ Wichtig: Der Bot benötigt **ffmpeg**, welches über `nixpacks.toml` automatisch
> auf Railway installiert wird. Lokal muss ffmpeg ggf. manuell installiert sein,
> falls `ffmpeg-static` auf deinem System nicht funktioniert.

## 🔑 Benötigte Bot-Permissions & Intents

Im Discord Developer Portal unter **Bot**:
- ✅ `Server Members Intent` (nicht zwingend, aber empfohlen)
- ✅ `Message Content Intent` (nicht erforderlich für Slash Commands, kann aber aktiviert bleiben)

OAuth2-Berechtigungen für den Invite-Link:
- `bot`, `applications.commands`
- Permissions: `Connect`, `Speak`, `View Channels`, `Send Messages`, `Embed Links`

## 📜 Befehle

| Befehl | Beschreibung |
|---|---|
| `/play <suchbegriff>` | Spielt einen Song über Link oder Suchbegriff ab (unterstützt auch YouTube-Playlists) |
| `/skip` | Überspringt den aktuellen Song |
| `/pause` | Pausiert die Wiedergabe |
| `/resume` | Setzt die Wiedergabe fort |
| `/stop` | Stoppt die Musik, leert die Queue und verlässt den Channel |
| `/queue [seite]` | Zeigt die Warteschlange an |
| `/nowplaying` | Zeigt den aktuellen Song mit Fortschrittsbalken |
| `/volume <prozent>` | Stellt die Lautstärke ein (0-100) |
| `/loop <modus>` | Wiederholungsmodus: Aus / Song / Warteschlange |
| `/shuffle` | Mischt die Warteschlange |

## ✨ Features

- 🎶 YouTube-Link, Suchbegriff und Playlist-Support (via `play-dl`)
- 📊 Queue-System mit Pagination
- 🔁 Loop-Modi (Song/Queue) und Shuffle
- 🎨 Moderne Embeds mit Thumbnails, Dauer und Fortschrittsbalken
- ⏳ Cooldown-System gegen Spam
- 🚪 Automatisches Verlassen bei leerem Voice-Channel
- 📝 Logging-System für Befehle, Fehler und Voice-Events
- 🛡️ Umfassende Fehlerbehandlung

## 🔧 Erweiterbarkeit

Neue Befehle einfach als Datei in `commands/` ablegen — sie werden automatisch
geladen und beim Start registriert. Neue Events analog in `events/`.

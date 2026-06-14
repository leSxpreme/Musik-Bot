// config/config.js
// Zentrale Konfigurationsdatei für Token, IDs und Bot-Einstellungen.
// Werte werden aus der .env Datei geladen (siehe .env.example).

require('dotenv').config();

module.exports = {
    // === Authentifizierung ===
    token: process.env.DISCORD_TOKEN,
    clientId: process.env.CLIENT_ID,
    guildId: process.env.GUILD_ID || null, // null = globale Slash-Command-Registrierung

    // === Design / Embeds ===
    embedColor: `#${process.env.EMBED_COLOR || '5865F2'}`,
    embedColorError: '#ED4245',
    embedColorSuccess: '#57F287',

    // === Musik-Einstellungen ===
    defaultVolume: 50, // Standardlautstärke in Prozent (0-100)
    maxQueueSize: 100, // Maximale Anzahl an Songs in der Queue

    // === Voice-Channel-Verhalten ===
    leaveOnEmpty: true, // Bot verlässt den Channel, wenn er leer ist
    leaveOnEmptyDelay: 30000, // Wartezeit in ms, bevor der Bot den leeren Channel verlässt
    leaveOnEnd: true, // Bot verlässt den Channel, wenn die Queue zu Ende ist
    leaveOnEndDelay: 60000, // Wartezeit in ms nach Ende der Queue

    // === Cooldown-System ===
    commandCooldown: 3000, // Cooldown zwischen Befehlen pro Nutzer in ms

    // === Logging ===
    logging: {
        enabled: true,
        logCommands: true,
        logErrors: true,
        logVoiceEvents: true,
    },
};

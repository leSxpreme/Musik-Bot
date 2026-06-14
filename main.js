// main.js
// Einstiegspunkt des Discord Musik-Bots.
// Lädt Konfiguration, Befehle und Events und startet den Client.

const { Client, GatewayIntentBits, Partials } = require('discord.js');
const config = require('./config/config');
const logger = require('./handlers/logger');
const { loadCommands } = require('./handlers/commandHandler');
const { loadEvents } = require('./handlers/eventHandler');

// === Konfiguration prüfen ===
if (!config.token) {
    logger.error('Kein DISCORD_TOKEN in der .env Datei gefunden. Bot kann nicht gestartet werden.');
    process.exit(1);
}

if (!config.clientId) {
    logger.error('Keine CLIENT_ID in der .env Datei gefunden. Slash Commands können nicht registriert werden.');
    process.exit(1);
}

// === Discord Client erstellen ===
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
    ],
    partials: [Partials.Channel],
});

// === Befehle und Events laden ===
loadCommands(client);
loadEvents(client);

// === Globale Fehlerbehandlung für unerwartete Crashes ===
process.on('unhandledRejection', (error) => {
    logger.error('Unbehandelte Promise-Ablehnung', error);
});

process.on('uncaughtException', (error) => {
    logger.error('Unbehandelte Ausnahme', error);
});

// === Bot einloggen ===
client.login(config.token).catch((error) => {
    logger.error('Login fehlgeschlagen. Bitte überprüfe deinen DISCORD_TOKEN.', error);
    process.exit(1);
});

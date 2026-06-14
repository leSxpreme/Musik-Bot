// handlers/eventHandler.js
// Lädt alle Events aus dem events/ Ordner und registriert sie am Client.

const fs = require('fs');
const path = require('path');
const logger = require('./logger');

/**
 * Lädt alle Event-Dateien und registriert sie.
 * @param {import('discord.js').Client} client
 */
function loadEvents(client) {
    const eventsPath = path.join(__dirname, '..', 'events');
    const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.js'));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);

        if (!event.name || !event.execute) {
            logger.warn(`Event "${file}" hat kein "name" oder "execute" Feld und wird übersprungen.`);
            continue;
        }

        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
        } else {
            client.on(event.name, (...args) => event.execute(...args, client));
        }

        logger.info(`Event geladen: ${event.name}`);
    }
}

module.exports = { loadEvents };

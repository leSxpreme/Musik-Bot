// handlers/commandHandler.js
// Lädt alle Befehle aus dem commands/ Ordner in eine Collection.

const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');
const logger = require('./logger');

/**
 * Lädt alle Command-Dateien und gibt eine Collection zurück.
 * @param {import('discord.js').Client} client
 */
function loadCommands(client) {
    client.commands = new Collection();

    const commandsPath = path.join(__dirname, '..', 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        if (!command.data || !command.execute) {
            logger.warn(`Befehl "${file}" hat kein "data" oder "execute" Feld und wird übersprungen.`);
            continue;
        }

        client.commands.set(command.data.name, command);
        logger.info(`Befehl geladen: /${command.data.name}`);
    }

    return client.commands;
}

module.exports = { loadCommands };

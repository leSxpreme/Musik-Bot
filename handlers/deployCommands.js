// handlers/deployCommands.js
// Registriert alle Slash Commands bei Discord (global oder für eine Guild).
// Wird automatisch beim Bot-Start ausgeführt.

const { REST, Routes } = require('discord.js');
const config = require('../config/config');
const logger = require('./logger');

/**
 * Registriert die Slash Commands aus der client.commands Collection.
 * @param {import('discord.js').Client} client
 */
async function deployCommands(client) {
    const commandsData = client.commands.map((command) => command.data.toJSON());

    const rest = new REST().setToken(config.token);

    try {
        logger.info(`Registriere ${commandsData.length} Slash Command(s)...`);

        if (config.guildId) {
            // Registrierung nur für eine Test-Guild (sofort verfügbar)
            await rest.put(
                Routes.applicationGuildCommands(config.clientId, config.guildId),
                { body: commandsData }
            );
            logger.success(`${commandsData.length} Slash Command(s) für Guild ${config.guildId} registriert.`);
        } else {
            // Globale Registrierung (kann bis zu 1h dauern, bis Commands überall sichtbar sind)
            await rest.put(
                Routes.applicationCommands(config.clientId),
                { body: commandsData }
            );
            logger.success(`${commandsData.length} Slash Command(s) global registriert.`);
        }
    } catch (error) {
        logger.error('Fehler beim Registrieren der Slash Commands', error);
    }
}

module.exports = { deployCommands };

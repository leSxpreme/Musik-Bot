// events/ready.js
// Wird einmalig ausgeführt, sobald der Bot erfolgreich eingeloggt ist.

const { Events, ActivityType } = require('discord.js');
const logger = require('../handlers/logger');
const { deployCommands } = require('../handlers/deployCommands');

module.exports = {
    name: Events.ClientReady,
    once: true,

    async execute(client) {
        logger.success(`Eingeloggt als ${client.user.tag}!`);
        logger.info(`Bot ist auf ${client.guilds.cache.size} Server(n) aktiv.`);

        // Slash Commands automatisch registrieren
        await deployCommands(client);

        // Bot-Status setzen
        client.user.setPresence({
            activities: [{ name: 'Musik 🎵 | /play', type: ActivityType.Listening }],
            status: 'online',
        });
    },
};

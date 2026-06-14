// handlers/logger.js
// Einfaches Logging-System für wichtige Bot-Aktionen.

const config = require('../config/config');

function timestamp() {
    return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

const logger = {
    info(message) {
        if (!config.logging.enabled) return;
        console.log(`[${timestamp()}] [INFO] ${message}`);
    },

    success(message) {
        if (!config.logging.enabled) return;
        console.log(`[${timestamp()}] [SUCCESS] ${message}`);
    },

    warn(message) {
        if (!config.logging.enabled) return;
        console.warn(`[${timestamp()}] [WARN] ${message}`);
    },

    error(message, error) {
        if (!config.logging.enabled || !config.logging.logErrors) return;
        console.error(`[${timestamp()}] [ERROR] ${message}`);
        if (error) console.error(error);
    },

    command(user, commandName, guild) {
        if (!config.logging.enabled || !config.logging.logCommands) return;
        console.log(
            `[${timestamp()}] [COMMAND] ${user.tag} (${user.id}) hat /${commandName} in "${guild?.name || 'DM'}" (${guild?.id || '-'}) ausgeführt`
        );
    },

    voice(message) {
        if (!config.logging.enabled || !config.logging.logVoiceEvents) return;
        console.log(`[${timestamp()}] [VOICE] ${message}`);
    },
};

module.exports = logger;

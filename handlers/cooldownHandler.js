// handlers/cooldownHandler.js
// Einfaches Cooldown-System gegen Befehls-Spam, pro Nutzer und Befehl.

const config = require('../config/config');

// Map<string("userId-commandName"), timestamp>
const cooldowns = new Map();

/**
 * Prüft, ob ein Nutzer einen Befehl gerade nutzen darf.
 * @returns {number} 0 wenn erlaubt, sonst verbleibende Zeit in Sekunden
 */
function checkCooldown(userId, commandName) {
    const key = `${userId}-${commandName}`;
    const now = Date.now();
    const lastUsed = cooldowns.get(key);

    if (lastUsed && now - lastUsed < config.commandCooldown) {
        const remaining = (config.commandCooldown - (now - lastUsed)) / 1000;
        return remaining;
    }

    cooldowns.set(key, now);
    return 0;
}

module.exports = { checkCooldown };

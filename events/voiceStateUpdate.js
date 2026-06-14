// events/voiceStateUpdate.js
// Überwacht Voice-Channel-Änderungen:
// - Bot verlässt den Channel, wenn er leer wird (niemand mehr außer dem Bot)
// - Musik wird gestoppt, wenn der Channel leer wird

const { Events } = require('discord.js');
const queueManager = require('../music/QueueManager');
const logger = require('../handlers/logger');

module.exports = {
    name: Events.VoiceStateUpdate,

    async execute(oldState, newState, client) {
        const guildId = oldState.guild.id || newState.guild.id;
        const queue = queueManager.get(guildId);

        if (!queue || !queue.voiceChannel) return;

        const voiceChannel = queue.voiceChannel;

        // Aktuelle Mitgliederzahl im Bot-Voice-Channel (ohne Bots zählen)
        const membersInChannel = voiceChannel.members.filter((member) => !member.user.bot);

        if (membersInChannel.size === 0) {
            // Channel ist leer (außer Bot) -> Musik stoppen und Timer für Verlassen starten
            if (queue.playing) {
                logger.voice(`Voice-Channel "${voiceChannel.name}" in Guild ${guildId} ist leer - Musik wird gestoppt.`);
                queue.player.pause(); // Wiedergabe pausieren statt komplett stoppen
            }

            queue.scheduleLeaveOnEmpty();
        } else {
            // Es ist wieder jemand da -> Timer abbrechen und ggf. fortsetzen
            queue._clearEmptyTimeout();

            if (queue.player.state.status === 'paused') {
                queue.player.unpause();
            }
        }
    },
};

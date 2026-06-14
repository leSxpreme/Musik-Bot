// music/checks.js
// Wiederverwendbare Prüfungen für Musik-Befehle.

const { errorEmbed } = require('./embeds');
const queueManager = require('./QueueManager');

/**
 * Prüft, ob der Nutzer in einem Voice-Channel ist und der Bot eine aktive Queue hat.
 * Sendet bei Fehlern automatisch eine Antwort und gibt null zurück.
 *
 * @returns {object|null} Die MusicQueue oder null bei Fehler
 */
async function getActiveQueueOrReply(interaction, { requireSameChannel = true, requirePlaying = false } = {}) {
    const member = interaction.member;
    const voiceChannel = member.voice.channel;

    if (!voiceChannel) {
        await interaction.reply({
            embeds: [errorEmbed('Du musst dich in einem Voice-Channel befinden, um diesen Befehl zu nutzen.')],
            ephemeral: true,
        });
        return null;
    }

    const queue = queueManager.get(interaction.guild.id);

    if (!queue || (!queue.currentSong && queue.songs.length === 0)) {
        await interaction.reply({
            embeds: [errorEmbed('Aktuell läuft keine Musik.')],
            ephemeral: true,
        });
        return null;
    }

    if (requireSameChannel && queue.voiceChannel && queue.voiceChannel.id !== voiceChannel.id) {
        await interaction.reply({
            embeds: [errorEmbed(`Du musst dich in <#${queue.voiceChannel.id}> befinden, um diesen Befehl zu nutzen.`)],
            ephemeral: true,
        });
        return null;
    }

    if (requirePlaying && !queue.currentSong) {
        await interaction.reply({
            embeds: [errorEmbed('Aktuell läuft kein Song.')],
            ephemeral: true,
        });
        return null;
    }

    return queue;
}

module.exports = { getActiveQueueOrReply };

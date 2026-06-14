// commands/nowplaying.js
// Zeigt den aktuell laufenden Song mit Fortschrittsbalken an.

const { SlashCommandBuilder } = require('discord.js');
const queueManager = require('../music/QueueManager');
const { nowPlayingEmbed, errorEmbed } = require('../music/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('Zeigt den aktuell laufenden Song an.'),

    async execute(interaction) {
        const queue = queueManager.get(interaction.guild.id);

        if (!queue || !queue.currentSong) {
            return interaction.reply({
                embeds: [errorEmbed('Aktuell läuft kein Song.')],
                ephemeral: true,
            });
        }

        const currentSeconds = Math.floor(queue.getPlaybackDuration() / 1000);

        await interaction.reply({
            embeds: [nowPlayingEmbed(queue.currentSong, currentSeconds, queue.volume, queue.loopMode)],
        });
    },
};

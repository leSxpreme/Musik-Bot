// commands/skip.js
// Überspringt den aktuell laufenden Song.

const { SlashCommandBuilder } = require('discord.js');
const { getActiveQueueOrReply } = require('../music/checks');
const { successEmbed } = require('../music/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Überspringt den aktuell laufenden Song.'),

    async execute(interaction) {
        const queue = await getActiveQueueOrReply(interaction, { requirePlaying: true });
        if (!queue) return;

        const skippedTitle = queue.currentSong.title;
        queue.skip();

        await interaction.reply({
            embeds: [successEmbed('⏭️ Song übersprungen', `**${skippedTitle}** wurde übersprungen.`)],
        });
    },
};

// commands/pause.js
// Pausiert die aktuelle Wiedergabe.

const { SlashCommandBuilder } = require('discord.js');
const { getActiveQueueOrReply } = require('../music/checks');
const { successEmbed, errorEmbed } = require('../music/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pausiert die aktuelle Wiedergabe.'),

    async execute(interaction) {
        const queue = await getActiveQueueOrReply(interaction, { requirePlaying: true });
        if (!queue) return;

        const success = queue.pause();

        if (!success) {
            return interaction.reply({
                embeds: [errorEmbed('Die Wiedergabe konnte nicht pausiert werden (eventuell schon pausiert).')],
                ephemeral: true,
            });
        }

        await interaction.reply({
            embeds: [successEmbed('⏸️ Pausiert', `**${queue.currentSong.title}** wurde pausiert.`)],
        });
    },
};

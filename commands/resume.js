// commands/resume.js
// Setzt die pausierte Wiedergabe fort.

const { SlashCommandBuilder } = require('discord.js');
const { getActiveQueueOrReply } = require('../music/checks');
const { successEmbed, errorEmbed } = require('../music/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Setzt die pausierte Wiedergabe fort.'),

    async execute(interaction) {
        const queue = await getActiveQueueOrReply(interaction, { requirePlaying: true });
        if (!queue) return;

        const success = queue.resume();

        if (!success) {
            return interaction.reply({
                embeds: [errorEmbed('Die Wiedergabe konnte nicht fortgesetzt werden (eventuell läuft sie schon).')],
                ephemeral: true,
            });
        }

        await interaction.reply({
            embeds: [successEmbed('▶️ Fortgesetzt', `**${queue.currentSong.title}** wird fortgesetzt.`)],
        });
    },
};

// commands/queue.js
// Zeigt die aktuelle Warteschlange an.

const { SlashCommandBuilder } = require('discord.js');
const queueManager = require('../music/QueueManager');
const { queueEmbed, errorEmbed } = require('../music/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Zeigt die aktuelle Warteschlange an.')
        .addIntegerOption((option) =>
            option
                .setName('seite')
                .setDescription('Seitenzahl der Warteschlange')
                .setRequired(false)
                .setMinValue(1)
        ),

    async execute(interaction) {
        const queue = queueManager.get(interaction.guild.id);

        if (!queue || (!queue.currentSong && queue.songs.length === 0)) {
            return interaction.reply({
                embeds: [errorEmbed('Die Warteschlange ist leer.')],
                ephemeral: true,
            });
        }

        const page = interaction.options.getInteger('seite') || 1;

        await interaction.reply({
            embeds: [queueEmbed(queue, page)],
        });
    },
};

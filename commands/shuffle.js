// commands/shuffle.js
// Mischt die Warteschlange zufällig durch.

const { SlashCommandBuilder } = require('discord.js');
const { getActiveQueueOrReply } = require('../music/checks');
const { successEmbed, errorEmbed } = require('../music/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shuffle')
        .setDescription('Mischt die Warteschlange zufällig durch.'),

    async execute(interaction) {
        const queue = await getActiveQueueOrReply(interaction, { requirePlaying: false });
        if (!queue) return;

        if (queue.songs.length < 2) {
            return interaction.reply({
                embeds: [errorEmbed('Es müssen mindestens 2 Songs in der Warteschlange sein, um zu mischen.')],
                ephemeral: true,
            });
        }

        queue.shuffle();

        await interaction.reply({
            embeds: [successEmbed('🔀 Gemischt', `Die Warteschlange mit **${queue.songs.length} Songs** wurde durchgemischt.`)],
        });
    },
};

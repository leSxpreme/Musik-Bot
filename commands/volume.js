// commands/volume.js
// Stellt die Wiedergabelautstärke ein (0-100%).

const { SlashCommandBuilder } = require('discord.js');
const { getActiveQueueOrReply } = require('../music/checks');
const { successEmbed } = require('../music/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('Stellt die Lautstärke ein (0-100).')
        .addIntegerOption((option) =>
            option
                .setName('prozent')
                .setDescription('Lautstärke in Prozent (0-100)')
                .setRequired(true)
                .setMinValue(0)
                .setMaxValue(100)
        ),

    async execute(interaction) {
        const queue = await getActiveQueueOrReply(interaction, { requirePlaying: false });
        if (!queue) return;

        const volume = interaction.options.getInteger('prozent');
        queue.setVolume(volume);

        await interaction.reply({
            embeds: [successEmbed('🔊 Lautstärke geändert', `Die Lautstärke wurde auf **${volume}%** gesetzt.`)],
        });
    },
};

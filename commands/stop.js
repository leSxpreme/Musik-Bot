// commands/stop.js
// Stoppt die Musik komplett, leert die Queue und verlässt den Voice-Channel.

const { SlashCommandBuilder } = require('discord.js');
const { getActiveQueueOrReply } = require('../music/checks');
const { successEmbed } = require('../music/embeds');
const queueManager = require('../music/QueueManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stoppt die Musik, leert die Warteschlange und verlässt den Voice-Channel.'),

    async execute(interaction) {
        const queue = await getActiveQueueOrReply(interaction, { requirePlaying: false });
        if (!queue) return;

        queueManager.delete(interaction.guild.id);

        await interaction.reply({
            embeds: [successEmbed('⏹️ Gestoppt', 'Die Musik wurde gestoppt, die Warteschlange geleert und ich habe den Voice-Channel verlassen.')],
        });
    },
};

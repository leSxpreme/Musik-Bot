// commands/loop.js
// Schaltet den Wiederholungsmodus um (Aus / Song / Warteschlange).

const { SlashCommandBuilder } = require('discord.js');
const { getActiveQueueOrReply } = require('../music/checks');
const { successEmbed } = require('../music/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Schaltet den Wiederholungsmodus um.')
        .addStringOption((option) =>
            option
                .setName('modus')
                .setDescription('Wiederholungsmodus')
                .setRequired(true)
                .addChoices(
                    { name: 'Aus', value: 'off' },
                    { name: 'Song wiederholen', value: 'song' },
                    { name: 'Warteschlange wiederholen', value: 'queue' }
                )
        ),

    async execute(interaction) {
        const queue = await getActiveQueueOrReply(interaction, { requirePlaying: false });
        if (!queue) return;

        const mode = interaction.options.getString('modus');
        queue.setLoop(mode);

        const modeText = {
            off: 'Aus',
            song: '🔂 Aktueller Song wird wiederholt',
            queue: '🔁 Die gesamte Warteschlange wird wiederholt',
        };

        await interaction.reply({
            embeds: [successEmbed('🔁 Loop-Modus geändert', modeText[mode])],
        });
    },
};

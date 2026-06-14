// commands/play.js
// Spielt einen Song über YouTube-Link oder Suchbegriff ab. Fügt ihn der Queue hinzu.

const { SlashCommandBuilder, ChannelType } = require('discord.js');
const queueManager = require('../music/QueueManager');
const { resolveQuery } = require('../music/search');
const { songAddedEmbed, nowPlayingEmbed, errorEmbed } = require('../music/embeds');
const logger = require('../handlers/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Spielt einen Song über YouTube-Link oder Suchbegriff ab.')
        .addStringOption((option) =>
            option
                .setName('suchbegriff')
                .setDescription('YouTube-Link oder Suchbegriff')
                .setRequired(true)
        ),

    async execute(interaction) {
        const query = interaction.options.getString('suchbegriff');
        const member = interaction.member;
        const voiceChannel = member.voice.channel;

        // Nutzer muss in einem Voice-Channel sein
        if (!voiceChannel) {
            return interaction.reply({
                embeds: [errorEmbed('Du musst dich in einem Voice-Channel befinden, um Musik abzuspielen.')],
                ephemeral: true,
            });
        }

        // Voice-Channel muss vom Typ "Voice" sein (kein Stage-Channel etc.)
        if (voiceChannel.type !== ChannelType.GuildVoice) {
            return interaction.reply({
                embeds: [errorEmbed('Ich kann nur in normalen Voice-Channels Musik abspielen.')],
                ephemeral: true,
            });
        }

        await interaction.deferReply();

        try {
            const queue = queueManager.getOrCreate(interaction.guild.id, interaction.channel);

            // Falls der Bot in einem anderen Channel ist, abbrechen
            if (queue.voiceChannel && queue.voiceChannel.id !== voiceChannel.id) {
                return interaction.editReply({
                    embeds: [errorEmbed(`Ich spiele bereits Musik in <#${queue.voiceChannel.id}>.`)],
                });
            }

            // Verbindung herstellen, falls noch nicht verbunden
            if (!queue.connection) {
                await queue.connect(voiceChannel);
            }

            // Songs auflösen (Link, Playlist oder Suchbegriff)
            const songs = await resolveQuery(query, interaction.user.id);

            const wasEmpty = queue.songs.length === 0 && !queue.playing;

            for (const song of songs) {
                await queue.addSong(song);
            }

            // Antwort senden
            if (songs.length > 1) {
                await interaction.editReply({
                    content: `✅ **${songs.length} Songs** wurden aus der Playlist zur Warteschlange hinzugefügt.`,
                });
            } else if (wasEmpty) {
                // Song startet sofort -> "Now Playing" senden
                await interaction.editReply({
                    embeds: [nowPlayingEmbed(songs[0], 0, queue.volume, queue.loopMode)],
                });
            } else {
                const position = queue.songs.length; // Position in der Queue (1-basiert)
                await interaction.editReply({
                    embeds: [songAddedEmbed(songs[0], position)],
                });
            }
        } catch (error) {
            logger.error('Fehler im /play Befehl', error);
            await interaction.editReply({
                embeds: [errorEmbed(error.message || 'Beim Abspielen ist ein Fehler aufgetreten.')],
            });
        }
    },
};

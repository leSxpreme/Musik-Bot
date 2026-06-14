// music/embeds.js
// Erstellt einheitliche, moderne Embeds für Musik-Befehle.

const { EmbedBuilder } = require('discord.js');
const config = require('../config/config');

/**
 * Wandelt Sekunden in ein lesbares Format um (z.B. 1:23:45 oder 3:21).
 */
function formatDuration(seconds) {
    if (!seconds || seconds <= 0) return 'Live / Unbekannt';

    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) {
        return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Erstellt einen Fortschrittsbalken als Text.
 * Beispiel: ▬▬▬▬🔘▬▬▬▬▬▬ 1:23 / 3:45
 */
function createProgressBar(currentSeconds, totalSeconds, length = 15) {
    if (!totalSeconds || totalSeconds <= 0) {
        return `🔴 LIVE`;
    }

    const ratio = Math.min(currentSeconds / totalSeconds, 1);
    const progressIndex = Math.round(length * ratio);

    let bar = '';
    for (let i = 0; i < length; i++) {
        bar += i === progressIndex ? '🔘' : '▬';
    }

    return `${bar}\n${formatDuration(currentSeconds)} / ${formatDuration(totalSeconds)}`;
}

/**
 * Standard-Erfolgs-Embed.
 */
function successEmbed(title, description) {
    return new EmbedBuilder()
        .setColor(config.embedColorSuccess)
        .setTitle(title)
        .setDescription(description)
        .setTimestamp();
}

/**
 * Standard-Fehler-Embed.
 */
function errorEmbed(description) {
    return new EmbedBuilder()
        .setColor(config.embedColorError)
        .setTitle('❌ Fehler')
        .setDescription(description)
        .setTimestamp();
}

/**
 * Embed für "Song zur Queue hinzugefügt".
 */
function songAddedEmbed(song, position) {
    const embed = new EmbedBuilder()
        .setColor(config.embedColor)
        .setTitle('🎶 Song zur Warteschlange hinzugefügt')
        .setDescription(`**[${song.title}](${song.url})**`)
        .addFields(
            { name: '⏱️ Dauer', value: formatDuration(song.duration), inline: true },
            { name: '📍 Position', value: `#${position}`, inline: true },
            { name: '🙋 Angefragt von', value: `<@${song.requestedBy}>`, inline: true }
        )
        .setTimestamp();

    if (song.thumbnail) embed.setThumbnail(song.thumbnail);

    return embed;
}

/**
 * Embed für "Now Playing" mit Fortschrittsbalken.
 */
function nowPlayingEmbed(song, currentSeconds, volume, loopMode) {
    const loopText = {
        off: 'Aus',
        song: '🔂 Song',
        queue: '🔁 Warteschlange',
    };

    const embed = new EmbedBuilder()
        .setColor(config.embedColor)
        .setTitle('🎵 Aktuell läuft')
        .setDescription(`**[${song.title}](${song.url})**`)
        .addFields(
            { name: 'Fortschritt', value: createProgressBar(currentSeconds, song.duration) },
            { name: '🔊 Lautstärke', value: `${volume}%`, inline: true },
            { name: '🔁 Loop', value: loopText[loopMode] || 'Aus', inline: true },
            { name: '🙋 Angefragt von', value: `<@${song.requestedBy}>`, inline: true }
        )
        .setTimestamp();

    if (song.thumbnail) embed.setThumbnail(song.thumbnail);

    return embed;
}

/**
 * Embed für die Queue-Anzeige.
 */
function queueEmbed(queue, page = 1, perPage = 10) {
    const embed = new EmbedBuilder()
        .setColor(config.embedColor)
        .setTitle('📜 Warteschlange')
        .setTimestamp();

    if (!queue.currentSong && queue.songs.length === 0) {
        embed.setDescription('Die Warteschlange ist leer.');
        return embed;
    }

    let description = '';

    if (queue.currentSong) {
        description += `**Aktuell läuft:**\n🎵 [${queue.currentSong.title}](${queue.currentSong.url}) • ${formatDuration(queue.currentSong.duration)}\n\n`;
    }

    if (queue.songs.length > 0) {
        const start = (page - 1) * perPage;
        const end = start + perPage;
        const songsToShow = queue.songs.slice(start, end);

        description += `**Nächste Songs:**\n`;
        description += songsToShow
            .map((song, i) => `${start + i + 1}. [${song.title}](${song.url}) • ${formatDuration(song.duration)}`)
            .join('\n');

        const totalPages = Math.ceil(queue.songs.length / perPage);
        if (totalPages > 1) {
            description += `\n\nSeite ${page}/${totalPages}`;
        }
    } else {
        description += '**Nächste Songs:** Keine weiteren Songs in der Warteschlange.';
    }

    embed.setDescription(description);
    embed.setFooter({ text: `${queue.songs.length} Song(s) in der Warteschlange • Loop: ${queue.loopMode}` });

    return embed;
}

module.exports = {
    formatDuration,
    createProgressBar,
    successEmbed,
    errorEmbed,
    songAddedEmbed,
    nowPlayingEmbed,
    queueEmbed,
};

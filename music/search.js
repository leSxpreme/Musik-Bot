// music/search.js
// Hilfsfunktionen zum Auflösen von YouTube-Links oder Suchbegriffen in Song-Objekte.

const play = require('play-dl');

/**
 * Prüft, ob ein String eine gültige URL ist.
 */
function isUrl(text) {
    try {
        new URL(text);
        return true;
    } catch {
        return false;
    }
}

/**
 * Löst eine Eingabe (URL oder Suchbegriff) zu einem oder mehreren Song-Objekten auf.
 *
 * @param {string} query - YouTube-Link oder Suchbegriff
 * @param {string} requestedById - Discord-User-ID des Anfragenden
 * @returns {Promise<Array<object>>} Array von Song-Objekten
 */
async function resolveQuery(query, requestedById) {
    // === Fall 1: YouTube-Playlist-Link ===
    if (isUrl(query) && play.yt_validate(query) === 'playlist') {
        const playlist = await play.playlist_info(query, { incomplete: true });
        const videos = await playlist.all_videos();

        return videos.map((video) => mapVideoToSong(video, requestedById));
    }

    // === Fall 2: YouTube-Video-Link ===
    if (isUrl(query) && play.yt_validate(query) === 'video') {
        const info = await play.video_basic_info(query);
        return [mapVideoToSong(info.video_details, requestedById)];
    }

    // === Fall 3: Andere URL (nicht unterstützt) ===
    if (isUrl(query)) {
        throw new Error('Dieser Link wird nicht unterstützt. Bitte gib einen YouTube-Link oder einen Suchbegriff an.');
    }

    // === Fall 4: Suchbegriff -> YouTube-Suche ===
    const results = await play.search(query, { limit: 1, source: { youtube: 'video' } });

    if (!results || results.length === 0) {
        throw new Error(`Keine Ergebnisse für "${query}" gefunden.`);
    }

    return [mapVideoToSong(results[0], requestedById)];
}

/**
 * Wandelt ein play-dl Video-Objekt in unser einheitliches Song-Format um.
 */
function mapVideoToSong(video, requestedById) {
    return {
        title: video.title || 'Unbekannter Titel',
        url: video.url,
        duration: video.durationInSec || 0,
        thumbnail: video.thumbnails?.[video.thumbnails.length - 1]?.url || null,
        requestedBy: requestedById,
    };
}

module.exports = {
    isUrl,
    resolveQuery,
};

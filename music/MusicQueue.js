// music/MusicQueue.js
// Verwaltet die Warteschlange, den Audio-Player und den Voice-Connection-Status
// für eine einzelne Guild (Server).

const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
    VoiceConnectionStatus,
    entersState,
    StreamType,
} = require('@discordjs/voice');
const play = require('play-dl');
const logger = require('../handlers/logger');
const config = require('../config/config');

class MusicQueue {
    constructor(guildId, textChannel) {
        this.guildId = guildId;
        this.textChannel = textChannel; // Channel für Embed-Updates ("Now Playing" etc.)
        this.voiceChannel = null;
        this.connection = null;
        this.player = createAudioPlayer();

        this.songs = []; // Array von Song-Objekten
        this.currentSong = null;
        this.volume = config.defaultVolume;
        this.loopMode = 'off'; // 'off' | 'song' | 'queue'
        this.playing = false;

        // Timer für automatisches Verlassen
        this.emptyTimeout = null;
        this.endTimeout = null;

        this._registerPlayerEvents();
    }

    /**
     * Registriert die Events des AudioPlayers (Songwechsel, Fehler etc.)
     */
    _registerPlayerEvents() {
        this.player.on(AudioPlayerStatus.Idle, () => {
            this._onSongEnd();
        });

        this.player.on('error', (error) => {
            logger.error(`AudioPlayer-Fehler in Guild ${this.guildId}`, error);
            this._onSongEnd(true);
        });
    }

    /**
     * Verbindet den Bot mit einem Voice-Channel.
     */
    async connect(voiceChannel) {
        this.voiceChannel = voiceChannel;

        this.connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            selfDeaf: true,
        });

        try {
            await entersState(this.connection, VoiceConnectionStatus.Ready, 20_000);
        } catch (error) {
            this.connection.destroy();
            throw new Error('Konnte keine Verbindung zum Voice-Channel herstellen.');
        }

        this.connection.subscribe(this.player);

        // Verbindungs-Status überwachen (z.B. Disconnects)
        this.connection.on(VoiceConnectionStatus.Disconnected, async () => {
            try {
                await Promise.race([
                    entersState(this.connection, VoiceConnectionStatus.Signalling, 5_000),
                    entersState(this.connection, VoiceConnectionStatus.Connecting, 5_000),
                ]);
            } catch {
                this.destroy();
            }
        });

        logger.voice(`Bot ist Voice-Channel "${voiceChannel.name}" in Guild ${this.guildId} beigetreten`);
    }

    /**
     * Fügt einen Song zur Queue hinzu und startet die Wiedergabe, falls nichts läuft.
     */
    async addSong(song) {
        if (this.songs.length >= config.maxQueueSize) {
            throw new Error(`Die Warteschlange ist voll (max. ${config.maxQueueSize} Songs).`);
        }

        this.songs.push(song);

        // Wenn aktuell nichts spielt, starte die Wiedergabe
        if (!this.playing) {
            await this.play();
        }
    }

    /**
     * Spielt den nächsten Song aus der Queue ab.
     */
    async play() {
        this._clearEndTimeout();

        if (this.songs.length === 0) {
            this.playing = false;
            this.currentSong = null;
            this._scheduleLeaveOnEnd();
            return;
        }

        this.currentSong = this.songs.shift();
        this.playing = true;

        try {
            const stream = await play.stream(this.currentSong.url, {
                discordPlayerCompatibility: false,
            });

            const resource = createAudioResource(stream.stream, {
                inputType: stream.type,
                inlineVolume: true,
            });

            resource.volume.setVolume(this.volume / 100);
            this.currentResource = resource;
            this.startTimestamp = Date.now();

            this.player.play(resource);
        } catch (error) {
            logger.error(`Fehler beim Abspielen von "${this.currentSong.title}"`, error);
            // Bei Fehler: nächsten Song versuchen
            await this.play();
        }
    }

    /**
     * Wird aufgerufen, wenn ein Song zu Ende ist oder ein Fehler auftritt.
     */
    async _onSongEnd(wasError = false) {
        if (!this.currentSong) return;

        // Loop: Song wiederholen
        if (this.loopMode === 'song' && !wasError) {
            this.songs.unshift(this.currentSong);
        }
        // Loop: Queue wiederholen (Song wandert ans Ende)
        else if (this.loopMode === 'queue' && !wasError) {
            this.songs.push(this.currentSong);
        }

        await this.play();
    }

    /**
     * Skip zum nächsten Song.
     */
    skip() {
        // Bei aktivem Song-Loop: aktuellen Song nicht erneut einreihen
        if (this.loopMode === 'song') {
            this.loopMode = 'off';
        }
        this.player.stop(true); // löst Idle-Event aus -> nächster Song
    }

    pause() {
        return this.player.pause();
    }

    resume() {
        return this.player.unpause();
    }

    /**
     * Stoppt die Wiedergabe komplett und leert die Queue.
     */
    stop() {
        this.songs = [];
        this.loopMode = 'off';
        this.player.stop(true);
        this.currentSong = null;
        this.playing = false;
    }

    /**
     * Setzt die Lautstärke (0-100).
     */
    setVolume(volume) {
        this.volume = volume;
        if (this.currentResource && this.currentResource.volume) {
            this.currentResource.volume.setVolume(volume / 100);
        }
    }

    /**
     * Mischt die Queue zufällig durch (Fisher-Yates).
     */
    shuffle() {
        for (let i = this.songs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.songs[i], this.songs[j]] = [this.songs[j], this.songs[i]];
        }
    }

    /**
     * Setzt den Loop-Modus: 'off', 'song' oder 'queue'.
     */
    setLoop(mode) {
        this.loopMode = mode;
    }

    /**
     * Gibt die aktuelle Wiedergabezeit in ms zurück.
     */
    getPlaybackDuration() {
        if (!this.currentResource) return 0;
        return this.currentResource.playbackDuration;
    }

    /**
     * Plant das automatische Verlassen, wenn der Channel leer ist.
     */
    scheduleLeaveOnEmpty() {
        if (!config.leaveOnEmpty) return;
        this._clearEmptyTimeout();

        this.emptyTimeout = setTimeout(() => {
            logger.voice(`Voice-Channel in Guild ${this.guildId} ist leer - Bot verlässt den Channel.`);
            this.stop();
            this.destroy();

            if (this.textChannel) {
                this.textChannel.send('👋 Ich habe den Voice-Channel verlassen, da niemand mehr anwesend war und die Musik gestoppt.').catch(() => {});
            }
        }, config.leaveOnEmptyDelay);
    }

    _clearEmptyTimeout() {
        if (this.emptyTimeout) {
            clearTimeout(this.emptyTimeout);
            this.emptyTimeout = null;
        }
    }

    /**
     * Plant das automatische Verlassen, wenn die Queue zu Ende ist.
     */
    _scheduleLeaveOnEnd() {
        if (!config.leaveOnEnd) return;
        this._clearEndTimeout();

        this.endTimeout = setTimeout(() => {
            logger.voice(`Queue in Guild ${this.guildId} beendet - Bot verlässt den Channel.`);
            this.destroy();

            if (this.textChannel) {
                this.textChannel.send('✅ Die Warteschlange ist beendet. Ich habe den Voice-Channel verlassen.').catch(() => {});
            }
        }, config.leaveOnEndDelay);
    }

    _clearEndTimeout() {
        if (this.endTimeout) {
            clearTimeout(this.endTimeout);
            this.endTimeout = null;
        }
    }

    /**
     * Trennt die Verbindung und räumt auf.
     */
    destroy() {
        this._clearEmptyTimeout();
        this._clearEndTimeout();

        try {
            this.player.stop(true);
            if (this.connection) {
                this.connection.destroy();
            }
        } catch (error) {
            logger.error('Fehler beim Aufräumen der MusicQueue', error);
        }
    }
}

module.exports = MusicQueue;

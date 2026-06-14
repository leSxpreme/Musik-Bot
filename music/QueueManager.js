// music/QueueManager.js
// Verwaltet alle aktiven MusicQueues (eine pro Guild).

const MusicQueue = require('./MusicQueue');

class QueueManager {
    constructor() {
        this.queues = new Map(); // guildId -> MusicQueue
    }

    /**
     * Holt die Queue für eine Guild oder erstellt eine neue.
     */
    getOrCreate(guildId, textChannel) {
        let queue = this.queues.get(guildId);
        if (!queue) {
            queue = new MusicQueue(guildId, textChannel);
            this.queues.set(guildId, queue);
        }
        return queue;
    }

    /**
     * Holt die Queue für eine Guild (ohne sie zu erstellen).
     */
    get(guildId) {
        return this.queues.get(guildId);
    }

    /**
     * Löscht und zerstört die Queue für eine Guild.
     */
    delete(guildId) {
        const queue = this.queues.get(guildId);
        if (queue) {
            queue.destroy();
            this.queues.delete(guildId);
        }
    }

    has(guildId) {
        return this.queues.has(guildId);
    }
}

// Singleton-Instanz, damit alle Commands/Events dieselbe Verwaltung nutzen
module.exports = new QueueManager();

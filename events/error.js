// events/error.js
// Fängt globale Client-Fehler ab und protokolliert sie.

const { Events } = require('discord.js');
const logger = require('../handlers/logger');

module.exports = {
    name: Events.Error,

    async execute(error) {
        logger.error('Discord Client Fehler', error);
    },
};

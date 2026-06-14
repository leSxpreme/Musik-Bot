// events/interactionCreate.js
// Verarbeitet eingehende Slash-Command-Interaktionen.

const { Events } = require('discord.js');
const logger = require('../handlers/logger');
const { checkCooldown } = require('../handlers/cooldownHandler');
const { errorEmbed } = require('../music/embeds');

module.exports = {
    name: Events.InteractionCreate,

    async execute(interaction, client) {
        if (!interaction.isChatInputCommand()) return;

        const command = client.commands.get(interaction.commandName);

        if (!command) {
            logger.warn(`Unbekannter Befehl ausgeführt: /${interaction.commandName}`);
            return interaction.reply({
                embeds: [errorEmbed('Dieser Befehl existiert nicht (mehr).')],
                ephemeral: true,
            });
        }

        // === Cooldown-Prüfung ===
        const remaining = checkCooldown(interaction.user.id, interaction.commandName);
        if (remaining > 0) {
            return interaction.reply({
                embeds: [errorEmbed(`Bitte warte noch **${remaining.toFixed(1)}s**, bevor du diesen Befehl erneut nutzt.`)],
                ephemeral: true,
            });
        }

        // === Logging ===
        logger.command(interaction.user, interaction.commandName, interaction.guild);

        // === Befehl ausführen mit Fehlerbehandlung ===
        try {
            await command.execute(interaction, client);
        } catch (error) {
            logger.error(`Fehler beim Ausführen von /${interaction.commandName}`, error);

            const errorReply = {
                embeds: [errorEmbed('Beim Ausführen dieses Befehls ist ein unerwarteter Fehler aufgetreten.')],
                ephemeral: true,
            };

            try {
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(errorReply);
                } else {
                    await interaction.reply(errorReply);
                }
            } catch (followUpError) {
                logger.error('Fehler beim Senden der Fehlermeldung', followUpError);
            }
        }
    },
};

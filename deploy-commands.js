const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, token } = require('./config.json');

const commands = [
    new SlashCommandBuilder().setName('info').setDescription('Gives info on the bot connected!'),
    new SlashCommandBuilder()
        .setName('talk')
        .setDescription('Makes the bot talk!')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Message for the bot')
                .setRequired(true)
    ),
    new SlashCommandBuilder().setName('coords').setDescription('Gives the bot\'s coordinates!'),
    new SlashCommandBuilder()
        .setName('fight')
        .setDescription('Fights specified player')
        .addStringOption(option =>
            option.setName('player')
                .setDescription('Player to fight')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('time')
                .setDescription('How long the bot will fight')
                .setRequired(true)
        ),
    new SlashCommandBuilder()
        .setName('follow')
        .setDescription('Follows a player')
        .addStringOption(option =>
            option.setName('player')
                .setDescription('Player to follow')
                .setRequired(true)
        ),
    new SlashCommandBuilder()
        .setName('stopfollow')
        .setDescription('Stops following player')
]
    .map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error);
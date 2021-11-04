const mineflayer = require('mineflayer');
const { Client, Intents, MessageEmbed} = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS] })
const { token } = require('./config.json');
const inventoryViewer = require('mineflayer-web-inventory')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const pvp = require('mineflayer-pvp').plugin
const GoalFollow = goals.GoalFollow


let email, password, serverip;
let followOn;

const questions = [
    'Bot Email?',
    'Bot Password?',
    'Server IP?'
];
const answers = [];
const ask = (i = 0) => {
    process.stdout.write(`\n${questions[i]} > `)
};

process.stdin.on('data', data => {
    answers.push(data.toString().trim())
    if (answers.length < questions.length) {
        ask(answers.length);
    } else {
        finish()
    }
});

function finish() {

    let [email, password, serverip] = answers;

    const bot = mineflayer.createBot({
        host: serverip,
        username: email,
        password: password
    })
    /* bot.on('chat', (username, message) => {
        console.log(`${username} > ${message}`)
    }) */

    bot.on('message', (message) => {
        console.log(message.toAnsi())
    })

    bot.once('spawn', () => {
        bot.loadPlugin(pathfinder);
        bot.loadPlugin(pvp);
    })

    client.once('ready', () => {
        console.log('Bot ready')
    })

    client.on('interactionCreate', async interaction => {
        if (!interaction.isCommand()) return;

        const { commandName } = interaction;
        if (commandName === 'info') {
            const infoEmbed = new MessageEmbed()
                .setTitle(`Bot Connected: ${bot.player.username}`)
                .setThumbnail(`https://crafatar.com/avatars/${bot.player.uuid}`)
                .addField('Ping', `${bot.player.ping}`)
                .addField('Health', `${bot.health}`)
                .addField('Version', `${bot.version}`)
            await interaction.reply({ embeds: [infoEmbed] })
        }
        if (commandName === 'coords') {
            const coordEmbed = new MessageEmbed()
                .setTitle(`Current Coords: ${bot.entity.position}`)
                .setFooter(`For ${bot.username}`)
            await interaction.reply({ embeds: [coordEmbed] })
        }
        if (commandName === 'talk') {
            const message = interaction.options.getString('message');
            bot.chat(message)
            await interaction.reply(`You sent \`${message}\` via **${bot.username}**`)
        }
        if (commandName === 'fight') {
            const player = interaction.options.getString('player');
            const time = interaction.options.getInteger('time');
            const target = bot.players[player]

            if (!target) {
                interaction.reply('Target Not Found!')
                return;
            }


            interaction.reply('Fighting!')
            bot.pvp.attack(target.entity)
            setTimeout(() => {
                bot.pvp.stop()
                interaction.editReply('Finished the duel.')
            }, 1000 * time)
        }
        if (commandName === 'follow') {
            const player = interaction.options.getString('player')
            const target = bot.players[player];

            if (!target || !target.entity) {
                interaction.reply('I don\'t see the target!')
                return;
            }

            const mcData = require('minecraft-data')(bot.version)
            const movements = new Movements(bot, mcData);

            bot.pathfinder.setMovements(movements);

            const goal = new GoalFollow(target.entity, 2)
            bot.pathfinder.setGoal(goal, true)

            bot.on('path_reset', (error) => {
                if (error === 'dig_error') {
                    setTimeout(() => {
                        bot.pathfinder.setGoal(null)
                        interaction.editReply('Error digging, try again!')
                    }, 1000)
                }
            })



            followOn = true
            interaction.reply(`\`Now following\` **${target.username}**`)
        }
        if (commandName === 'stopfollow') {
            if (followOn === false) {
                interaction.reply('The bot is not following anyone!')
                return;
            }
            interaction.reply('Stopped Following!')
            bot.pathfinder.setGoal(null);
            setTimeout(() => {
                followOn = false
            }, 2000)
        }
        if (commandName === 'quit') {
            interaction.reply(`\`Ending ${bot.username}\` see you soon! 👋`)
            bot.quit('Requested Quit.')
            process.exit()
        }
    })

    bot.on('kicked', console.log)
    bot.on('error', console.log)

}



ask(0)
client.login(token)







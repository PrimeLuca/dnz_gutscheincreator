const Discord = require("discord.js") 
const intents = new Discord.Intents(32767)
const bot = new Discord.Client({ intents });
const fs = require("fs");
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const { createConnection } = require('mysql');
const database = createConnection({
    host: config.database_host,
    user: config.database_user,
    post: config.database_port,
    password: config.database_password,
    database: config.database_table,
})
database.connect();
if(config.database_successnotify === true) {
    console.log(config.database_successmessage);
} else {
}
setInterval(function() {
    database.query('SELECT 1');
}, 5000);
bot.on("ready", async () =>{
    const guildID = config.guild_ID;
    const guild = bot.guilds.cache.get(guildID);
    let commands;
    if (guild) {
        commands = guild.commands;
    } else {
        commands = bot.application?.commands;
    }
    commands?.create({
        name: config.command_name,
        description: config.command_desc,
        options: [
            {
                name: config.option_name,
                description: config.option_desc,
                required: true,
                type: Discord.Constants.ApplicationCommandOptionTypes.INTEGER
            },
        ]
    })
})
bot.on('interactionCreate', (interaction) => {
    if(!interaction.isCommand()) return;

    if(interaction.commandName === config.command_name) {
        if(interaction.member.roles.cache.find(r => r.id === config.command_authrole_ID)) {
            let value = interaction.options.getInteger(config.option_name)

            function createCode() {
                var code = '';
                var string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' + 'abcdefghijklmnopqrstuvxyz0123456789@#'
            
                for(var i = 1; i <= 25; i++) {
                    var char = Math.floor(Math.random() * string.length + 1);
                    code += string.charAt(char);
            }
            return code;
        }
    
        var currentCode = createCode();

        database.query("INSERT INTO dnz_donatorcodes (code, used, codevalue) VALUES ('" + currentCode + "', '0', '" + value + "')")
        
        const codes = bot.channels.cache.find(channel => channel.id === config.logchannel_ID);

        const result = new Discord.MessageEmbed()
        .setAuthor(config.servername + ' | Gutschein', bot.user.avatarURL())
        .setTitle(config.servername + ' | Gutschein System')
        .setDescription('Gutscheincode - ``' + currentCode + '`` \n Nutzungen -  ``1`` \n Wert - ``' + value + '``')
        .setColor(config.color)
        .setFooter('developed by Лука#1212', bot.user.avatarURL())
        interaction.reply({embeds: [result]})
        const log = new Discord.MessageEmbed()
        .setAuthor(config.servername + ' | Gutschein', bot.user.avatarURL())
        .setTitle(config.servername + ' | Gutschein System')
        .setDescription('Gutscheincode - ``' + currentCode + '`` \n Nutzungen -  ``1`` \n Wert - ``' + value + '`` \n Ersteller - ' + interaction.user.tag)
        .setColor(config.color)
        .setFooter('developed by Лука#1212', bot.user.avatarURL())
        codes.send({embeds: [log]})

    } else {
        interaction.reply(config.noperms_message)
    }
        
    }
})
bot.login(config.token);
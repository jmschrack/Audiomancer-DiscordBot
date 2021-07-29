require('dotenv').config();
const Discord = require('discord.js');
const bot = new Discord.Client({intents:[Discord.Intents.FLAGS.GUILDS,Discord.Intents.FLAGS.GUILD_MESSAGES]});




bot.commands = new Discord.Collection();
const botCommands = require('./commands');
const registerCommand = require('./commands/register.js');

Object.keys(botCommands).map(key=>{
    bot.commands.set(botCommands[key].name,botCommands[key]);
  // registerCommand(botCommands[key]);
});

const botState ={};

/* bot.ws.on('INTERACTION_CREATE',async interaction=>{
    console.info(`Interaction: ${JSON.stringify(interaction)}`);
}); */


bot.on('ready', ()=>{
    bot.guilds.cache.forEach((value,key)=>{
        console.info(value.name);
    });
    
});

function replacer(key,value){
    if(key=="execute") return undefined;
    return value;
}

bot.on('messageCreate',async message=>{
    console.log(message);
    if(!bot.application?.owner) await bot.application?.fetch();

    if(message.content.toLowerCase()==='!deploy' && message.author.id === bot.application?.owner.id){
        const data =[];
        Object.keys(botCommands).map(key=>{
            data.push(JSON.parse(JSON.stringify(botCommands[key],replacer)));
          });
        const command = await bot.guilds.cache.get('690375455915900989')?.commands.set(data);
        console.log(command);
    }
   /*  if(message.content.toLowerCase()==='/join'){
        if(message.member.voice.channel){
            const connection = await message.member.voice.channel.
            botState.voiceConnetion=connection;
            //const ytdl = require('ytdl-core');
            //connection.play(ytdl('https://www.youtube.com/watch?v=cirucvXMhyc',{filter:'audioonly'}));
        }else{
            message.reply('You need to join a voice channel first!');
        }
    } */
});

bot.on('INTERACTION_CREATE', async interaction=>{
    console.log(interaction);
    if(!interaction.isCommand()) return;
    //console.log(interaction);
    if (interaction.commandName === 'ping2') await interaction.reply('Pong!');
    if(botCommands.hasKey(interaction.commandName)){
        botCommands[interaction.commandName].execute(interaction,botState);
    }
});

bot.on('message',async message =>{
    //console.log(message);
    if(message.channel.id!=process.env.LISTEN_CHANNEL) return;
    if(!message.content.startsWith("/")) return;
    
    let options=message.content.split(' ');
    const key = options[0].substring(1);
    options=options.slice(1);
    message.options=options;
    if(message.content==='/join'){
        if(message.member.voice.channel){
            const connection = await message.member.voice.channel.join();
           //connection.on('debug', console.log);
            botState.voiceConnetion=connection;
            // botState.voiceConnetion=connection;
            //const ytdl = require('ytdl-core');
            //const dispatcher=connection.play(ytdl('https://www.youtube.com/watch?v=cirucvXMhyc',{filter:'audioonly'}));
        }else{
            message.reply('You need to join a voice channel first!');
        }
    }else if(bot.commands.has(key)){
        bot.commands.get(key).execute(message,botState);
    }
});

bot.login(process.env.TOKEN);
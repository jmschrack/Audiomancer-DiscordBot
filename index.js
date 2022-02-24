
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
    console.info("Bot logged in on:");
    bot.guilds.cache.forEach((value,key)=>{
        console.info(value.name);
    });
    
});

bot.on('error',error => {
    console.error('The WebSocket encountered an error:', error);
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
    //
    if(message.channel.id!=process.env.LISTEN_CHANNEL) return;
    //console.log(message);
    if(!message.content.startsWith("/")) return;
    
    let options=message.content.split(' ');
    const key = options[0].substring(1);
    options=options.slice(1);
    message.options=options;
    
    if(bot.commands.has(key)){
        try{
            await bot.commands.get(key).execute(message,botState);
        }catch(exception){
            message.reply("There was an error processing that command.");
            console.error(exception);
        }
    }
});

bot.login(process.env.TOKEN);
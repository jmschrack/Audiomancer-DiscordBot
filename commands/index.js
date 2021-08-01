const Discord = require('discord.js');
const { filterFormats } = require('ytdl-core');


const PlayBG = {
    name: "playaudio",
    description: "Plays background music/sound",
    options:[
        {
            name:"url",
            description:"The url to play",
            type:'STRING',
            required:true
        }
    ],
    execute:function(interaction, botState){
        console.log(`playaudio::enter:${interaction.options[0]}`);
        if(interaction.options.length<1){

            botState.currentDispatcher?.resume();

            return;
        }
        
        const url=interaction.options[0];//interaction.options.get('url')
        let dispatcher=0;
        if(url.indexOf('youtube.com')>-1){
            interaction.reply("Loading youtube link...");
            const ytdl = require('ytdl-core');
            dispatcher=botState.voiceConnetion.play(ytdl(url,{filter:'audioonly'}));
        }else{
            interaction.reply("Loading...");
            dispatcher=botState.voiceConnetion.play(url); 
        }
        dispatcher.on('start', () => {
            interaction.channel.send("Playing!");
            console.log('audio.mp3 is now playing!');
        });
        
        dispatcher.on('finish', () => {
            console.log('audio.mp3 has finished playing!');
        });
        dispatcher.on('error', console.error);
        botState.currentDispatcher=dispatcher;
    }
}
const LoopBG = {
    name: "playloop",
    description: "Plays background music/sound",
    options:[
        {
            name:"url",
            description:"The url to play",
            type:'STRING',
            required:true
        }
    ],
    execute: function(interaction, botState){
        console.log(`playloop::enter:${interaction.options[0]}`);
        if(!botState.voiceConnetion){
            interaction.reply("Can't play audio unless I /join...");
            return;
        }
        if(interaction.options.length<1){
            botState.currentDispatcher?.resume();
            return;
        }

        const url=interaction.options[0];//interaction.options.get('url')
        let dispatcher=0;
        if(url.indexOf('youtube.com')>-1){
            const ytdl = require('ytdl-core');
            dispatcher=botState.voiceConnetion.play(ytdl(url,{filter:'audioonly'}));
        }else
            dispatcher=botState.voiceConnetion.play(url); 
        dispatcher.on('start', () => {
            if(botState.loopMsg){
                botState.loopCount++;
                botState.loopMsg.edit(`Looping ${botState.loopCount}`);
            }else{
                botState.loopCount=0;
                interaction.channel.send("Playing!").then(msg=>botState.loopMsg=msg);
                
            }
            //
            console.log('audio.mp3 is now playing!');
        });
        
        dispatcher.on('finish', () => {
            LoopBG.execute(interaction,botState);
        });
        dispatcher.on('error', console.error);
        botState.currentDispatcher=dispatcher;
    }
}

const StopBG = {
    name: "stopaudio",
    description: "Stops all music/sound",
    execute:function(interaction,botState){
        console.info('stopaudio::enter');
        botState.currentDispatcher?.pause();
        botState.loopMsg=undefined;
    }
}

const listQueue={
    name: "playlists",
    description:"view playlists",
    execute(message, botState){
        if(!botState.playlists){
            message.reply("There are no playlists currently!");
            return;
        }
        const lists=[];
        Object.keys(botState.playlists).map(key=>{
            lists.push(key);
        });
        message.channel.send(lists.join('\n'));
    }
}
const newPlaylist={
    name: "newplaylist",
    description:"create a playlist",
    execute(message, botState){
        if(message.options.length<1){
            message.reply("You need to specify a name! /newplaylist insertName");
            return;
        }
        if(!botState.playlists)
            botState.playlists={};
        botState.playlists[message.options[0]]=[];
        message.reply(`Done! Use /playlistadd ${message.options[0]} audioUrl`);
    }
}

const addPlaylist={
    name: "playlistadd",
    description:"add to a playlist",
    execute(message, botState){
        if(message.options.length<2){
            message.reply("You're missing some parameters!  Use /playlistadd playlistName audioUrl");
            return; 
        }
        botState.playlists[message.options[0]].push(message.options[1]);
        message.reply("Got it!");
    }
}

const viewPlaylist={
    name: "viewplaylist",
    execute(message,botState){
        if(message.options.length<1){
            message.reply("Which playlist?");
            return; 
        }
        const list=[];
        list.push(message.options[0]);
        botState.playlists[message.options[0]].forEach((element,index)=>{
            list.push(`${index} - ${element}`);
        });
        message.channel.send(list.join('\n'));
    }
}

const Join={
    name: "join",
    description:"Joins your voice channel",
    async execute(message, botState){
        console.info("/join::enter");
        if(message.member.voice.channel){
          //  try{
            const connection = await message.member.voice.channel.join();
            botState.voiceConnetion=connection;
         //   }catch(exception){
         //       console.error("Failed to join.");
       //     }
            
        }else{
            message.reply("You're not currently in a voice channel");
        }
    }
}

module.exports = {
        Join:Join,
        PlayBG: PlayBG,
        StopBG: StopBG,
        PlayLoop:LoopBG,
        Ping:{
            name: "pingaudio",
            description: "pings bot",
            execute:function(interaction,botState){
                interaction.reply("Pong!");
            }},
        listQueue,
        newPlaylist,
        addPlaylist,
        viewPlaylist,
  };
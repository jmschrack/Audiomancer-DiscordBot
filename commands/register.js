
const apiEndpoint = `https://discord.com/api/v8/applications/${process.env.BOT_ID}/commands`

function replacer(key,value){
    if(key=="execute") return undefined;
    return value;
}

module.exports= async function main (command) {

    const fetch = require('node-fetch')

    const response = await fetch(apiEndpoint, {
        method: 'post',
        body: JSON.stringify(command,replacer),
        headers: {
        'Authorization': 'Bot ' + process.env.TOKEN,
        'Content-Type': 'application/json'
        }
    })
    const json = await response.json()

    console.log(json)
}
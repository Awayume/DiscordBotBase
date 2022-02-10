const http = require('http');
const { Client } = require('discord.js');
const { Intents } = require('./intents.json');

const client = new Client({ intents: Intents.DEFAULT, partials: [ 'MESSAGE', 'CHANNEL' ] });

http.createServer((req, res) =>{
  if (req.method == 'POST'){
    var data = '';
    req.on('data', chunk =>{
      data += chunk;
    });
    req.on('end', () =>{
      if(!data){
        res.end('No post data');
        return;
      }
      var searchParams = new URLSearchParams(data);
      var dataType = searchParams.get('type');
      console.log('post:' + dataType);
      if(dataType == 'wake'){
        console.log('Woke up in post');
        res.end();
        return;
      }
      res.end();
    });
  }
  else if (req.method == 'GET'){
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Discord Bot is active now\n');
  }
}).listen(3000);

client.on('ready', async () =>{
  console.table({
    'Client user': client.user.tag,
    'Client user ID': client.user.id,
    'BOT': client.user.bot
  });
  await client.user.setPresence({ activities: [{ name: 'Your game name' }], status: 'online' });
  console.info('Ready');
});

client.on('messageCreate', async message =>{
  // message.guildやmessage.channelなどが空の場合があるので注意
  messageReceiveLog(message);
  if (message.author.bot) return;
  if(message.mentions.has(client.user, { ignoreEveryone: true })){
    await sendReply(message, '呼びましたか？');
    return;
  }
  if (message.content.match(/にゃ～ん|にゃーん/)){
    await sendMsg(message, 'にゃ～ん');
    return;
  }
});

if(process.env.DISCORD_BOT_TOKEN == undefined){
  throw new Error('Environment variable "DISCORD_BOT_TOKEN" is not set');
}

client.login(process.env.DISCORD_BOT_TOKEN)
  .then(() => console.info('Logged in to Discord'))
  .catch(err =>{
    console.error('Failed to log in to Discord\n' + err);
    process.exit(1);
  });

const messageReceiveLog = message =>{
  if (message.author.id === client.user.id) return;
  let log = {
    'Message': message.content,
    'Message ID': message.id,
    'User': message.author.tag,
    'User ID': message.author.id,
    'BOT': message.author.bot,
  }
  if (!(message.channel.type === 'DM')){
    log['Guild'] = message.guild.name
    log['Guild ID'] = message.guild.id
    log['Channel'] = message.channel.name
    log['Channel ID'] = message.channel.id
  }
  else{
    log['DM'] = true
  }
  console.group('Received a message');
  console.table(log);
  console.groupEnd();
}

const sendReply = async (message, text, options={}) =>{
  await message.reply(text, options)
    .then(msg =>{
      console.group('Sent a reply message')
      console.table({
        'Message': text,
        'Options': JSON.stringify(options),
        'Message ID': msg.id
      });
      console.groupEnd();
    })
    .catch(console.error);
}

const sendMsg = async (message, text, options={}) =>{
  await message.channel.send(text, options)
    .then(msg =>{
      console.group('Sent a message');
      console.table({
        'Message': text,
        'Options': JSON.stringify(options),
        'Message ID': msg.id
      });
      console.groupEnd();
    })
    .catch(console.error);
}

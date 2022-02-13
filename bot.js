const postServer = require('./server');
const config = require('./config.json');
const { Client, MessageEmbed } = require('discord.js');
const { Intents } = require('./intents.json');

const client = new Client({ intents: Intents.DEFAULT, partials: [ 'MESSAGE', 'CHANNEL' ] });
const prefix = config.prefix;

if (config.postWakeEnable){
  postServer.run();
}

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
  if (message.content.startsWith(prefix)){
    // BOTのコマンド(スラッシュコマンドではありません)
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    if (command === 'ping'){
      await sendMsg(message, `Pingは${client.ws.ping}msです`);
      return;
    }
    else if (command === 'embed'){
      const djsIcon = 'https://discordjs.guide/favicon.png';
      const exampleEmbed = new MessageEmbed()
        .setColor('#5865f2')
        .setTitle('サンプルEmbed')
        .setURL('https://discordjs.guide')
        .setAuthor({ name: 'Embed', iconURL: client.user.avatarURL(), url: 'https://discord.com' })
        .setDescription('Embedメッセージのサンプル')
        .setThumbnail(client.user.avatarURL())
        .addFields(
          { name: '1つ目のフィールド', value: 'メッセージ', inline: false },
          { name: '2つ目のフィールド', value: 'メッセージ', inline: false }
        )
        .addField('単体フィールド', 'メッセージ', false)
        .setImage(djsIcon)
        .setTimestamp()
        .setFooter({ text: 'フッター', iconUrl: 'https://js.org/favicon.png' });
      await sendMsg(message, { embeds: [exampleEmbed] });
      return;
    }
  }
  if(message.mentions.has(client.user, { ignoreEveryone: true })){
    await sendReply(message, '呼びましたか？');
    return;
  }
  else if (message.content.match(/にゃ～ん|にゃーん/)){
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

const messageSendLog = (type, message, args) =>{
  if (type === 'normal'){
    console.group('Sent a message');
  }
  else if (type === 'reply'){
    console.group('Send a reply message');
  }
  console.table({
    'Message': message.content,
    'Options': JSON.stringify(args),
    'Message ID': message.id
  });
  console.groupEnd();
}

const sendReply = async (message, args) =>{
  await message.reply(args)
    .then(msg =>{
      messageSendLog('reply', msg, args);
    })
    .catch(console.error);
}

const sendMsg = async (message, args) =>{
  await message.channel.send(args)
    .then(msg =>{
      messageSendLog('normal', msg, args);
    })
    .catch(console.error);
}

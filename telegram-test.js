// const { MTProto } = require('@mtproto/core');
// const { v4: uuid } = require('uuid');

// const api_id = '123';
// const api_hash = 'qwe';

// const mtproto = new MTProto({
//   api_id,
//   api_hash,
// });

// mtproto.updateInitConnectionParams({
//     app_version: '10.0.0',
// });

// mtproto.call('help.getNearestDc').then(result => {
//     console.log(`country:`, result.country);
// });

// mtproto.call('messages.sendMessage', {
//     peer: '111',
//     message: 'Test',
//     random_id: (new Date).valueOf(),
// }).then(console.log).catch(console.error);

const TelegramBot = require('node-telegram-bot-api');

// replace the value below with the Telegram token you receive from @BotFather
const token = '111:aaa';

const chatId = 111;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token/* , {polling: true} */);

bot.sendMessage(chatId, 'Foo');

// // Matches "/echo [whatever]"
// bot.onText(/\/echo (.+)/, (msg, match) => {
//   // 'msg' is the received Message from Telegram
//   // 'match' is the result of executing the regexp above on the text content
//   // of the message

//   const chatId = msg.chat.id;
//   const resp = match[1]; // the captured "whatever"

//   // send back the matched "whatever" to the chat
//   bot.sendMessage(chatId, resp);
// });

// // Listen for any kind of message. There are different kinds of
// // messages.
// bot.on('message', (msg) => {
//   const chatId = msg.chat.id;

//   // send a message to the chat acknowledging receipt of their message
//   bot.sendMessage(chatId, 'Received your message');
//   console.log(chatId);
// });
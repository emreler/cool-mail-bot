var config = require('./config');
var TelegramBot = require('node-telegram-bot-api');
var service = require('./app/service')(config);

var bot = new TelegramBot(config.telegram.token, {polling: config.telegram.polling});

bot.onText(/^\/echo (.+)/, function (msg, match) {
    var fromId = msg.from.id;
    var chatId = msg.chat.id;

    console.log(fromId, chatId);

    bot.sendMessage(fromId, match[1]);
});

bot.onText(/^\/generate */, function (msg, match) {
    var chatId = msg.chat.id;

    service.generateAddress(chatId);
});

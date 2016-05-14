const config = require('./config');

const Storage = require('./app/storage');
const Service = require('./app/service');

const TelegramBot = require('node-telegram-bot-api');
const util = require('util');

const storage = new Storage(config);
const service = new Service(config, storage);
const bot = new TelegramBot(config.telegram.token, {polling: config.telegram.polling});

bot.onText(/^\/start/, function (msg) {
    // new user comes in
    var chatId = msg.chat.id;

    bot.sendMessage(chatId, 'Welcome aboard!');
    
    service.createUser(chatId);
});

bot.onText(/^\/generate/, function (msg, match) {
    var chatId = msg.chat.id;
    var email = service.generateAddress();

    var reply = util.format('Your new email address: %s', email);

    bot.sendMessage(chatId, reply);

    service.assignEmail(chatId, email);
});

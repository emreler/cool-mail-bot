const config = require('./config');

const Storage = require('./app/storage');
const Service = require('./app/service');

const TelegramBot = require('node-telegram-bot-api');
const mailin = require('mailin');
const util = require('util');

const storage = new Storage(config);
const bot = new TelegramBot(config.telegram.token, {polling: config.telegram.polling});
const service = new Service(config, storage, bot);

bot.onText(/^\/start/, function (msg) {
    // new user comes in

    var chatId = msg.chat.id;

    bot.sendMessage(chatId, 'Welcome aboard!');
    
    service.createUser(chatId);
});

bot.onText(/^\/generate/, function (msg) {
    // generate new random email address for user

    var chatId = msg.chat.id;
    var email = service.generateAddress();

    var reply = util.format('Your new email address: %s', email);

    bot.sendMessage(chatId, reply);

    service.assignEmail(chatId, email);
});

mailin.start({
    port: config.email.port,
    disableWebhook: true
});

mailin.on('message', function (connection, data, content) {
    // data.from has sender info
    // data.to has receiver info
    // data.text has plain text content

    service.handleEmail(data.from, data.to, data.text);
});

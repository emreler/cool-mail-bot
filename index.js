const config = require('./config');
const pkg = require('./package.json');

const Storage = require('./app/storage');
const Service = require('./app/service');

const TelegramBot = require('node-telegram-bot-api');
const mailin = require('mailin');
const util = require('util');

const storage = new Storage(config);
const bot = new TelegramBot(config.telegram.token, {polling: config.telegram.polling,
    webHook: config.telegram.webHook});

if (config.telegram.webHook) {
    bot.setWebHook('https://tmp.cool/webhook/' + config.telegram.token);
}

const service = new Service(config, storage, bot);

bot.onText(/^\/start/, function (msg) {
    // new user comes in

    var chatId = msg.chat.id;

    bot.sendMessage(chatId, 'Welcome aboard!\nYou can run /generate to create your first random email address.',
        {parse_mode: 'HTML'});
    
    service.createUser(chatId);
});

bot.onText(/^\/generate/, function (msg) {
    // generate new random email address for user

    var chatId = msg.chat.id;
    var email = service.generateAddress();

    bot.sendMessage(chatId, `Your new email address: ${email}\nYou can start receiving emails from this address!

Click /test to receive some test email sent to this address.
P.S. It really sends email :)`);

    service.assignEmail(chatId, email);
});

bot.onText(/^\/test/, function (msg) {
    var chatId = msg.chat.id;

    service.sendTestEmail(chatId);
});

bot.onText(/^\/version/, function (msg) {
    var chatId = msg.chat.id;

    bot.sendMessage(chatId, `Current version: <b>${pkg.version}</b>`, {parse_mode: 'HTML'});
});

mailin.start({
    port: config.email.port,
    disableWebhook: true
});

mailin.on('message', function (connection, data, content) {
    // data.from has sender info
    // data.to has receiver info
    // data.text has plain text content

    service.handleEmail(data.from, data.to, data.subject, data.text);
});

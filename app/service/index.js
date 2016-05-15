const Storage = require('../storage');
const words = require('../lib/enDictionary');

const util = require('util');

var Service = function (config, storage, bot) {
    this.config = config;
    this.storage = storage;
    this.bot = bot;
};

Service.prototype.generateAddress = function () {
    var noun = words.nouns[Math.floor(Math.random() * words.nouns.length)];
    var adjective = words.adjectives[Math.floor(Math.random() * words.nouns.length)];

    return util.format('%s-%s@%s', noun, adjective, this.config.email.domain);
};

Service.prototype.assignEmail = function (chatId, email = this.generateAddress()) {
    return this.storage.setEmail(chatId, email)
        .then(function () {
            return {email: email};
        })
        .catch(function (err) {
            console.error(err);
        });
};

Service.prototype.createUser = function (chatId) {
    return this.storage.createUser(chatId, new Date())
        .catch(function (err) {
            console.error(err);
        });
};

Service.prototype.handleEmail = function (from, to, subject, content) {
    var recipient = to.find(function (recipient) {
        return recipient.address.endsWith('@tmp.cool');
    });

    if (!recipient) {
        throw new Error('No valid recipient domain');
    }

    if (from instanceof Array && from.length === 1) {
        from = from[0];
    } else {
        throw new Error('Invalid from field');
    }

    var self = this;

    return this.storage.findByEmail(recipient.address)
        .then(function (user) {
            var reply = util.format('You have a new email!\n\nFrom: <b>%s</b>\nSubject: <b>%s</b>\n\n%s', from.address, subject, content);

            self.bot.sendMessage(user.chatId, reply, {parse_mode: 'HTML', disable_web_page_preview: true});

            return self.storage.addIncomingEmail(user.chatId, from.address, subject, content, new Date());
        });
};

module.exports = Service;

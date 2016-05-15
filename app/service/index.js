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

Service.prototype.handleEmail = function (from, to, content) {
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
            var reply = util.format('Incoming message from %s to %s with content %s', from.address, recipient.address, content);

            return self.bot.sendMessage(user.chatId, reply);
        });
};

module.exports = Service;

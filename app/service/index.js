const Storage = require('../storage');
const words = require('../lib/enDictionary');
const validator = require('validator');

const Promise = require('bluebird');
const util = require('util');
const Chance = require('chance');
const chance = new Chance();

var Service = function (config, storage, bot) {
    this.config = config;
    this.storage = storage;
    this.bot = bot;
    this.sendgrid  = require('sendgrid')(config.sendgrid.token);
};

Service.prototype.generateAddress = function () {
    var noun = words.nouns[Math.floor(Math.random() * words.nouns.length)];
    var adjective = words.adjectives[Math.floor(Math.random() * words.nouns.length)];

    return util.format('%s-%s@%s', noun.toLowerCase(), adjective.toLowerCase(), this.config.email.domain);
};

Service.prototype.assignEmail = function (chatId, email = this.generateAddress()) {
    return this.storage.setEmail(chatId, email)
        .then(function () {
            return {email: email};
        });
};

Service.prototype.createUser = function (chatId, userInfo) {
    return this.storage.createUser(chatId, userInfo, new Date());
};

Service.prototype.handleEmail = function (from, to, subject, content) {
    var recipient = to.find(function (recipient) {
        return recipient.address.endsWith('@tmp.cool');
    });

    if (!recipient) {
        return console.error('No valid recipient domain', to);
    }

    if (from instanceof Array && from.length === 1) {
        from = from[0];
    } else {
        return console.error('Invalid from field', from);
    }

    var self = this;

    return this.storage.findByEmail(recipient.address)
        .then(function (user) {
            content = content.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            var reply = util.format('You have a new email!\n\nFrom: <b>%s</b>\nSubject: <b>%s</b>\n\n%s', from.address, subject, content);

            var promArr = [];
            promArr.push(self.bot.sendMessage(user.chatId, reply, {parse_mode: 'HTML', disable_web_page_preview: true}));
            promArr.push(self.storage.addIncomingEmail(user.chatId, from.address, subject, content, new Date()));

            return Promise.all(promArr);
        });
};

Service.prototype.sendTestEmail = function (chatId) {
    var self = this;
    return new Promise(function (resolve, reject) {
        self.storage.findByChatId(chatId)
            .then(function (user) {
                if (!user.email || !validator.isEmail(user.email)) {
                    return self.bot.sendMessage(chatId, 'It seems you don\'t have any email address yet. How about /generate one?');
                }

                self.sendgrid.send({
                    to: user.email,
                    from: 'it-works@tmp.cool',
                    subject: `${chance.capitalize(chance.word({syllables: 2}))} ${chance.capitalize(chance.word({syllables: 2}))}`,
                    text: chance.paragraph({sentences: 2})
                }, function(err) {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                });
            })
    });
};

Service.prototype.logMessage = function (chatId, msg) {
    return this.storage.addMessageLog(chatId, msg);
};

module.exports = Service;

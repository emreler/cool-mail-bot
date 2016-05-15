const Storage = require('../storage');
const words = require('../lib/enDictionary');

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

            self.bot.sendMessage(user.chatId, reply, {parse_mode: 'HTML', disable_web_page_preview: true})
                .catch(function (err) {
                    console.error(err);
                });

            return self.storage.addIncomingEmail(user.chatId, from.address, subject, content, new Date());
        });
};

Service.prototype.sendTestEmail = function (chatId) {
    var self = this;
    this.storage.findByChatId(chatId)
        .then(function (user) {
            self.sendgrid.send({
                to: user.email,
                from: 'it-works@tmp.cool',
                subject: `${chance.capitalize(chance.word({syllables: 2}))} ${chance.capitalize(chance.word({syllables: 2}))}`,
                text: chance.paragraph({sentences: 2})
            }, function(err) {
                if (err) {
                    console.error(err);
                }
            });
        })

};

module.exports = Service;

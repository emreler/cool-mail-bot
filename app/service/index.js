const Storage = require('../storage');
const words = require('../lib/enDictionary');

const util = require('util');

var Service = function (config, storage) {
    this.config = config;
    this.storage = storage;
};

Service.prototype.generateAddress = function () {
    var noun = words.nouns[Math.floor(Math.random() * words.nouns.length)];
    var adjective = words.adjectives[Math.floor(Math.random() * words.nouns.length)];

    return util.format('%s-%s@%s', noun, adjective, this.config.email.domain);
};

Service.prototype.assignEmail = function (chatId, email = this.generateAddress()) {
    return this.storage.setEmail(chatId, email)
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

module.exports = Service;

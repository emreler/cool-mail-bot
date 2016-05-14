const Storage = require('../storage');
const words = require('../lib/enDictionary');

const util = require('util');

var Service = function (config, storage) {
    this.config = config;
    this.storage = storage;
};

Service.prototype._generateRandomEmailAddress = function () {
    var noun = words.nouns[Math.floor(Math.random() * words.nouns.length)];
    var adjective = words.adjectives[Math.floor(Math.random() * words.nouns.length)];

    return util.format('%s-%s@%s', noun, adjective, this.config.email.domain);
};

Service.prototype.generateAddress = function (chatID) {
    var emailAddress = this._generateRandomEmailAddress();
    return emailAddress;
};

Service.prototype.registerNewUser = function (chatID) {
    
};

module.exports = Service;

const Storage = require('../storage');
const words = require('../lib/enDictionary');

var Service = function (config) {
    this.config = config;
    this.storage = new Storage(config);
};

Service.prototype._generateRandomEmailAddress = function () {
    var noun = words.nouns[Math.random() * words.nouns.length];
    var adjective = words.adjectives[Math.random() * words.nouns.length];

    return util.format('%s-%s@%s', noun, adjective, this.config.email.domain);
};

Service.prototype.generateAddress = function (chatID) {
    var emailAddress = this._generateRandomEmailAddress();


};

module.exports = Service;

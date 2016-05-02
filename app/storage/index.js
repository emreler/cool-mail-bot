var mongoose = require('mongoose');

var Storage = function (config) {
    this.config = config;

    mongoose.connect(config.mongo.uri);
    mongoose.Promise = require('bluebird');

    this.User = mongoose.model('User', new mongoose.Schema({}, {strict: false, versionKey: false}));
};

Storage.prototype.createUser = function (chatID) {
    return this.User.create({chatId: chatID});
};

Storage.prototype.findByChatID = function (chatID) {
    return this.User.findOne({chatId: chatID}).lean().exec();
};

Storage.prototype.setEmailAddress = function (chatID, emailAddress) {

};

module.exports = Storage;

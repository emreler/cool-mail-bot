var mongoose = require('mongoose');

var Storage = function (config) {
    this.config = config;

    mongoose.connect(config.mongo.uri);
    mongoose.Promise = require('bluebird');

    this.User = mongoose.model('User', new mongoose.Schema({}, {strict: false, versionKey: false}));
};

Storage.prototype.createUser = function (chatID, createdAt) {
    return this.User.create({chatId: chatID, createdAt: createdAt});
};

Storage.prototype.setEmail = function (chatId, email) {
    return this.User.update({chatId: chatId}, {email: email}).exec();
};

Storage.prototype.findByChatId = function (chatId) {
    return this.User.findOne({chatId: chatId}).lean().exec()
        .then((user) => {
            if (!user) {
                throw new Error('User not found');
            }

            return user;
        })
};

Storage.prototype.findByEmail = function (email) {
    return this.User.findOne({email: email}).lean().exec()
        .then((user) => {
            if (!user) {
                throw new Error('User not found');
            }

            return user;
        })
};

Storage.prototype.addIncomingEmail = function (chatId, from, subject, body, date) {
    var obj = {from, subject, body, date};

    return this.User.findOneAndUpdate({chatId: chatId}, {$push: {inbox: obj}, $inc: {inboxCount: 1}, lastEmail: date});
};

Storage.prototype.addMessageLog = function (chatId, message) {
    return this.User.findOneAndUpdate({chatId: chatId}, {$push: {messages: {
        date: new Date(),
        message: message
    }}});
};

Storage.prototype.deleteUser = function (chatId) {
    return this.User.remove({chatId: chatId}).exec();
};

module.exports = Storage;

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

Storage.prototype.findByChatID = function (chatID) {
    return this.User.findOne({chatId: chatID}).lean().exec()
        .then((user) => {
            if (!user) {
                throw new Error('User not found');
            }

            return user;
        })
};

Storage.prototype.deleteUser = function (chatId) {
    return this.User.remove({chatId: chatId}).exec();
};

module.exports = Storage;

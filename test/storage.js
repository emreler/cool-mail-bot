const chai = require('chai');
const assert = chai.assert;
const validator = require('validator');
const Promise = require('bluebird');

const config = require('../config');

const Storage = require('../app/storage');

describe('Storage', function () {
    this.timeout(10000);

    var chatId = 12345;
    var email = 'foo@tmp.cool';

    var storage;

    before(function () {
        storage = new Storage(config);
        return storage.deleteUser(chatId);
    });

    it('should create user', function () {
        return storage.createUser(chatId, new Date());
    });

    it('should fail creating user with same chatId', function () {
        return storage.createUser(chatId, new Date())
            .then(function () {
                throw new Error();
            })
            .catch(function (err) {
                if (err.code !== 11000) {
                    throw err;
                }
            });
    });

    it('should set email', function () {
        return storage.setEmail(chatId, email);
    });

    it('should find user by chat id', function () {
        return storage.findByChatId(chatId)
            .then(function (user) {
                assert.equal(user.email, email);
            });
    });

    it('should find user by email', function () {
        return storage.findByEmail(email)
            .then(function (user) {
                assert.equal(user.chatId, chatId);
            });
    });

    it('should save incoming emails', function () {
        return Promise.resolve()
            .then(function () {
                return storage.addIncomingEmail(chatId, 'some@mail.com', 'somecontent', 'somebodytext', new Date());
            })
            .then(function () {
                return storage.addIncomingEmail(chatId, 'some@mail.com', 'somecontent', 'somebodytext', new Date());
            })
            .then(function () {
                return storage.addIncomingEmail(chatId, 'some@mail.com', 'somecontent', 'somebodytext', new Date());
            })
            .then(function () {
                return storage.findByChatId(chatId);
            })
            .then(function (user) {
                assert.equal(3, user.inboxCount);
            })
    });

    it('should delete user', function () {
    })
});

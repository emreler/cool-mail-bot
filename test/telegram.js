var chai = require('chai');
var assert = chai.assert;
var config = require('../config');
var Storage = require('../app/storage');

//var Telegram = require('../lib/telegram');

// chai.use(require("chai-as-promised"));

describe('Telegram', function() {
    var telegram;

    describe('constructor', function () {
        it('should create instance of Telegram', function () {
            telegram = new Telegram(config.telegram.token);

            assert.isTrue(telegram instanceof Telegram);

            describe('sendMessage()', function () {
                it('should send message', function () {
                    return telegram.sendMessage('130358557', 'foo');
                });

                it('should fail sending message with invalid chatID', function (done) {
                    return telegram.sendMessage('123asd', 'foo')
                        .then(function () {
                            return done(new Error());
                        })
                        .catch(function () {
                            done();
                        })
                });
            });
        });
    });
});

describe.only('Storage', function () {
    this.timeout(5000);
    var storage;

    before(function () {
        storage = new Storage(config);
        
    });

    it('should create user', function () {
        return storage.createUser(123);
    });

    it('should find user', function () {
        return storage.findByChatID(123);
    })
});

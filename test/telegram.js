var chai = require('chai');
var assert = chai.assert;
var config = require('../config');
var Telegram = require('../lib/telegram');

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
                            throw new Error();
                        })
                        .catch(function (err) {
                            done();
                        })
                });
            });
        });
    });
});

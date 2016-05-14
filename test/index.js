var chai = require('chai');
var assert = chai.assert;
var validator = require('validator');

var config = require('../config');

const Storage = require('../app/storage');
const Service = require('../app/service');

const storage = new Storage(config);
const service = new Service(config, storage);

//var Telegram = require('../lib/telegram');

// chai.use(require("chai-as-promised"));

describe('Service', function () {

    it('should create random and valid e-mail address', function () {
        var address1 = service.generateAddress();
        var address2 = service.generateAddress();

        assert.notEqual(address1, address2);

        assert.isTrue(validator.isEmail(address1));
        assert.isTrue(validator.isEmail(address2));
    });
});

describe('Storage', function () {
    this.timeout(5000);

    var chatId = 12345;
    var email = service.generateAddress();

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

    it('should find user', function () {
        return storage.findByChatID(chatId)
            .then(function (user) {
                assert.equal(user.email, email);
            });
    });

    it('should delete user', function () {
        return storage.deleteUser(chatId);
    })
});

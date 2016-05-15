const chai = require('chai');
const assert = chai.assert;
const validator = require('validator');
const TelegramBot = require('node-telegram-bot-api');

const config = require('../config');

const Storage = require('../app/storage');
const Service = require('../app/service');

describe('Service', function () {
    this.timeout(10000);

    var storage, service, bot, chatId = 130358557, email;

    before(function () {
        bot = new TelegramBot(config.telegram.token, {polling: config.telegram.polling});
        storage = new Storage(config);
        service = new Service(config, storage, bot);

        return storage.deleteUser(chatId);
    });

    it('should create random and valid e-mail address', function () {
        var address1 = service.generateAddress();
        var address2 = service.generateAddress();

        assert.notEqual(address1, address2);

        assert.isTrue(validator.isEmail(address1));
        assert.isTrue(validator.isEmail(address2));
    });
    
    it('should create new user', function () {
        return service.createUser(chatId, new Date());
    });

    it('should assign new random email to user', function () {
        return service.assignEmail(chatId)
            .then(function (res) {
                email = res.email;
            });
    });

    it('should handle incoming email', function () {
        return service.handleEmail([{address: 'emrekayan@gmail.com'}], [{address: email}], 'foosubhect', 'somecontent');
    });

    after(function () {
    });
});

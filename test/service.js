var chai = require('chai');
var assert = chai.assert;
var validator = require('validator');

var config = require('../config');

const Storage = require('../app/storage');
const Service = require('../app/service');

describe('Service', function () {
    this.timeout(10000);

    var storage, service, chatId = 123;

    before(function () {
        storage = new Storage(config);
        service = new Service(config, storage);
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
        return service.assignEmail(chatId);
    });
    
    after(function () {
        return storage.deleteUser(chatId);
    });
});

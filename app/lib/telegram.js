var request = require('request');
var Promise = require('bluebird');

var Telegram = function (token) {
    this._token = token;
    this._baseURL = `https://api.telegram.org/bot${this._token}`;
};

Telegram.prototype.sendMessage = function (chatID, message) {
    var url = `${this._baseURL}/sendMessage`;

    return new Promise(function (resolve, reject) {
        request({
            method: 'POST',
            url: url,
            timeout: 5000,
            json: true,
            body: {
                'chat_id': chatID,
                'parse_mode': 'HTML',
                'disable_web_page_preview': true,
                'text': message
            }
        }, function (err, res, body) {
            if (err) {
                return reject(err);
            }

            if (body.ok !== true) {
                return reject(body.description);
            }

            resolve();
        });
    });
};

module.exports = Telegram;

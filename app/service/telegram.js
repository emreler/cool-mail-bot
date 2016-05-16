const TelegramBot = require('node-telegram-bot-api');
const debug = require('debug')('xtelegram');

var XTelegramBot = function (config) {
    TelegramBot.call(this, config.telegram.token, {polling: config.telegram.polling,
        webHook: config.telegram.webHook});

    this.callbackRegexpCallbacks = [];
};

XTelegramBot.prototype = Object.create(TelegramBot.prototype);
XTelegramBot.prototype.constructor = XTelegramBot;

XTelegramBot.prototype._processUpdate = function (update) {
    debug('Process Update %j', update);
    var message = update.message;
    var inline_query = update.inline_query;
    var chosen_inline_result = update.chosen_inline_result;
    var callback_query = update.callback_query;

    if (message) {
        debug('Process Update message %j', message);
        this.emit('message', message);
        var processMessageType = function (messageType) {
            if (message[messageType]) {
                debug('Emtting %s: %j', messageType, message);
                this.emit(messageType, message);
            }
        };
        this.messageTypes.forEach(processMessageType.bind(this));
        if (message.text) {
            debug('Text message');
            this.textRegexpCallbacks.forEach(function (reg) {
                debug('Matching %s whith', message.text, reg.regexp);
                var result = reg.regexp.exec(message.text);
                if (result) {
                    debug('Matches', reg.regexp);

                    var params = [message, result];
                    if (message.callback_query) {
                        params.push(message.callback_query);
                    }
                    debug(params);
                    reg.callback.apply(this, params);
                }
            });
        }
        if (message.reply_to_message) {
            // Only callbacks waiting for this message
            this.onReplyToMessages.forEach(function (reply) {
                // Message from the same chat
                if (reply.chatId === message.chat.id) {
                    // Responding to that message
                    if (reply.messageId === message.reply_to_message.message_id) {
                        // Resolve the promise
                        reply.callback(message);
                    }
                }
            });
        }
    } else if (inline_query) {
        debug('Process Update inline_query %j', inline_query);
        this.emit('inline_query', inline_query);
    } else if (chosen_inline_result) {
        debug('Process Update chosen_inline_result %j', chosen_inline_result);
        this.emit('chosen_inline_result', chosen_inline_result);
    } else if (callback_query) {
        debug('Process callback_query', callback_query);
        this.emit('callback_query', callback_query);

        this.callbackRegexpCallbacks.forEach(function (reg) {
            var result = reg.regexp.exec(callback_query.data);
            if (result) {
                debug('Matches', reg.regexp);
                var params = [callback_query, result];

                reg.callback.apply(this, params);
            }
        });
    }
};

XTelegramBot.prototype.onCallback = function (regexp, callback) {
    this.callbackRegexpCallbacks.push({regexp: regexp, callback: callback});
};

XTelegramBot.prototype.answerCallbackQuery = function (callbackQueryId, text, showAlert) {
    var form = {};
    form.callback_query_id = callbackQueryId;
    form.text = text;
    form.show_alert = showAlert;
    return this._request('answerCallbackQuery', {form: form});
};

module.exports = XTelegramBot;

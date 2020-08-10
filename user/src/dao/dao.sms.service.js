const { sendUri } = require('../configs').smsService
const rp = require('request-promise');

class SmsServiceDao {
    constructor() { }

    sendSms(text, from, to) {
        const option = {
            method: 'post',
            uri: sendUri,
            body: { text, from, to },
            json: true
        }
        return rp(option);
    }
}

module.exports = new SmsServiceDao();//returning a sms-service.dao singleton
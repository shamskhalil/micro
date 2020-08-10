const SmsModel = require('../models/sms.model');

class SmsDao {
    constructor() { }

    addNew(obj) {
        return new Promise((resolve, reject) => {
            let newSms = new SmsModel(obj);
            newSms.save((err, savedSms) => {
                if (err) {
                    reject(err);
                }
                resolve(savedSms);
            });
        });
    }

    getOne(id) {
        return new Promise((resolve, reject) => {
            SmsModel.findById(id, (err, singleSms) => {
                if (err) {
                    reject(err);
                }
                resolve(singleSms);
            });
        });
    }

    getAll() {
        return new Promise((resolve, reject) => {
            SmsModel.find({}, (err, smsArray) => {
                if (err) {
                    reject(err);
                }
                resolve(smsArray);
            });
        });
    }

    del(id) {
        return new Promise((resolve, reject) => {
            SmsModel.findOneAndDelete(id, (err, result) => {
                if (err) {
                    reject(err);
                }
                resolve('Sms Deleted Successfully!');
            });
        });
    }
}

module.exports = new SmsDao();
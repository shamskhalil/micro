const express = require('express');
const client = require('../connections/connection.redis')();
const UserDao = require('../dao/dao.user');
const SmsServiceDao = require('../dao/dao.sms.service');
const authorizer = require('../middlewares/middleware.authorizer').authorizer;

const CACHE_KEY = 'cache';

module.exports = () => {
    const api = express.Router();

    //Create
    api.post('/', authorizer(['admin', 'registered']), async (req, res) => {
        try {
            const savedUser = await UserDao.addNew(req.body);
            //send user an sms confirming his registration
            const text = `Welcome to LexClass APP, ${savedUser.fullName}! You may proceed to Login.`
            const smsresponse = await SmsServiceDao.sendSms(text, "07068699808", "LexClass");
            const payload = { user: savedUser, smsSent: smsresponse };
            res.status(200).json({ status: 'success', payload, message: 'User created successfully!' });
        } catch (err) {
            res.status(500).json({ status: 'failed', payload: null, message: err });
        }
    });

    /**
     * @swagger
     * /api/v1/user/:
     *  get:
     *      description: "Fetches all users from database"
     *      tags:
     *          - User Resource Routines
     *      parameters:
     *          - name: x-token
     *            type: string
     *            description: 'A token given to us by the server after a successful authentication'
     *            in: header
     *            required: true
    
     *      responses:
     *          '200':
     *              description: 'Request is successful'
     *          '401':
     *              description: 'Unathorised, token required'
     *          '500':
     *              description: 'Request Failed'
     */
    api.get('/', authorizer(['admin', 'registered']), async (req, res) => {
        let start = process.hrtime();
        try {
            let users = await fetchFromCache();
            if (users && users.length > 0) {
                let end = process.hrtime(start);
                let elapsed = Math.ceil((end[0] / 1000) + (end[1] / 1000000));
                res.status(200).json({ status: 'success', payload: users, message: 'All Users fetched successfully', timing: elapsed + 'ms' });
            } else { // fetch from db
                const usersArray = await UserDao.getAll();
                let _ = await saveToCache(usersArray);
                let end = process.hrtime(start);
                let elapsed = Math.ceil((end[0] / 1000) + (end[1] / 1000000));
                res.status(200).json({ status: 'success', payload: usersArray, message: 'All Users fetched successfully', timing: elapsed + 'ms' });
            }
        } catch (err) {
            console.log('ERRRR>>>> ', err);
            let end = process.hrtime(start);
            let elapsed = Math.ceil((end[0] / 1000) + (end[1] / 1000000));
            res.status(500).json({ status: 'failed', payload: null, message: err, timing: elapsed + 'ms' });
        }
    });

    /**
     * @swagger
     * /api/v1/user/{id}:
     *  get:
     *      description: "Fetches a single user by id from database"
     *      tags:
     *          - User Resource Routines
     *      parameters:
     *          - name: id
     *            type: string
     *            description: 'The id of the user to fetch'
     *            in: path
     *            required: true
     *          - name: x-token
     *            type: string
     *            description: 'A token given to us by the server after a successful authentication'
     *            in: header
     *            required: true
    
     *      responses:
     *          '200':
     *              description: 'Request is successful'
     *          '401':
     *              description: 'Unathorised, token required'
     *          '500':
     *              description: 'Request Failed'
     */
    api.get('/:id', authorizer(['admin', 'registered']), async (req, res) => {
        const id = req.params.id;
        if (id) {
            try {
                const singleUser = await UserDao.getOne(id);
                res.status(200).json({ status: 'success', payload: singleUser, message: 'Single user fetched Successfully!' });
            } catch (err) {
                res.status(500).json({ status: 'failed', payload: null, message: err });
            }
        } else {
            res.status(500).json({ status: 'failure', payload: null, message: 'Invalid User id to fetch' });
        }
    });

    //update
    api.put('/:id', authorizer(['admin', 'registered']), async (req, res) => {
        const id = req.params.id;
        const { password, fname, lname } = req.body;
        if (id) {
            try {
                const updatedUser = await UserDao.update(id, password, fname, lname);
                res.status(200).json({ status: 'success', payload: updatedUser, message: 'Single user Updated Successfully!' });
            } catch (err) {
                res.status(500).json({ status: 'failed', payload: null, message: err });
            }
        } else {
            res.status(500).json({ status: 'failure', payload: null, message: 'Invalid User id to Update' });
        }
    });

    //delete
    api.delete('/:id', authorizer(['admin']), async (req, res) => {
        const id = req.params.id;
        if (id) {
            try {
                await UserDao.del(id);
                res.status(200).json({ status: 'success', payload: null, message: 'User Deleted Successfully!' });
            } catch (err) {
                res.status(500).json({ status: 'failed', payload: null, message: err });
            }
        } else {
            res.status(500).json({ status: 'failure', payload: null, message: 'Invalid User id to Update' });
        }
    });

    return api;
}


function fetchFromCache() {
    return new Promise((resolve, reject) => {
        client.get(CACHE_KEY, (err, result) => {
            if (err) {
                reject(err);
                console.log('from cache err >> ', err);
            } else {
                resolve(JSON.parse(result));
                console.log('from cache result >> ', result);
            }
        });
    });
}


function saveToCache(arr) {
    return new Promise((resolve, reject) => {
        client.setex(CACHE_KEY, 180, JSON.stringify(arr), (err, result) => {
            if (err) {
                reject(err);
                console.log('to cache err >> ', err);
            } else {
                resolve(true);
                console.log('to cache result >> ', result);
            }
        });
    });
}
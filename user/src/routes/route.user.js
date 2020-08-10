const express = require('express');
const UserDao = require('../dao/dao.user');
const SmsServiceDao = require('../dao/dao.sms.service');
const authorizer = require('../middlewares/middleware.authorizer').authorizer;

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
        try {
            const usersArray = await UserDao.getAll();
            res.status(200).json({ status: 'success', payload: usersArray, message: 'All Users fetched successfully' });
        } catch (err) {
            res.status(500).json({ status: 'failed', payload: null, message: err });
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
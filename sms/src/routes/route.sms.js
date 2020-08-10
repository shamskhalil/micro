const express = require('express');
const SmsDao = require('../dao/dao.sms');


module.exports = () => {
    const api = express.Router();

    //Create
    api.post('/', async (req, res) => {
        try {
            const savedSms = await SmsDao.addNew(req.body);
            res.status(200).json({ payload: savedSms });
        } catch (err) {
            res.status(500).json({ message: err });
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
    api.get('/', async (req, res) => {
        try {
            const smsArray = await SmsDao.getAll();
            res.status(200).json({ payload: smsArray });
        } catch (err) {
            res.status(500).json({ message: err });
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
    api.get('/:id', async (req, res) => {
        const id = req.params.id;
        if (id) {
            try {
                const singleSms = await SmsDao.getOne(id);
                res.status(200).json({ payload: singleSms });
            } catch (err) {
                res.status(500).json({ message: err });
            }
        } else {
            res.status(500).json({ message: 'Invalid Sms id to fetch' });
        }
    });



    //delete
    api.delete('/:id', async (req, res) => {
        const id = req.params.id;
        if (id) {
            try {
                await SmsDao.del(id);
                res.status(200).json({ message: 'Sms Deleted Successfully!' });
            } catch (err) {
                res.status(500).json({ message: err });
            }
        } else {
            res.status(500).json({ message: 'Invalid Sms id to Delete' });
        }
    });

    return api;
}
require('./connections/connection.mongo')();
const swaggerJSDOC = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');


const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());

const swaggerOptions = {
    definition: {
        info: {
            title: 'LexClass RESTful SMS Microservice API',
            description: 'An API to Create or consume SMS resource',
            version: '1.0',
            contact: {
                name: 'LexClass Members',
                email: 'almembers@lexclass.com',
                ur: 'lexclass.com'
            }
        }
    },
    apis: ['./src/restapi.js', './src/routes/*.js']
}
const swaggerDef = swaggerJSDOC(swaggerOptions);

app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDef));

/**
 * @swagger
 * /:
 *  get:
 *      description: "This is the root endpoint of our api"
 *      tags:
 *          - Root Endpoint
 *      responses:
 *          '200':
 *              description: 'Request is successful'
 *          '500':
 *              description: 'Request Failed'
 */
app.get('/', (req, res) => {
    res.status(200).json({ status: 'success', payload: { apiVersion: 1.0, writtenBy: 'LexClass Members', supervisedBy: 'Khalil Mohammed Shams <shamskhalil@gmail.com>', date: 'August 2020' }, message: 'Welcome to Lexclass RESTful SMS Microservice API' });
});




//Sms Route
const smsRoute = require('./routes/route.sms')();
app.use('/api/v1/sms', smsRoute);

app.listen(3001, () => {
    console.log('SMS Microservice listening on port 3001')
});


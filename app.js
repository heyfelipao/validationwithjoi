const express = require('express');
const logger = require('morgan');
const Joi = require('joi');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.NODE_ENV || 5000;
const Routes = require('./routes');

// app configurations
app.set('port', PORT);

// load app middlewares

// log only 4xx and 5xx responses to console
app.use(logger('dev'), {
    skip: function (req, res) {
        return res.status < 400
    }
});

// log all requests to access.log
app.use(logger('common'), {
    stream: fs.createWriteStream(path.join(__dirname, 'access.log'), {
        flags: 'a'
    })
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
/*
app.use((req,res, next) => {
    const method = req.method;
    const endpoint = req.originalUrl;

    res.on('finish', () => {
        const status = res.status;
        console.log(`Method: ${method} | Endpoint: ${endpoint} | Status: ${status}`);
        next()
    });
})
*/

// load api routes
app.use('/', Routes);

// next() express use test
/*
app.get('/next', (req, res, next) => {
    console.log('next 1');
    next();
})

app.get('/next', (req, res) => {
    console.log('next 2');
    res.send({})
})
*/

// testing joi validation
app.post('/test', (req, res) => {
    //getch the request data
    const data = req.body;

    // define the validation schema
    const schema = Joi.object().keys({
        // email is required
        // email must be a valid email string
        email: Joi.string().email().lowercase().required(),

        // phone is required
        // and must be a string of the format xxx-xxx-xxxx
        // where X is a digit (0-9)
        phone: Joi.string().regex(/^\d{3}-\d{3}-\d{4}$/).required(),

        // birthday is not required
        // birthday must be a valid ISO-8601 date
        // dates berofe Jan 1, 2014 are not allowed
        birthday: Joi.date().max('1-1-2004').iso()
    });
    
    // validate the request data against the schema
    const { error, value } = schema.validate(data);

    if (error) {
        // send 422 error response if validation fails
        res.status(422).send({
            status: 'error',
            message: 'Invalid request data',
            data: data
        })
    } else {
        // create a random number as id
        const id = Math.ceil(Math.random() * 9999999);
        
        // send a success response if validation passes
        // attach the random ID to the data response
        res.send({
            status: 'success',
            message: 'User created successfully',
            data: Object.assign({ id }, value)
        })
    }
})

// establish http server connection
app.listen(PORT, () => { console.log(`App is running on port: ${PORT}`) });
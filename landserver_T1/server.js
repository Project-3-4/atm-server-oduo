const express = require('express');
const app = express();
const fs = require('fs');
const https = require('https');
const messages = require('./messages.json')
const filepaths = require('../../../filepaths.json');
const r = messages.noob;
const wysd = messages.wysd;

//HTTPS options
//Note that rejectUnauth is false in order to politely respond to invalid certs
const opts = {
    key: fs.readFileSync(filepaths.t1ServerKey),
    cert: fs.readFileSync(filepaths.t1ServerChain),
    requestCert: true,
    rejectUnauthorized: false,
    ca: [fs.readFileSync(filepaths.noobRoot),
         fs.readFileSync(filepaths.noobCA)]
}

function handlePostRequest(req, res, retObj) {
    if (!req.is('application/json')){
        console.log(r.expectedJSONError.message + wysd.sanityCheck)
        res.status(r.expectedJSONError.code).send(r.expectedJSONError.message + wysd.sanityCheck);
        return;
    }
    if (req.client.authorized) {
        res.status(200).json(retObj)
    } else {
        console.log(r.invalidCertIssuer.message + req.socket.getPeerCertificate().issuer);
        res.status(r.unauthorized.code).send(r.unauthorized.message + wysd.seeLogs);
    }
}

app.use(express.json())

app.get('/test', (req, res) => {
    console.log(r.noobTest.message);
    res.status(r.noobTest.code).send(r.noobTest.message);
});

app.post('/balance', (req, res) => {
    const retObj = JSON.stringify({
            'head': {
                'fromCtry': 'T1',
                'fromBank': 'TEST',
                'toCtry': req.body.head.fromCtry,
                'toBank': req.body.head.fromBank
            },
            'body': {
                'acctNo': req.body.body.acctNo,
                'amount': 200000
            }
    });
    console.log('Incoming balance request');
    handlePostRequest(req, res, retObj);
});

app.post('/withdraw', (req, res) => {
    const retObj = JSON.stringify({
            'head': {
                'fromCtry': 'T1',
                'fromBank': 'TEST',
                'toCtry': req.body.head.fromCtry,
                'toBank': req.body.head.fromBank
            },
            'body': {
                'acctNo': req.body.body.acctNo,
                'success': true
            }
    });
    console.log('Incoming withdraw request');
    handlePostRequest(req, res, retObj);
});

https.createServer(opts, app).listen(8443);

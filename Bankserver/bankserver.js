//version 0.1
const express = require('express');
const app = express();
const fs = require('fs');
const http = require('http');
const https = require('https');
const mysql = require('mysql');

var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : '******',
  password : '******',
  database : 'bank'
});

connection.connect();

// const server = http.createServer(function(req, res){

//     res.setHeader('Content-type', 'application/json');
//     res.setHeader('Acces-Control-Allow-Origin', '*');
//     res.writeHead(200); //status code

//     let messageOBJ = {id: 123, name:"test", IBAN:"INGB124325235233"};
//     let data = JSON.stringify(messageOBJ)
//     res.end(data);
// });


//HTTPS options
//Note that rejectUnauth is false in order to politely respond to invalid certs
// const opts = {
//     key: fs.readFileSync(filepaths.t1ServerKey),
//     cert: fs.readFileSync(filepaths.t1ServerChain),
//     requestCert: true,
//     rejectUnauthorized: false,
//     ca: [fs.readFileSync(filepaths.noobRoot),
//          fs.readFileSync(filepaths.noobCA)]
// }

function handlePostRequest(req, res, retObj) {
    // if (!req.is('application/json')){
    //     console.log(r.expectedJSONError.message + wysd.sanityCheck)
    //     res.status(r.expectedJSONError.code).send(r.expectedJSONError.message + wysd.sanityCheck);
    //     return;
    // }
    // if (req.client.authorized) {
    //     res.status(200).json(retObj)
    // } else {
    //     console.log(r.invalidCertIssuer.message + req.socket.getPeerCertificate().issuer);
    //     res.status(r.unauthorized.code).send(r.unauthorized.message + wysd.seeLogs);
    // }

    //TODO incorrect body

    //Check if user exists
    connection.query('SELECT userId FROM users WHERE userId = ' + req.body.head.acctNo, function(error, results, fields) {
        if (error) {
            JSON.stringify(retObj);
            res.status(404).json(retObj);
            return;
        };
    });
    //check if pass is blocked (too many incorrect attempts)
    connection.query('SELECT incorrectAttempts FROM users WHERE userId = ' + req.body.head.acctNo, function(error, results, fields) {
        if (error) {
            console.log('unexpected error fetching incorrectAttempts');
        };
        if (results[0] <= 0) {
            JSON.stringify(retObj);
            res.status(403).json(retObj);
            return;
        }
    });

    //Check if the pin is correct //TODO incorrectAttempts in database -> attemptsLeft
    connection.query('SELECT pin, incorrectAttempts FROM users WHERE pin = ' + req.body.head.pin + 'AND userId = '+ req.body.head.acctNo, function(error, results, fields) {
        if (error) {
            retObj.body = {'attemptsLeft': results[1]};
            JSON.stringify(retObj);
            res.status(401).json(retObj);
            return;
        };
    });
    // not enough balance



    retObj.body = {'balance': 200000};
    res.status(200).json(retObj);
    
}

app.use(express.json())


app.get('/test', (req, res) => {
    console.log('test');
    res.status(200).send('test succesfull');
});

app.post('/balance', (req, res) => {
    console.log('Incoming balance request');
    const retObj = {
            'head': {
                'fromCtry': 'T1',
                'fromBank': 'TEST',
                'toCtry': req.body.head.fromCtry,
                'toBank': req.body.head.fromBank
            },
            'body': {
                // 'balance': 200000 // Double
            }
    };
    
    handlePostRequest(req, res, retObj);
    console.log('Handled balance request');
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
                // 'balance': 199800
            }
    });
    console.log('Incoming withdraw request');
    handlePostRequest(req, res, retObj);
});

http.createServer(app).listen(8443, function(){
    console.log('listening on port 8443');
})

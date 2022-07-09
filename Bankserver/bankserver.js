//version 0.1
const express = require('express');
const app = express();
const fs = require('fs');
const http = require('http');
const https = require('https');
const mysql = require('mysql2');
//const filepaths = require('../../filepaths.json');
const dbcreds = require('../../dbcreds.json');

const connection = mysql.createPool({
    connectionLimit: 10,
    host     : dbcreds.creds.host,
    user     : dbcreds.creds.user,
    password : dbcreds.creds.password,
    database : dbcreds.creds.db
});

var errorCheck = 0;
var userError = 0;
var pinError = 0;
var attemptError = 0;
var attemptsRemaining = 3;
var decrementCheck = 0;

//connection.connect();

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

userCheck = (req) =>{
    return new Promise((resolve, reject)=>{
        connection.query('SELECT userId FROM users WHERE userId = ?',[req.body.body.acctNo], function(error, results, fields) {
            if (results[0] == undefined) {
                userError = 1;
            };
            if(error){
                return reject(error);
            }
            return resolve(results);
        });
    });
};

attemptCheck = (req) =>{
    return new Promise((resolve, reject)=>{
        connection.query('SELECT attemptsLeft FROM users WHERE userId = ?',[req.body.body.acctNo], function(error, results, fields) {
            if (results[0].attemptsLeft <= 0) {
                console.log("too many attempts: "+ results[0].attemptsLeft);
                attemptError = 1;
                attemptsRemaining = results[0].attemptsLeft;
            }
            if(error){
                return reject(error);
            }
            return resolve(results);
        });
    });
};

decrementAttempts = (req) =>{
    return new Promise((resolve, reject)=>{
        connection.query('UPDATE users SET attemptsLeft = attemptsLeft-1 WHERE userId = ?',[req.body.body.acctNo], function(error, results, fields) {});
        connection.query('SELECT attemptsLeft FROM users WHERE userId = ?',[req.body.body.acctNo], function(error, results, fields) { // TODO split in 2 function cuz probably causing problems
            console.log("new attemptsLeft: " + results[0].attemptsLeft);
            attemptsRemaining = results[0].attemptsLeft;
            decrementCheck = 1;
            return resolve(results);
        });
    });
};

resetAttempts = (req) =>{
    return new Promise((resolve, reject)=>{
        connection.query('UPDATE users SET attemptsLeft = 3 WHERE userId = ?',[req.body.body.acctNo], function(error, results, fields) {
            return resolve(results);
        });
    });
};

pinCheck = (req) =>{
    return new Promise((resolve, reject)=>{
        connection.query('SELECT pin FROM users WHERE pin = ? AND userId = ?',[req.body.body.pin, req.body.body.acctNo], function(error, results, fields) {
            if (results[0] === undefined) {
                pinError = 1;
            }
            if(error){
                return reject(error);
            }
            return resolve(results);
        });
    });
};

checkBalance = (req) =>{
    return new Promise((resolve, reject)=>{
        connection.query('SELECT balance FROM users WHERE userId = ?',[req.body.body.acctNo], function(error, results, fields) {
            console.log("balance: " + results[0].balance);
            return resolve(results);
        });
    });
};

withdrawMoney = (req) =>{
    return new Promise((resolve, reject)=>{
        connection.query('UPDATE users SET balance = balance - ? WHERE userId = ?',[req.body.body.amount, req.body.body.acctNo], function(error, results, fields) {
            console.log("Withdrawing: " + req.body.body.amount);
            return resolve(results);
        });
    });
};

async function handleBalanceRequest(req, res, retObj) {
    await handlePostRequest(req, res, retObj);
    if (errorCheck == 0) {
        const bal = await checkBalance(req);
        retObj.body = {'balance': bal[0].balance};
        return res.status(200).json(retObj);
    }
    errorCheck = 0;
}

async function handleWithdrawRequest(req, res, retObj) {
    handlePostRequest(req, res, retObj);
    if (errorCheck == 0) {
        const withdraw = await withdrawMoney(req);
        const bal = await checkBalance(req);
        retObj.body = {'balance': bal[0].balance};
        return res.status(200).json(retObj);
    }
    errorCheck = 0;
}

async function handlePostRequest(req, res, retObj) {
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
    // TODO not enough balance

    userError = 0;
    pinError = 0;
    attemptError = 0;


    const check1 = await userCheck(req);
    if (userError == 1) {
        JSON.stringify(retObj);
        console.log("Invalid user");
        errorCheck = 1;
        return res.status(404).json(retObj);
    } else {
        const check2 = await attemptCheck(req);
        if (attemptError == 1) {
            retObj.body = {'attemptsLeft': attemptsRemaining};
            JSON.stringify(retObj);
            console.log("Too many incorrect attempts");
            errorCheck = 1;
            return res.status(403).json(retObj);
        } else {
            const check3 = await pinCheck(req);
            if (pinError == 1) {
                decrementCheck = 0;
                const checkingAttempts = await decrementAttempts(req);
                if (decrementCheck == 1) {
                    retObj.body = {'attemptsLeft': attemptsRemaining};
                    JSON.stringify(retObj);
                    console.log("Invalid pin");
                    errorCheck = 1;
                    return res.status(401).json(retObj);
                }
            } else{
                const check4 = await checkBalance(req);
                if (check4[0].balance < 0) {
                    console.log("not enough balance");
                    retObj.body = {'balance': check4[0].balance};
                    JSON.stringify(retObj);
                    errorCheck = 1;
                    return res.status(406).json(retObj);
                }
            };
        };
    };
    const doThis = await resetAttempts(req);
    console.log("no errors found");
    attemptsRemaining = 0;
}

app.use(express.json())


app.get('/test', (req, res) => {
    console.log('test');
    res.status(200).send('test succesfull');
});

app.post('/balance', (req, res) => {
    console.log('Incoming balance request from: ' + req.body.head.fromBank);
    try {
        const retObj = {
            'head': {
                'fromCtry': 'GL',
                'fromBank': 'ODUO',
                'toCtry': req.body.head.fromCtry,
                'toBank': req.body.head.fromBank
            },
            'body': {
                // 'balance': 200000 // Double
            }
        };

        if (req.body.body.acctNo && req.body.body.pin) {

        } else {
            console.log("Incorrect body")
            throw e;
        }
        handleBalanceRequest(req, res, retObj);
    } catch (e) {
        console.log("error in request")
        return res.status(400).send();
    }

    return;
});

app.post('/withdraw', (req, res) => {
    console.log('Incoming withdraw request from: ' + req.body.head.fromBank);
    try {
        const retObj = {
            'head': {
                'fromCtry': 'GL',
                'fromBank': 'ODUO',
                'toCtry': req.body.head.fromCtry,
                'toBank': req.body.head.fromBank
            },
            'body': {
                // 'balance': 200000 // Double
            }
        };
        if (req.body.body.acctNo && req.body.body.pin && req.body.body.amount) {

        } else {
            console.log("Incorrect body")
            throw e;
        }
        handleWithdrawRequest(req, res, retObj);
    } catch (e) {
        console.log("error in request")
        return res.status(400).send();
    }

    return;
});

http.createServer(app).listen(8443, function(){
    console.log('listening on port 8443');
})
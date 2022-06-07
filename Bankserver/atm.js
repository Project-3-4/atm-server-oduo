const { Router } = require('express');
const express = require('express');
const app = express();
const fs = require('fs');
const http = require('http');
const https = require('https');
const {stat} = require("fs");
//const mysql = require('mysql');
//app.get('/', function(req, res, next){
//})
var req;
var balance;
var remainder;
var status;
handlePython();
app.get('/pypin', async (req, res) => {
    //console.log('json: ' ,pythondata.fromBank);
    console.log("pre-function");
    await handlePython();
    console.log(res.statusCode);
    console.log("post-function");
    // console.log(balance)
    // console.log(balance.toString())
    console.log("status = " + status);
    if (status === 200) {
        res.status(200).send();
    } else if (status === 401 || status === 403) {
        res.status(200).send(remainder.toString());
    } else {
        console.log("unexpected error")
    }

})
app.get('/python', async (req, res) => {
    //console.log('json: ' ,pythondata.fromBank);
    const waiting = await handlePython();
    // console.log(balance)
    // console.log(balance.toString())
    if (status === 200) {
        res.status(200).send(balance.toString());
    } else {
        console.log("error: " + status);
    }

})

async function handlePython(){
    return new Promise ((resolve, reject) => {
        var pythondata = JSON.parse(fs.readFileSync('D:\\School\\Hogeschool\\Project 34\\Python\\out.json', 'utf8'));
        const data = JSON.stringify({
            head: {
                'fromCtry': 'GL',
                'fromBank': 'ODUO',
                'toCtry':   pythondata.toCtry,
                'toBank':   pythondata.toBank
            },
            body: {
                'acctNo' : pythondata.acctNo,//'GLODUO0000135700', //GLODUO0000135700 1234 || GLBAOV0000000000 6666
                'pin': pythondata.pin,
                'amount' : pythondata.amount
            }
        });

        const options = {
            hostname: '145.24.222.225', // ODUO: 145.24.222.225:8443   ||  BAOV 145.24.222.179:80
            port: 8443,
            path: pythondata.path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length,
            }
        };

        req = http.request(options, (res) => {
            console.log('statusCode:', res.statusCode);
            console.log('headers:', res.headers);
            status = res.statusCode

            res.on('data', (d) => {
                process.stdout.write(d);
                const resData = JSON.parse(d);
                console.log(resData.body.body);
                balance = resData.body.balance;
                remainder = resData.body.attemptsLeft;
                console.log(resData.body.balance);
                resolve(d);
            });
        });
        req.on('error', (e) => {
            console.error(e);
        });
        req.write(data);
        req.end();

    });

}



http.createServer(req, app).listen(443, function(){
    console.log('listening on port 443');
})
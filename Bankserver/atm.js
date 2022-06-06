const express = require('express');
const app = express();
const fs = require('fs');
const http = require('http');
const https = require('https');
//const mysql = require('mysql');

const data = JSON.stringify({
    head: {
        'fromCtry': 'GR',
        'fromBank': 'ODUO',
        'toCtry':   'GR',
        'toBank':   'ODUO'
    },
    body: {
        'acctNo' : '\'GRODUO0000135700\'',
        'pin': '\'1234\''//,
        // 'amount' : '300'
    }
});

const options = {
    hostname: '145.24.222.225',
    port: 8443,
    path: '/balance',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
    }
};

const req = http.request(options, (res) => {
    console.log('statusCode:', res.statusCode);
    console.log('headers:', res.headers);
    if (res.statusCode == 200) {
        console.log("we got \'em")
    }

    res.on('data', (d) => {
        process.stdout.write(d);
        const resData = JSON.parse(d);
        console.log(resData.body.body);
        console.log(resData.body.balance);
    });
});

req.on('error', (e) => {
    console.error(e);
});
req.write(data);
req.end();

http.createServer(req).listen(443, function(){
    console.log('listening on port 443');
})

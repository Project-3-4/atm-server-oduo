//version 0
const express = require('express');
const app = express();
const fs = require('fs');
const http = require('http');
const https = require('https');

// const server = http.createServer(function(req, res){

//     res.setHeader('Content-type', 'application/json');
//     res.setHeader('Acces-Control-Allow-Origin', '*');
//     res.writeHead(200); //status code

//     let messageOBJ = {id: 123, name:"test", IBAN:"INGB124325235233"};
//     let data = JSON.stringify(messageOBJ)
//     res.end(data);
// });

app.use(express.json())

app.get('/test', (req, res) => {
    console.log('test');
    res.status(200).send('test succesfull');
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

http.createServer(app).listen(8443, function(){
    console.log('listening on port 8443');
})

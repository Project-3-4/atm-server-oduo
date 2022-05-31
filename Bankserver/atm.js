const express = require('express');
const app = express();
const fs = require('fs');
const http = require('http');
const https = require('https');
//const mysql = require('mysql');


const options = {
  hostname: 'localhost:8443/balance',
  port: 443,
  path: '/balance',
  method: 'POST'
};

const req = https.request(options, (res) => {
  console.log('statusCode:', res.statusCode);
  console.log('headers:', res.headers);
  console.log('body', res.body );

  res.on('data', (d) => {
    process.stdout.write(d);
  });
});

req.on('error', (e) => {
  console.error(e);
});
req.end();

http.createServer(req).listen(443, function(){
    console.log('listening on port 8443');
})
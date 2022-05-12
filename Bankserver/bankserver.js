//version 0
const express = require('express');
const app = express();
const fs = require('fs');
const http = require('http');
const https = require('https');

const server = http.createServer(function(req, res){

    res.setHeader('Content-type', 'application/json');
    res.setHeader('Acces-Control-Allow-Origin', '*');
    res.writeHead(200); //status code

    let messageOBJ = {id: 123, name:"test", IBAN:"INGB124325235233"};
    let data = JSON.stringify(messageOBJ)
    res.end(data);
});

server.listen(8443, function(){
    console.log('listening on port 8443');
})
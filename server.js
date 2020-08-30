let express = require('express');
let users = require('./utilities/users')

let server = express();

server.get('/', function(req,res){
  res.end("Hello World");
});

server.listen(3000);

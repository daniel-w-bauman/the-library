let express = require('express')

let server = express()

server.get('/', function(req,res){
  res.end("Hello World")
})

server.listen(3000)

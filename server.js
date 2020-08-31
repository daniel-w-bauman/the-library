let express = require('express');
let users = require('./utilities/users')
const bodyParser = require('body-parser')
let server = express();

let verbose = true;

function vprint(str){
  if(verbose){
    console.log(str);
  }
}

server.use(bodyParser.json());
server.use(bodyParser.urlencoded({
  extended: true
}));

server.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Origin,Content-Type, Authorization, x-id, Content-Length, X-Requested-With");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
});

server.get('/', function(req,res){
  res.header("Content-Type", "text/plain");
  res.end("Hello World");
});

server.post('/api/createuser',function(req,res){
  let response = {};
  if("firstname" in req.body && "lastname" in req.body && "email" in req.body && "password" in req.body){
    let firstname = req.body.firstname;
    let lastname = req.body.lastname;
    let email = req.body.email;
    let password = req.body.password;
    vprint("Creating user: " + firstname + " " + lastname + " , " + email);
    if(firstname.length < 2){
      response.status = '1';
      response.error = 'Firstname must have more than 1 letter.';
      res.header("Content-Type",'application/json');
      res.send(JSON.stringify(response, null, 4));
    } else if(lastname.length < 2){
      response.status = '1';
      response.error = 'Lastname must have more than 1 letter.';
      res.header("Content-Type",'application/json');
      res.send(JSON.stringify(response, null, 4));
    } else if(!validEmail(email)){
      response.status = '1';
      response.error = 'Not a valid email address.';
      res.header("Content-Type",'application/json');
      res.send(JSON.stringify(response, null, 4));
    } else if(!validPassword(password)){
      response.status = '1';
      response.error = 'Invalid password, must contain between 8 to 16 letters/digits/characters.';
      res.header("Content-Type",'application/json');
      res.send(JSON.stringify(response, null, 4));
    } else {
      users.createUser(firstname, lastname, email, password).then(function(message){
        response.status = '0';
        response.message = message;
        res.header("Content-Type",'application/json');
        res.send(JSON.stringify(response, null, 4));
      }, function(err){
        response.status = '1';
        response.error = error.message;
        res.header("Content-Type",'application/json');
        res.send(JSON.stringify(response, null, 4));
      });
    }
  } else {
    response.status = '1';
    response.error = 'Not all fields are full.';
    res.header("Content-Type",'application/json');
    res.send(JSON.stringify(response, null, 4));
  }
});


server.post('/api/login',function(req,res){
  let response = {};
  if("email" in req.body && "password" in req.body){
    let email = req.body.email;
    let password = req.body.password;
    vprint("logging in user: " + email);
    if(!validEmail(email)){
      response.status = '1';
      response.error = 'Not a valid email address.';
      res.header("Content-Type",'application/json');
      res.send(JSON.stringify(response, null, 4));
    } else if(!validPassword(password)){
      response.status = '1';
      response.error = 'Invalid password, must contain between 8 to 16 letters/digits/characters.';
      res.header("Content-Type",'application/json');
      res.send(JSON.stringify(response, null, 4));
    }
    users.login(email, password).then(function(user){
      response.status = '0';
      response.firstname = user.firstname;
      response.lastname = user.lastname;
      response.token = user.token;
      res.header("Content-Type",'application/json');
      res.send(JSON.stringify(response, null, 4));
    }, function(err){
      response.status = '1';
      response.error = err.message;
      res.header("Content-Type",'application/json');
      res.send(JSON.stringify(response, null, 4));
      vprint(err);
    });
  } else {
    response.status = '1';
    response.error = 'Not all fields are full.';
    res.header("Content-Type",'application/json');
    res.send(JSON.stringify(response, null, 4));
  }
});

server.get('/api/logout/:token', function(req,res){
  let response = {};
  users.logout(req.params.token).then(result => {
    response.status = '0';
    console.log(result);
    response.message = 'Signed out successfully.';
    res.header("Content-Type",'application/json');
    res.send(JSON.stringify(response, null, 4));
  }, err => {
    response.status = '1';
    response.error = err.message;
    res.header("Content-Type",'application/json');
    res.send(JSON.stringify(response, null, 4));
  });
});

function validEmail(email){
  let parts = email.split('@');
  if(parts.length !== 2){
    return false;
  }
  let extension = parts[1].split('.');
  if(extension.length < 2){
    return false;
  }
  return true;
}

function validPassword(password){
  if(password.length > 16 || password.length < 8){
    return false;
  }
  return true;
}

server.listen(3001);

console.log("Listening on http://localhost:3001/");

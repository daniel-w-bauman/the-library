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


server.get('/', (req,res) => {
  res.header("Content-Type", "text/plain");
  res.end("Hello World");
});


server.post('/api/createuser', (req, res) => {
  processUser(req.body).then(response => {
    response.status = '0';
    res.header("Content-Type",'application/json');
    res.send(JSON.stringify(response, null, 4));
  }).catch(err => {
    console.log(err);
    err.status = '1';
    res.header("Content-Type",'application/json');
    res.send(JSON.stringify(err, null, 4));
  });
});


server.post('/api/login', (req,res) => {
  loginUser(req.body).then(response => {
    response.status = '0';
    res.header("Content-Type",'application/json');
    res.send(JSON.stringify(response, null, 4));
  }).catch(err => {
    console.log(err);
    err.status = '1';
    res.header("Content-Type",'application/json');
    res.send(JSON.stringify(err, null, 4));
  });
});


server.get('/api/logout/:token', function(req,res){
  let response = {};
  users.logout(req.params.token).then(result => {
    vprint(result);
    response.status = '0';
    response.message = 'Signed out successfully.';
    res.header("Content-Type",'application/json');
    res.send(JSON.stringify(response, null, 4));
  }).catch(err => {
    response.status = '1';
    response.message = err.message;
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
  if(password.length > 32 || password.length < 8){
    return false;
  }
  return true;
}


function processUser(user) {
  return new Promise(function(resolve, reject) {
    if(!('firstname' in user)){
      reject({'message': 'You must provide a first name.'});
      return;
    } else if(!('lastname' in user)){
      reject({'message': 'You must provide a last name.'});
      return;
    } else if(!('email' in user)){
      reject({'message': 'You must provide an email address.'});
      return;
    } else if(!('password' in user)){
      reject({'message': 'You must provide a password.'});
      return;
    } else if(!validEmail(user.email)){
      reject({'message': 'You must provide a valid email address.'});
      return;
    } else if(!validPassword(user.password)){
      reject({'message': 'You must provide a password.'});
      return;
    } else {
      vprint("Creating user: " + user.firstname + " " + user.lastname + " , " + user.email);
      users.createUser(user.firstname, user.lastname, user.email, user.password)
      .then(user => resolve(user))
      .catch(err => reject(err));
    }
  });
}


function loginUser(user){
  return new Promise(function(resolve, reject) {
    if(!('email' in user)){
      reject({'message': 'You must provide an email address.'});
      return;
    } else if(!('password' in user)){
      reject({'message': 'You must provide a password.'});
      return;
    } else if(!validEmail(user.email)){
      reject({'message': 'You must provide a valid email address.'});
      return;
    } else if(!validPassword(user.password)){
      reject({'message': 'You must provide a password.'});
      return;
    } else {
      vprint("Creating user: " + user.firstname + " " + user.lastname + " , " + user.email);
      users.login(user.email, user.password)
      .then(user => resolve(user))
      .catch(err => reject(err));
    }
  });
}


server.listen(3001);

console.log("Listening on http://localhost:3001/");

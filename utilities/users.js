let connection = require('./mongodbConnector').connection;
const bcrypt = require('bcrypt');
const uuid = require('uuid');
let dbname = 'auth';
let collection = 'users';


function users() { //returns the users database collection
  return new Promise(function(resolve, reject) {
    connection.then(client => {
      resolve(client.db(dbname).collection(collection));
    }).catch(err => reject(err));
  });
}


function findUser(query){ //returns a user that matches the query
  return new Promise(function(resolve, reject) {
    users().then(users => {
      resolve(users.findOne(query));
    }).catch(err => reject(err));
  });
}


function checkIfUserExists(query){ //returns true if a user exists
  return new Promise(function(resolve, reject) {
    findUser(query).then(user => resolve(user !== null))
    .catch(err => reject(err));
  });
}


function createUser(firstname, lastname, email, password){
  return new Promise(function(resolve, reject) {
    checkIfUserExists({'email': email}) //check if the user exists and if not then hash the password
    .then(userFound => {
      if(userFound){
        reject({'message': 'The email entered is already in use.'});
        return;
      } else {
        return bcrypt.hash(email + " " + password, 10); //hash password with email
      }
    }).then(hash => { //create user object
      return {'email': email, 'firstname': firstname, 'lastname': lastname, 'password': hash, 'token': ''};
    }).then(userObj => { //get the users collection and insert the new user
      return users().then(users => {
        return users.insertOne(userObj);
      });
    }).then(result => { //resolve the result of the insert
      resolve({'message': 'User created'});
      return;
    }).catch(err => reject(err));
  });
}


function login(email, password){
  return new Promise(function(resolve, reject) {
    findUser({'email': email})
    .then(user => { //find the user, if found check if the password matches
      if(user == null){
        reject({'message': 'User not found.'});
        return;
      } else {
        return bcrypt.hash(email + ' ' + password, 10).then(hash => { //check password
          if(user.password == hash){
            return user;
          } else {
            reject({'message': 'Wrong email or password.'});
            return;
          }
        });
      }
    }).then(verifiedUser => {
      let token = uuid.v4();
      return users.findOneAndUpdate({'email': email},{'$set': {'token': token}}).then(res => {
        verifiedUser.token = token;
        return verifiedUser;
      });
    }).then(tokenizedUser => {
        resolve(tokenizedUser);
        return;
    }).catch(err => reject(err));
  });
}


function logout(token){
  return new Promise(function(resolve, reject) {
    users().then(users => {
      return users.findOneAndUpdate({'token': token}, {'$set': {'token': ''}})
    }).then(res => {
      resolve(res);
    }).catch(err => reject(err));
  });
}


// users().then(users => {
//   return users.findOneAndDelete({'lastname': 'Bauman2'});
// }).then(result => {
//   console.log(result);
//   return users()
// }).then(users => {
users().then(users => {
  return users.find({});
}).then(usersList => {
  usersList.forEach(user => {
    console.log(user);
  });
}).catch(err => {
  console.log(err);
});


exports.createUser = createUser;
exports.findUser = findUser;
exports.login = login;
exports.logout = logout;

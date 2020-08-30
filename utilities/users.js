let connection = require('./mongodbConnector').connection;
const bcrypt = require('bcrypt');
const uuid = require('uuid');
let dbname = 'auth';
let collection = 'users'

function createUser(firstname, lastname, email, password){
  return new Promise(function(resolve, reject) {
    connection.then(function(client){
      let users = client.db(dbname).collection(collection);
      //check if email exists
      users.findOne({'email': email}).then(function(user){
        if(user == null){ //email isn't taken
          let userObj = {};
          userObj['email'] = email;
          userObj['firstname'] = firstname;
          userObj['lastname'] = lastname;
          userObj['token'] = "";
          let hashstr = email + " " + password;
          bcrypt.hash(hashstr, 10).then(function(hash){ //hash password with email
            userObj['password'] = hash;
            users.insertOne(userObj).then(function(res){ //insert user object to database
              resolve({'message': 'User created.'});
            },function(err){
              reject(err);
            })
          }, function(err){
            reject({'errObj': err, 'message': 'failed encrypting password'});
          });
        } else {
          reject({message: "Email taken"})
        }
      }, function(err){
        reject(err);
      });
    },function(err){
      reject(err);
    });
  });
}


function login(email,password){
  return new Promise(function(resolve,reject){
    connection.then(function(client){
      let users = client.db(dbname).collection(collection);
      users.findOne({'email': email}).then(function(user){
        if(user == null){
          reject({message: "Email doesn't exist."});
        } else {
          let hashstr = email + " " + password;
          bcrypt.compare(hashstr,user.password).then(function(match){
            if(match) {
              let token = uuid.v4();
              users.findOneAndUpdate({'email': email},{'$set': {'token': token}}).then(function(res){
                user.token = token;
                resolve(user);
              },function(err){
                reject(err);
              });
            } else {
              reject({message:"Incorrect username or password."});
            }
          }, function(err){
            console.log(err);
            reject({message: "Incorrect email or password."});
          });
        }
      },function(err){
        console.log(err);
        reject({message: "Error retrieving user from database."});
      });
    },function(err){
      reject(err);
    });
  });
}


function logout(token){
  return new Promise(function(resolve, reject) {
    connection.then(function(client){
      client.db(dbname).collection(collection)
        .findOneAndUpdate({'token': token}, {'$set': {'token': ''}})
        .then(result => resolve(result), err => reject(err));
    },function(err){
      reject(err);
    });
  });
}


function findUser(query){
  return new Promise(function(resolve, reject) {
    connection.then(function(client){
      let users = client.db(dbname).collection(collection);
      users.findOne(query).then(function(user){
        if(user == null){
          reject({'message': 'User not found.'});
        } else {
          resolve(user);
        }
      },function(err){
        reject(err);
      });
    }, function(err){
      reject(err);
    });
  });
}


exports.createUser = createUser;
exports.findUser = findUser;
exports.login = login;
exports.logout = logout;

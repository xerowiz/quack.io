'use strict';
var _ = require('underscore');
var User = require('../model/user.js');
var Result = require('../model/result.js');


function UserRegistery() {
  this.users = [];
}

function userById(users, id) {
  return _.findWhere(users, {id: id});
}

UserRegistery.prototype = {

  isIdentified: function(id) {
    if (userById(this.users, id) !== undefined) {
      return true;
    }
    return false;
  },

  onIdentify: function(socket, data, ack) {
    var usr = User.fromIo(socket, data);
    if(usr.isValid()) {
      this.users.push(usr);
      ack(Result.success(usr));
    } else {
      ack(Result.failure(10, {error: 'invalid data'}));
    }
  },

  onDisconnect: function(socket) {
    var usr = userById(socket.id);
    if(usr !== undefined) {
      this.users = _.without(this.users, usr);
    }
  },

  onNameChange: function(socket, data, ack) {
    var usr = userById(this.users, socket.id);
    if(usr !== undefined &&
       usr.validateName(data.name) &&
         usr.name !== data.name) {
      usr.name = data.name;
      socket.broadcast('nameChanged', usr);
      ack(Result.success());
    } else {
      ack(Result.failure(10, {error: 'invalid username'}));
    }
  },

  onStatusChange: function(socket, data, ack) {
    var usr = userById(this.users, socket.id);
    if(usr !== undefined &&
       usr.validateStatus(data.status)) {
      usr.status = data.status;
    socket.broadcast('statusChanged', usr);
    ack(Result.success());
    } else {
      ack(Result.failure(10, {error: 'invalid status provided'}));
    }
  }
};

module.exports = UserRegistery;

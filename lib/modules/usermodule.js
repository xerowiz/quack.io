'use strict';
var _ = require('underscore');
var User = require('../model/User.js');

var users = [];

function UserModule(io)  {
  this.io = io;

}

function userById(id) {
  return _.findWhere(users, {id: id});
}

function userBySocketId(sockId) {
  return _.findWhere(users, {sockId: sockId});
}

UserModule.prototype = {
  isConnected: function(id) {
    if (userById(id) !== undefined) {
      return true; 
    }
    return false;
  },

  onConnect: function(socket, data) {
    var usr = User.fromIo(socket, data);
    if(usr.isValid()) {
      users.push(usr);
      this.io.sockets.emit('co', {users: users});
      return true;
    }
    return false;
  },

  onDisconnect: function(socket) {
    var usr = userBySocketId(socket.id);
    users = _.without(users, usr);
    this.io.sockets.emit('dc',{id: usr.id});
  },

  onNameChanged: function(id, name) {
    var usr = userById(id);
    if(usr !== undefined) {
      usr.name = name; 
      return true;
    }
    return false;
  },

  onStatusChanged: function(id, status) {
    if(_.contains(User.statuses, status)) {
      var usr = userById(id);
      if(usr !== undefined) {
        usr.status = status;
      }
    }
  },

  addUser: function(user) {
    if(user.isValid()) {
      users.push(user);
    }
  }
};

module.exports = UserModule;

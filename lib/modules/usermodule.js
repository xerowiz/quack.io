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

function leave(io, user) {
  if(user !== undefined) {
    users = _.without(users, user);
    io.sockets.emit('userLeft', user);
  }
}

UserModule.prototype = {
  isConnected: function(id) {
    if (userById(id) !== undefined) {
      return true;
    }
    return false;
  },

  onJoin: function(socket, data) {
    var usr = User.fromIo(socket, data);
    if(usr.isValid()) {
      users.push(usr);
      socket.emit('identity', usr);
      this.io.sockets.emit('userJoined', usr);
      return true;
    }
    return false;
  },

  onLeave: function(data) {
    var usr = userById(data.id);
    leave(this.io, usr);
  },

  onDisconnect: function(socket) {
    var usr = userBySocketId(socket.id);
    leave(this.io, usr);
  },

  onNameChange: function(data) {
    var usr = userById(data.id);
    if(usr !== undefined &&
       usr.validateName(data.name) &&
         usr.name !== data.name) {
      usr.name = data.name;
      this.io.sockets.emit('nameChanged', usr);
      return true;
    }
    return false;
  },

  onStatusChange: function(data) {
    var usr = userById(data.id);
    if(usr !== undefined &&
       usr.validateStatus(data.status)) {
      usr.status = data.status;
      this.io.sockets.emit('statusChanged', usr);
    }
  },

  addUser: function(user) {
    if(user.isValid()) {
      users.push(user);
    }
  }
};

module.exports = UserModule;

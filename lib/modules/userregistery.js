'use strict';
var _ = require('underscore');
var User = require('../model/User.js');

var users = [];

function UserRegistery() {
}

function userById(id) {
  return _.findWhere(users, {id: id});
}

UserRegistery.prototype = {

  isIdentified: function(id) {
    if (userById(id) !== undefined) {
      return true;
    }
    return false;
  },

  onIdentify: function(socket, data) {
    var usr = User.fromIo(socket, data);
    if(usr.isValid()) {
      users.push(usr);
      socket.emit('identified', usr, function() {
        socket.broadcast('userJoined', usr);
      });
    } else {
      socket.emit('identificationFailure', {error: 'invalid payload'});
    }
  },

  onDisconnect: function(socket) {
    var usr = userById(socket.id);
    if(usr !== undefined) {
      users = _.without(users, usr);
      socket.broadcast('userDisconnected', usr);
    }
  },

  onNameChange: function(socket, data) {
    var usr = userById(data.id);
    if(usr !== undefined &&
       usr.validateName(data.name) &&
         usr.name !== data.name) {
      usr.name = data.name;
    socket.broadcast('nameChanged', usr);
    } else {
      socket.emit('nameChangeFailure',
                  { error:'invalid username'});
    }
  },

  onStatusChange: function(socket, data) {
    var usr = userById(data.id);
    if(usr !== undefined &&
       usr.validateStatus(data.status)) {
      usr.status = data.status;
    socket.broadcast('statusChanged', usr);
    } else {
      socket.emit('statusChangeFailure',
                   { error: 'invalid status, must be on or aw'});
    }
  },

  addUser: function(user) {
    if(user.isValid()) {
      users.push(user);
    }
  }
};

module.exports = UserRegistery;

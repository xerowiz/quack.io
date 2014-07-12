'use strict';
var _ = require('underscore');
var User = require('../model/user.js');
var Result = require('../model/result.js');


function UserRegistery() {
  this.users = [];
}

UserRegistery.prototype = {

  userById: function(id) {
    return _.findWhere(this.users, {id: id});
  },

  isIdentified: function(id) {
    if (this.userById(id) !== undefined) {
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
    var usr = this.userById(socket.id);
    if(usr !== undefined) {
      this.users = _.without(this.users, usr);
    }
  },

  onNameChange: function(socket, data, ack) {
    var usr = this.userById(socket.id);
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
    var usr = this.userById(socket.id);
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

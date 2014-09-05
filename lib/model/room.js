'use strict';
var _ = require('underscore');
var Result = require('../model/result.js');

function Room(name) {
  this.name = name;
  this.users = [];
}

Room.prototype = {

  isEmpty: function() {
    return this.users.length === 0;
  },

  inRoom: function(socket) {
    return _.findWhere(this.users, socket.id) !== undefined;
  },

  join: function(socket, ack) {
    if(!this.inRoom(socket)) {
      var _this = this;
      socket.join(this.name, function(err) {
        if(err !== null) {
          ack(Result.failure(10, err));
        } else {
          _this.users.push(socket.id);
          socket.in(_this.name).broadcast.emit('userJoined', socket.id);
          ack(Result.success());
        }
      });
    } else {
      ack(Result.failure(11,{error: 'user already in room'}));
    }
  },

  leave: function(socket, ack) {
    if(this.inRoom(socket)) {
      var _this = this;
      socket.leave(this.name, function(err) {
        if(err !== null) {
          ack(Result.failure(10, err));
        } else {
          _this.users = _.without(_this.users, socket.id);
          socket.in(_this.name).broadcast.emit('userLeft', socket.id);
          ack(Result.success());
        }
      });
    } else {
      ack(Result.failure(11,{error: 'user not in room'}));
    }
  },

  post: function(socket, io, event, ack) {
    if(this.inRoom(socket)) {
      if(event.isValid()) {
        io.in(this.name).emit('event', event);
        ack(Result.success());
      } else {
        ack(Result.failure(10, {error: 'invalid event'}));
      }
    } else {
      ack(Result.failure(11, {error: 'not in room'}));
    }
  }

};

module.exports = Room;

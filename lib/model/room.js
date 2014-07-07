'use strict';
var _ = require('underscore');
var Result = require('../model/result.js');

function Room(name) {
  this.name = name;
  this.users = [];
}

Room.prototype = {

  isEmpty: function() {
    if(this.users.length === 0) {
      return true;
    }
    return false;
  },

  inRoom: function(socket) {
    if(_.findWhere(this.users, {id: socket.id}) !== undefined){
      return true;
    }
    return false;
  },

  join: function(socket, ack) {
    if(!this.inRoom(socket)) {
      var _this = this;
      socket.join(this.name, function(err) {
        if(err !== null) {
          ack(Result.failure(0, err));
        } else {
          _this.users.push(socket.id);
          socket.in(_this.name).broadcast.emit('userJoined', socket.id);
          ack(Result.success());
        }
      });
    } else {
      ack(Result.failure(1,{error: 'already in room'}));
    }
  },

  leave: function(socket, ack) {
    if(this.inRoom(socket)) {
      var _this = this;
      socket.leave(this.name, function(err) {
        if(err !== undefined) {
          ack(Result.failure(0, err));
        } else {
          _this.users = _.without(_this.users,{id: socket.id});
          socket.in(_this.name).broadcast('userLeft', socket.id);
          ack(Result.success());
        }
      });
    } else {
      ack(Result.failure(1,{error: 'not in room'}));
    }
  },

  post: function(socket, io, event, ack) {
    if(this.inRoom(socket)) {
      if(event.isValid()) {
        io.in(this.name).emit('event', event);
        ack(Result.success());
      } else {
        ack(Result.failure(0, {error: 'invalid event'}));
      }
    } else {
      ack(Result.failure(1, {error: 'not in room'}));
    }
  }

};

module.exports = Room;

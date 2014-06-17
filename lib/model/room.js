'use strict';
var _ = require('underscore');
var Result = require('../model/result.js');

function Room(name) {
  this.name = name;
}

Room.prototype = {

  inRoom: function(socket) {
    if(_.findWhere(socket.rooms, this.name) !== undefined){
      return true;
    }
    return false;
  },

  join: function(socket, ack) {
    if(!this.inRoom(socket)) {
      socket.join(this.name, function(err) {
        if(err !== undefined) {
          ack(Result.failure(0, err));
        } else {
          ack(Result.success());
          socket.in(this.name).broadcast('userJoined', {id: socket.id});
        }
      });

    } else {
      ack(Result.failure(1,{error: 'already in room'}));
    }
  },

  leave: function(socket, ack) {
    if(this.inRoom(socket)) {
      socket.leave(this.name, function(err) {
        if(err !== undefined) {
          ack(Result.failure(0, err));
        } else {
          ack(Result.success());
          socket.in(this.name).broadcast('userLeft', {id: socket.id});
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




exports.Room = Room;

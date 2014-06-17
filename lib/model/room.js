'use strict';
var _ = require('underscore');
var Result = require('../model/result.js');

function Room(name) {
  this.name = name;
}

Room.prototype = {

  inRoom: function(socket ) {
    if(_.findWhere(socket.rooms, this.name) !== undefined){
      return true;
    }
    return false;
  },

  join: function(socket, callback) {
    if(!this.inRoom(socket)) {
      socket.join(this.name, function(err) {
        if(err !== undefined) {
          callback(Result.failure(0, err));
        } else {
          callback(Result.success());
          socket.in(this.name).broadcast('userJoined', {id: socket.id});
        }
      });

    } else {
      callback(Result.failure(1,{error: 'already in room'}));
    }
  },

  leave: function(socket, callback) {
    if(this.inRoom(socket)) {
      socket.leave(this.name, function(err){ 
        if(err !== undefined) {
          callback(Result.failure(0, err));
        } else {
          callback(Result.success());
          socket.in(this.name).broadcast('userLeft', {id: socket.id});
        }
      });
    } else {
      callback(Result.failure(1,{error: 'not in room'}));
    }
  },

  post: function(socket, io, event, callback) {
    if(this.inRoom(socket)) {
      if(event.isValid()) {
        io.in(this.name).emit('event', event);
        callback(Result.success());
      } else {
        callback(Result.failure(0, {error: 'invalid event'}));
      }
    } else {
      callback(Result.failure(1, {error: 'not in room'}));
    }
  }

};




exports.Room = Room;

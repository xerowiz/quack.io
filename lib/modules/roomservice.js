'use strict';
var Room = require('./lib/model/room.js');
var _ = require('_');

var rooms = [];

function RoomService(io, registery) {
  this.io = io;
  this.registery = registery;
}

RoomService.prototype = {
  
  onJoin: function(socket, roomName) {
    if(registery.isIdentified(socket.id)) {
      var room = _.findWhere(rooms,{name: roomName});
      if(room !== undefined) {
          room.join(socket);
      } else {
      
      }
    } else {
    
    }
  },

  onLeave: function(socket, roomName) {
  
  },

  onCreateRoom: function(socket, roomName) {
  
  },

  onDeleteRoom: function(socket, roomName) {
  
  }

};


exports.RoomService = RoomService;

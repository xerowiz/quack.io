'use strict';
var _ = require('underscore');
var assert = require('assert');

var Room = require('../model/room.js');
var Result = require('../model/result.js');


function RoomService(io, registery) {
  this.io = io;
  this.registery = registery;
  this.rooms = [];
}

function roomByName(rooms, name) {
  return _.findWhere(rooms,{name: name});
}

function closeRoomIfEmpty(rooms, socket, room) {
  if(room.isEmpty()) {
    rooms = _.without(rooms, room);
    socket.broadcast('roomclosed', room.name);
  }
}

function createRoom(rooms, name) {
  var room = new Room(name);
  rooms.push(room);
  return room;
}

RoomService.prototype = {

  onJoin: function(socket, name, ack) {
    if(this.registery.isIdentified(socket.id)) {
      var room = roomByName(this.rooms, name);
      if(room !== undefined) {
        room.join(socket, ack);
      } else {
        var newRoom = createRoom(this.rooms, name);
        newRoom.join(socket, ack);
      }
    } else {
      ack(Result.failure(11, {error: 'user not identitied'}));
    }
  },

  onLeave: function(socket, name, ack) {
    if(this.registery.isIdentified(socket.id)) {
      var room = roomByName(this.rooms, name);
      if(room !== undefined) {
        room.leave(socket, ack);
        closeRoomIfEmpty(this.rooms, socket, room);
      } else {
        ack(Result.failure(10, {error: 'room not existing'}));
      }
    } else {
      ack(Result.failure(11, {error: 'user not identified'}));
    }
  },

  onDisconnect: function(socket) {
    if(this.registery.isIdentified(socket.id)) {
      var _this = this;
      socket.rooms.forEach(function(roomName) {
        var room =  roomByName(_this.rooms, roomName);
        assert.notEqual(room,undefined,'user cannot belong to a non registered room');
        room.leave(socket, function() {});
        closeRoomIfEmpty(_this.rooms, socket, room);
      });
    }
  }

};


module.exports = RoomService;

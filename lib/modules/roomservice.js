'use strict';
var _ = require('_');
var assert = require('assert');

var Room = require('../model/room.js');
var Result = require('../model/result.js');

var rooms = [];

function RoomService(io, registery) {
  this.io = io;
  this.registery = registery;
}

function roomByName(name) {
  return _.findWhere(rooms,{name: name});
}

RoomService.prototype = {

  onJoin: function(socket, name, ack) {
    if(this.registery.isIdentified(socket.id)) {
      var room = roomByName(name);
      if(room !== undefined) {
         room.join(socket, ack);
      } else {
        ack(Result.failed(10,{error: 'room not existing'}));
      }
    } else {
      ack(Result.failed(11, {error: 'user not identitied'}));
    }
  },

  onLeave: function(socket, name, ack) {
    if(this.registery.isIdentified(socket.id)) {
      var room = roomByName(name);
      if(room !== undefined) {
        room.leave(socket, ack);
      } else {
        ack(Result.failure(10, {error: 'room not exiting'}));
      }
    } else {
      ack(Result.failure(11, {error: 'user not identified'}));
    }
  },

  onCreateRoom: function(socket, name, ack) {
    if(this.registery.isIdentified(socket.id)) {
      var room = roomByName(name);
      if(room === undefined) {
        room = new Room(name);
        rooms.push(room);
        ack(Result.success());
      } else {
        ack(Result.failure(10, {error:'room already created'}));
      }
    } else {
      ack(Result.failure(11, {error:'user not identified'}));
    }
  },

  onDisconect: function(socket) {
    if(this.registery.isIdentified(socket.id)) {
      socket.rooms.forEach(function(roomName) {
        var room = _.findWhere(rooms, {name: roomName});
        assert.notEqual(room,undefined,'room must be defined in in room service');
        room.leave(socket, function() {});
        if(room.isEmpty) {
          rooms = _.without(rooms, room);
          socket.broadcast('roomdestroyed', room);
        }
      });
    }
  }

};


exports.RoomService = RoomService;

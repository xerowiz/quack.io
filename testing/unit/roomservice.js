'use strict';
var expect = require('chai').expect;
var injectr = require('injectr');

var RoomService = require('../../lib/modules/roomservice.js');
var Result = require('../../lib/model/result.js');

describe('RoomService', function() {
  describe('#onJoin', function() {

    it('should accept join for an identified user and existing room', function() {
      // given
      var socket = {
        id: 'aaaa',
      };

      var name = 'quackroom';

      var registery = {
        isIdentified: function() {
          return true;
        }
      };

      var joinCalled = false;

      var room = {
        name: 'quackroom',
        join: function() {
          joinCalled = true;
        }
      };

      var roomservice = new RoomService({}, registery);
      roomservice.rooms.push(room);
      // when

      roomservice.onJoin(socket, name, function() {});

      // then
      expect(joinCalled).to.be.ok;
    });

    it('should not accept join for a not identified user', function() {
      // given
      var socket = {
        id: 'aaaa'
      };

      var name = 'quackroom';

      var registery = {
        isIdentified: function() {
          return false;
        }
      };

      var joinCalled = false;

      var room = {
        name: 'quackroom',
        join: function() {
          joinCalled = true;
        }
      };


      var result = null;
      var roomservice = new RoomService({}, registery);
      roomservice.rooms.push(room);

      // when
      roomservice.onJoin(socket, name, function(ackPayload) {
        result = ackPayload;
      });

      // then
      expect(joinCalled).to.be.not.ok;
      expect(result).to.be.eql(Result.failure(11,{error: 'user not identified'}));
    });

    it('should create a new room when users ask to join a not already created one', function() {
      // given
      var socket = {
        id: 'aaaa'
      };

      var newRoomCreated = false;
      var newRoomJoined = false;

      var MockRoomService = injectr('../../lib/modules/roomservice.js', {
        '../model/room.js': function(socket, name) {
          this.name = name;
          this.owner = socket.id;
          newRoomCreated = true;
          this.join = function(socket, ack) {
            newRoomJoined = true;
          };
        }
      });

      var name = 'roomquack';

      var registery = {
        isIdentified: function() {
          return true;
        }
      };

      var roomservice = new MockRoomService({}, registery);

      // when
      roomservice.onJoin(socket, name, function() {
      });

      // then
      expect(newRoomCreated).to.be.ok;
      expect(newRoomJoined).to.be.ok;
    });
  });

  describe('#onLeave', function() {
    it('should accept leave for an identified user and existing room', function (){
      // given
      var socket = {
        id: 'aaaa'
      };

      var name = 'totoroom';

      var registery = {
        isIdentified: function() {
          return true;
        }
      };

      var left = false;

      var room = {
        name: 'totoroom',
        isEmpty: function() {
          return false;
        },
        leave: function() {
          left = true;
        }
      };

      var roomservice = new RoomService({}, registery);
      roomservice.rooms.push(room);

      // when
      roomservice.onLeave(socket, name, function() {
      });

      // then
      expect(left).to.be.ok;
    });

    it('should close the room when last user leaves it', function() {
      // given

      var broadcastEvent = null;
      var broadcastPayload = null;
      var socket = {
        id: 'aaaa',
      };

      var io = {
        sockets: {
          emit: function(event, payload) {
            broadcastEvent = event;
            broadcastPayload = payload;
          }
        }
      };

      var name = 'totoroom';

      var registery = {
        isIdentified: function() {
          return true;
        }
      };

      var left = false;

      var room = {
        name: 'totoroom',
        isEmpty: function() {
          return true;
        },
        leave: function() {
          left = true;
        }
      };

      var roomservice = new RoomService(io, registery);
      roomservice.rooms.push(room);

      // when
      roomservice.onLeave(socket, name, function() {
      });

      // then
      expect(left).to.be.ok;
      expect(broadcastEvent).to.be.equal('roomclosed');
      expect(broadcastPayload).to.be.equal('totoroom');
    });

    it('should not accept leave for a not identified user', function() {
      // given

      var broadcastEvent = null;
      var broadcastPayload = null;
      var socket = {
        id: 'aaaa',
        broadcast: function(event, payload) {
          broadcastEvent = event;
          broadcastPayload = payload;
        }
      };

      var name = 'totoroom';

      var registery = {
        isIdentified: function() {
          return false;
        }
      };

      var roomservice = new RoomService({}, registery);

      var result = null;
      // when
      roomservice.onLeave(socket, name, function(ackPayload) {
        result = ackPayload;
      });

      // then

      expect(result).to.be.eql(Result.failure(11, {error: 'user not identified'}));
    });

    it('should not accept leave for a unknown room', function() {
      // given

      var broadcastEvent = null;
      var broadcastPayload = null;
      var socket = {
        id: 'aaaa',
        broadcast: function(event, payload) {
          broadcastEvent = event;
          broadcastPayload = payload;
        }
      };

      var name = 'totoroom';

      var registery = {
        isIdentified: function() {
          return true;
        }
      };

      var roomservice = new RoomService({}, registery);

      var result = null;
      // when
      roomservice.onLeave(socket, name, function(ackPayload) {
        result = ackPayload;
      });

      // then

      expect(result).to.be.eql(Result.failure(10, {error: 'room not existing'}));
    });
  });

  describe('#onDisconnect', function() {
    it('should avoid processing when disconected user is not identified', function() {
      // given

      var socket = {
        id: 'aaaa',
        rooms: ['toto','firefox', 'blah']
      };

      var registery = {
        isIdentified: function() {
          return false;
        }
      };

      var roomservice = new RoomService({}, registery);
      // when

      roomservice.onDisconnect(socket);

      // then
      // no mehtods are defined on mocks, so unexpected calls will lead to test failure
    });

    it('should remove the disconnected user from all rooms it was connected to',function(){
      // given

      var MockRoom = function(name, empty) {
          this.name = name;
          this.left = false;
          this.empty = empty;

          this.leave = function(socket, ack) {
            this.left = true;
          };

          this.isEmpty = function() {
            return this.empty;
          };
      };

      var socket = {
        id: 'aaaa',
        rooms: ['toto','firefox', 'blah']
      };

      var registery = {
        isIdentified: function() {
          return true;
        }
      };

      var totoRoom = new MockRoom('toto', false);
      var firefoxRoom = new MockRoom('firefox', false);
      var blahRoom = new MockRoom('blah', false);

      var roomservice = new RoomService({}, registery);
      roomservice.rooms.push(totoRoom);
      roomservice.rooms.push(firefoxRoom);
      roomservice.rooms.push(blahRoom);

      // when
      roomservice.onDisconnect(socket);

      // then
      expect(totoRoom.left).to.be.ok;
      expect(firefoxRoom.left).to.be.ok;
      expect(blahRoom.left).to.be.ok;
    });
  });
});

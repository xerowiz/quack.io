'use strict';
var expect = require('chai').expect;
var Room = require('../../lib/model/room.js');
var Result = require('../../lib/model/result.js');
var mocks = require('./mocks/mocks.js');

describe('Rooms', function() {
  describe('#join', function() {
    it('should accept join when user is not in room', function() {
      // given
      var room = new Room('quackroom');
      var broadcastRoom = null;
      var joinedRoom = null;
      var notifMessage = null;
      var notifPayload = null;

      var socket = mocks.MockSocketFactory(
        'bbbb',
        function(name, callback) {
          joinedRoom = name;
          callback(null);
        },
        function(inRoom) {
          broadcastRoom = inRoom;
          return{
            broadcast: {
              emit: function(message, payload) {
                notifMessage = message;
                notifPayload = payload;
              }
            }
          };
        });

        var result = null;
        // when
        room.join(socket, function(joinResult){
          result = joinResult;
        });
        // then
        expect(joinedRoom).to.equal('quackroom');
        expect(notifMessage).to.equal('userJoined');
        expect(notifPayload).to.equal('bbbb');
        expect(result).to.be.eql(Result.success());
    });

    it('should cancel join socket when join operation fails', function() {
      // given
      var room = new Room('quackroom');
      var joinedRoom = null;
      var socket = mocks.MockSocketFactory(
        'bbbb',
        function(name, callback) {
          joinedRoom = name;
          callback({error: 'failed'});
        }
      );

      var result = null;
      // when
      room.join(socket, function(joinResult){
        result = joinResult;
      });

      // then
      expect(joinedRoom).to.equal('quackroom');
      expect(result).to.be.eql(Result.failure(10,{error: 'failed'}));
    });

    it('should cancel join when user is already in room', function() {
      // given
      var room = new Room('quackroom');
      var user = 'bbbb';
      var socket = mocks.MockSocketFactory('bbbb');

      room.users.push(user);

      var result = null;
      // when
      room.join(socket, function(joinResult){
        result = joinResult;
      });

      // then
      expect(result).to.be.eql(Result.failure(11,{error: 'user already in room'}));
    });
  });

  describe('#leave', function() {
    it('should accept leave when user is in room', function() {
      // given
      var room = new Room('quackroom');
      var broadcastRoom = null;
      var leftRoom = null;
      var notifMessage = null;
      var notifPayload = null;
      var user = 'bbbb';
      var emitEvent = null;
      var emitPayload = null;

      var socket = mocks.MockSocketFactory(
        'bbbb',
        function(name, callback) {
          leftRoom = name;
          callback(null);
        },
        function(inRoom) {
          broadcastRoom = inRoom;
          return{
            broadcast:{
              emit: function(message, payload) {
                notifMessage = message;
                notifPayload = payload;
              }
            }
          };
        });

      room.users.push(user);

      var result = null;
      // when
      room.leave(socket, function(leaveResult){
        result = leaveResult;
      });
      // then
      expect(leftRoom).to.equal('quackroom');
      expect(broadcastRoom).to.equal('quackroom');
      expect(notifMessage).to.equal('userLeft');
      expect(notifPayload).to.equal('bbbb');
      expect(result).to.be.eql(Result.success());
    });

    it('should cancel leave when socket leave fails', function() {
      // given
      var room = new Room('quackroom');
      var leftRoom = null;
      var user = 'bbbb';
      var socket = mocks.MockSocketFactory(
        'bbbb',
        function(name, callback) {
          leftRoom = name;
          callback({error: 'failed'});
        });

        room.users.push(user);
        var result = null;
        // when
        room.leave(socket, function(leaveResult){
          result = leaveResult;
        });

        // then
        expect(leftRoom).to.equal('quackroom');
        expect(result).to.be.eql(Result.failure(10, {error: 'failed'}));
    });

    it('should not accept leave when user is not in room', function() {
      // given
      var room = new Room('quackroom');
      var socket = mocks.MockSocketFactory('bbbb');

      var result = null;
      // when
      room.leave(socket, function(leaveResult){
        result = leaveResult;
      });

      // then
      expect(result).to.be.eql(Result.failure(11,{error: 'user not in room'}));
    });
  });

  describe('#post', function() {
    it('should accept post when user is in room', function() {
      // given
      var socket = {id : 'aaaa'};
      var broadcastRoom = null;
      var emittedEvent = null;
      var emittedPayload = null;
      var receivedResult = null;

      var io = {
        in: function(roomName) {
          broadcastRoom = roomName;
          return {
            emit: function(event, payload) {
              emittedEvent = event;
              emittedPayload = payload;
            }
          };
        }
      };

      var event = {
        isValid: function() {
          return true;
        }
      };

      var room = new Room('quackroom');
      room.users.push('aaaa');

      // when
      room.post(socket,io, event, function(result){
        receivedResult = result;
      });

      // then
      expect(broadcastRoom).to.equal('quackroom');
      expect(emittedEvent).to.equal('event');
      expect(emittedPayload).to.eql(event);
      expect(receivedResult).to.eql(Result.success());
    });

    it('should not accept post when event is invalid', function() {
      // given
      var socket = {id : 'aaaa'};
      var broadcastRoom = null;
      var emittedEvent = null;
      var emittedPayload = null;
      var receivedResult = null;

      var io = {};

      var event = {
        isValid: function() {
          return false;
        }
      };

      var room = new Room({id: 'aaaa'}, 'quackroom');
      room.users.push('aaaa');

      // when
      room.post(socket,io, event, function(result){
        receivedResult = result;
      });

      // then
      expect(broadcastRoom).to.equal(null);
      expect(emittedEvent).to.equal(null);
      expect(emittedPayload).to.equal(null);
      expect(receivedResult).to.eql(Result.failure(10,{error: 'invalid event'}));
    });

    it('should not accept post when user is not in room', function() {
      // given
      var socket = {id : 'aaaa'};
      var broadcastRoom = null;
      var emittedEvent = null;
      var emittedPayload = null;
      var receivedResult = null;

      var io = {
        in: function(roomName) {
          broadcastRoom = roomName;
          return {
            emit: function(event, payload) {
              emittedEvent = event;
              emittedPayload = payload;
            }
          };
        }
      };

      var event = {
        isValid: function() {
          return true;
        }
      };

      var room = new Room({id: 'aaaa'}, 'quackroom');

      // when
      room.post(socket,io, event, function(result){
        receivedResult = result;
      });

      // then
      expect(broadcastRoom).to.equal(null);
      expect(emittedEvent).to.equal(null);
      expect(emittedPayload).to.equal(null);
      expect(receivedResult).to.eql(Result.failure(11, {error:'not in room'}));
    });
  });
});

'use strict';
var expect = require('chai').expect;
var Room = require('../lib/model/room.js');
var mocks = require('./mocks/mocks.js');

describe('Rooms', function() {
  describe('#join', function() {
    it('should accept join when user is not in room', function() {
      // given
      var room = new Room({id: 'aaaaa'}, 'quackroom');
      var broadcastRoom = null;
      var joinedRoom = null;
      var notifMessage = null;
      var notifPayload = null;
      var socket = mocks.MockSocketFactory(
        'bbbb',
        function(name, callback) {
          joinedRoom = name;
          callback();
        },
        function(inRoom) {
          broadcastRoom = inRoom;
          return {
            broadcast: function(message, payload) {
              notifMessage = message;
              notifPayload = payload;
            }};
        });

        var result = null;
        // when
        room.join(socket, function(joinResult){
          result = joinResult;
        });
        // then
        expect(broadcastRoom).to.equal('quackroom');
        expect(notifMessage).to.equal('userJoined');
        expect(notifPayload).to.equal('bbbb');
        // WTF ?expect(result).to.be.eql({ status: 'success', code: undefined, payload: undefined });
    });

    it('should cancel join socket join operation fails', function() {
      // given
      var room = new Room({id: 'aaaaa'}, 'quackroom');
      var broadcastRoom = null;
      var joinedRoom = null;
      var notifMessage = null;
      var notifPayload = null;
      var socket = mocks.MockSocketFactory(
        'bbbb',
        function(name, callback) {
          joinedRoom = name;
          callback({error: 'failed'});
        },
        function(inRoom) {
          broadcastRoom = inRoom;
          return {
            broadcast: function(message, payload) {
              notifMessage = message;
              notifPayload = payload;
            }};
        });

        var result = null;
        // when
        room.join(socket, function(joinResult){
          result = joinResult;
        });

        // then
        expect(broadcastRoom).to.equal(null);
        expect(notifMessage).to.equal(null);
        expect(notifPayload).to.equal(null);
        // WTF ?expect(result).to.be.eql({ status: 'failure', code: 1, payload: {error: 'already in room'}});
    });

    it('should not accept join when user is already in room', function() {
      // given
      var room = new Room({id: 'aaaaa'}, 'quackroom');
      var broadcastRoom = null;
      var joinedRoom = null;
      var notifMessage = null;
      var notifPayload = null;
      var user = {id: 'bbbb'};
      var socket = mocks.MockSocketFactory(
        'bbbb',
        function(name, callback) {
          joinedRoom = name;
          callback();
        },
        function(inRoom) {
          broadcastRoom = inRoom;
          return {
            broadcast: function(message, payload) {
              notifMessage = message;
              notifPayload = payload;
            }};
        });

        room.users.push(user);

        var result = null;
        // when
        room.join(socket, function(joinResult){
          result = joinResult;
        });

        // then
        expect(broadcastRoom).to.equal(null);
        expect(notifMessage).to.equal(null);
        expect(notifPayload).to.equal(null);
        // WTF ?expect(result).to.be.eql({ status: 'failure', code: 1, payload: {error: 'already in room'}});
    });
  });

  describe('#leave', function() {
    it('should accept leave when user is in room', function() {
      // given
      var room = new Room({id: 'aaaaa'}, 'quackroom');
      var broadcastRoom = null;
      var leftRoom = null;
      var notifMessage = null;
      var notifPayload = null;
      var user = {id: 'bbbb'};
      var socket = mocks.MockSocketFactory(
        'bbbb',
        function(name, callback) {
          leftRoom = name;
          callback();
        },
        function(inRoom) {
          broadcastRoom = inRoom;
          return {
            broadcast: function(message, payload) {
              notifMessage = message;
              notifPayload = payload;
            }};
        });

        room.users.push(user);

        var result = null;
        // when
        room.leave(socket, function(leaveResult){
          result = leaveResult;
        });
        // then
        expect(broadcastRoom).to.equal('quackroom');
        expect(notifMessage).to.equal('userLeft');
        expect(notifPayload).to.equal('bbbb');
        // WTF ?expect(result).to.be.eql({ status: 'success', code: undefined, payload: undefined });
    });

    it('should cancel leave  when socket leave operation fails', function() {
      // given
      var room = new Room({id: 'aaaaa'}, 'quackroom');
      var broadcastRoom = null;
      var leftRoom = null;
      var notifMessage = null;
      var notifPayload = null;
      var user = {id: 'bbbb'};
      var socket = mocks.MockSocketFactory(
        'bbbb',
        function(name, callback) {
          leftRoom = name;
          callback({error: 'failed'});
        },
        function(inRoom) {
          broadcastRoom = inRoom;
          return {
            broadcast: function(message, payload) {
              notifMessage = message;
              notifPayload = payload;
            }};
        });
        room.users.push(user);
        var result = null;
        // when
        room.leave(socket, function(leaveResult){
          result = leaveResult;
        });

        // then
        expect(broadcastRoom).to.equal(null);
        expect(notifMessage).to.equal(null);
        expect(notifPayload).to.equal(null);
        // WTF ?expect(result).to.be.eql({ status: 'failure', code: 1, payload: {error: 'already in room'}});
    });

    it('should not accept join when user is not in room', function() {
      // given
      var room = new Room({id: 'aaaaa'}, 'quackroom');
      var broadcastRoom = null;
      var leftRoom = null;
      var notifMessage = null;
      var notifPayload = null;
      var socket = mocks.MockSocketFactory(
        'bbbb',
        function(name, callback) {
          leftRoom = name;
          callback();
        },
        function(inRoom) {
          broadcastRoom = inRoom;
          return {
            broadcast: function(message, payload) {
              notifMessage = message;
              notifPayload = payload;
            }};
        });


        var result = null;
        // when
        room.leave(socket, function(leaveResult){
          result = leaveResult;
        });

        // then
        expect(broadcastRoom).to.equal(null);
        expect(notifMessage).to.equal(null);
        expect(notifPayload).to.equal(null);
        // WTF ?expect(result).to.be.eql({ status: 'failure', code: 1, payload: {error: 'already in room'}});
    });
  });

  describe('#post', function() {
    it('should accept post', function() {
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
      room.users.push(socket);

      // when
      room.post(socket,io, event, function(result){
        receivedResult = result;
      });

      // then
      expect(broadcastRoom).to.equal('quackroom');
      expect(emittedEvent).to.equal('event');
      expect(emittedPayload).to.eql(event);
      // same stuff here :( expect(receivedResult).to.eql({status: 'success', code: undefined, payload: undefined});
    });

    it('should not accept post when event is invalid', function() {
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
          return false;
        }
      };

      var room = new Room({id: 'aaaa'}, 'quackroom');
      room.users.push(socket);

      // when
      room.post(socket,io, event, function(result){
        receivedResult = result;
      });

      // then
      expect(broadcastRoom).to.equal(null);
      expect(emittedEvent).to.equal(null);
      expect(emittedPayload).to.equal(null);
      // same stuff here :( expect(receivedResult).to.eql({status: 'success', code: undefined, payload: undefined});
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
      // same stuff here :( expect(receivedResult).to.eql({status: 'success', code: undefined, payload: undefined});
    });
  });
});

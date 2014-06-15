'use strict';
var expect = require('chai').expect;
var injectr = require('injectr');
var User = require('../lib/model/User.js');
var UserModule = require('../lib/modules/usermodule.js');
var Mocks = require('./mocks/mocks.js');

describe('usermodule', function() {
  describe('#isConnected', function() {

    it('should not flag as connected a not connected user', function() {
      var io = Mocks.io();
      var instance = new UserModule(io);
      //given
      var id = 0;
      //when
      var result = instance.isConnected(id);
      //then
      expect(result).to.be.not.ok;
    });

    it('should flag as connected a connected user', function() {
      var io = Mocks.io();
      var instance = new UserModule(io);
      //given
      var existingUser = new User(0,10,'JC','on');
      instance.addUser(existingUser);
      //when
      var result = instance.isConnected(existingUser.id);
      //then
      expect(result).to.be.ok;
    });
  });

  describe('#onJoin', function() {
    it('should register and notify a valid user', function() {
      //given
      var io = Mocks.io('userJoined');
      var MockUser = new Mocks.MockUserFactory(true, true);
      var MockedUserModule = injectr('../lib/modules/usermodule.js',{
        '../model/User.js': MockUser
      });
      var socket = {id: 10};
      var data = {name: 'quack'};
      var instance = new MockedUserModule(io);

      //when
      var result = instance.onJoin(socket, data);

      //then
      expect(instance.isConnected(10)).to.be.ok;
      expect(io.sockets.emitCalled).to.be.ok;
      expect(io.sockets.calledWithRightCode).to.be.ok;
    });

    it('should not register and notify an invalid user', function() {
      // given
      var io = Mocks.io('userJoined');
      var MockBadUser = new Mocks.MockUserFactory(false, false);
      var MockedUserModule = injectr('../lib/modules/usermodule.js',{
        '../model/User.js': MockBadUser
      });
      var socket = {id: 10};
      var data = {name: 'quack'};
      var instance = new MockedUserModule(io);

      // when
      var result = instance.onJoin(socket, data);

      // then
      expect(instance.isConnected(10)).to.be.not.ok;
      expect(io.sockets.emitCalled).to.be.not.ok;
    });
  });

  describe('#onDisconnect', function() {
    it('should unregister and notify an existing user', function() {
      ///given
      var io = Mocks.io('userLeft');
      var MockUser = new Mocks.MockUserFactory(true, true);
      var MockedUserModule = injectr('../lib/modules/usermodule.js',{
        '../model/User.js': MockUser
      });
      var socket = {id: 10};
      var instance = new MockedUserModule(io);
      var connectedUser = MockUser.fromIo();

      instance.addUser(connectedUser);

      //when
      instance.onDisconnect(socket);

      //then
      expect(instance.isConnected(10)).to.be.not.ok;
      expect(io.sockets.emitCalled).to.be.ok;
      expect(io.sockets.calledWithRightCode).to.be.ok;
    });

    it('should not unregister and notify a not connected user', function() {
      // given
      var io = Mocks.io('userLeft');
      var MockUser = Mocks.MockUserFactory(true, true);
      var MockedUserModule = injectr('../lib/modules/usermodule.js',{
        '../model/User.js': MockUser
      });
      var socket = {id: 10};
      var instance = new MockedUserModule(io);

      //when
      instance.onDisconnect(socket);

      //then
      expect(instance.isConnected(10)).to.be.not.ok;
      expect(io.sockets.emitCalled).to.be.not.ok;
    });
  });

  describe('#onNameChange', function() {
    it('should notify a name update for a connected user', function() {
      // given
      var io = Mocks.io('nameChanged');
      var MockUser = new Mocks.MockUserFactory(true, true);
      var MockedUserModule = injectr('../lib/modules/usermodule.js',{
        '../model/User.js': MockUser
      });
      var instance = new MockedUserModule(io);
      instance.addUser(MockUser.fromIo());
      var data ={
        id: 10,
        name: 'roger' 
      };

      //when
      var result = instance.onNameChange(data);

      //then
      expect(result).to.be.ok;
      expect(io.sockets.emitCalled).to.be.ok;
      expect(io.sockets.calledWithRightCode).to.be.ok;
    });

    it('should not notify a name update for a connected user with a non valid new name', function() {
      /// given
      var io = Mocks.io('nameChanged');
      var MockUser = new Mocks.MockUserFactory(true, false);
      var MockedUserModule = injectr('../lib/modules/usermodule.js',{
        '../model/User.js': MockUser
      });
      var instance = new MockedUserModule(io);
      instance.addUser(MockUser.fromIo());
      var data = {
        id: 10,
        name: {payload: 'canard'}
      };

      //when
      var result = instance.onNameChange(data);

      //then
      expect(result).to.be.not.ok;
      expect(io.sockets.emitCalled).to.be.not.ok;
    });

    it('should not notify a name update for a new name which is the same than the actual', function() {
      /// given
      var io = Mocks.io('nameChanged');
      var MockUser = new Mocks.MockUserFactory(true, true);
      var MockedUserModule = injectr('../lib/modules/usermodule.js',{
        '../model/User.js': MockUser
      });
      var instance = new MockedUserModule(io);
      instance.addUser(MockUser.fromIo());
      var data ={
        id: 10,
        name: 'quack' 
      };

      //when
      var result = instance.onNameChange(data);

      //then
      expect(result).to.be.not.ok;
      expect(io.sockets.emitCalled).to.be.not.ok;
    });

    it('should not notify a name update for a not connected user', function() {
      /// given
      var io = Mocks.io('nameChanged');
      var MockUser = new Mocks.MockUserFactory(true, true);
      var MockedUserModule = injectr('../lib/modules/usermodule.js',{
        '../model/User.js': MockUser
      });
      var instance = new MockedUserModule(io);
      var data ={
        id: 10,
        name: 'quack' 
      };
      //when
      var result = instance.onNameChange(data);

      //then
      expect(result).to.be.not.ok;
      expect(io.sockets.emitCalled).to.be.not.ok;
    });
  });

  describe('#onStatusChanged',function() {
    it('blah', function() {

    });

  });
});

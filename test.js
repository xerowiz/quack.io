'use strict';
var expect = require('chai').expect;
var injectr = require('injectr');
var User = require('./lib/model/User.js');
var UserModule = require('./lib/modules/usermodule.js');
var Mocks = require('./mocks/mocks.js');

describe('user', function() {
  describe('#isValid', function() {
    it('should flag as valid user a valid user', function() {
      // given
      var validUser = new User(0, 12, 'robert', 'on');
      // when
      var result = validUser.isValid();
      // then
      expect(result).to.be.ok;
    });

    it('should not flag as valid user a badformated one', function() {
      // given
      var validUser = new User(0, undefined, 'robert', 'on');
      // when
      var result = validUser.isValid();
      // then
      expect(result).to.be.not.ok;
    });

    it('should not flag as valid user an user with bad status ', function() {
      // given
      var validUser = new User(0, 12, 'robert', 'wtf');
      // when
      var result = validUser.isValid();
      // then
      expect(result).to.be.not.ok;
    });
  });
});

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

  describe('#onConnect', function() {
    it('should register and notify a valid user', function() {
      //given
      var io = Mocks.io('co');
      var MockUser = new Mocks.MockUserFactory(true, true);
      var MockedUserModule = injectr('./lib/modules/usermodule.js',{
        '../model/User.js': MockUser
      });
      var socket = {id: 10};
      var data = {name: 'quack'};
      var instance = new MockedUserModule(io);

      //when
      var result = instance.onConnect(socket, data);

      //then
      expect(instance.isConnected(10)).to.be.ok;
      expect(io.sockets.emitCalled).to.be.ok;
      expect(io.sockets.calledWithRightCode).to.be.ok;
    });

    it('should not register and notify an invalid user', function() {
      // given
      var io = Mocks.io('co');
      var MockBadUser = new Mocks.MockUserFactory(false, false);
      var MockedUserModule = injectr('./lib/modules/usermodule.js',{
        '../model/User.js': MockBadUser
      });
      var socket = {id: 10};
      var data = {name: 'quack'};
      var instance = new MockedUserModule(io);

      // when
      var result = instance.onConnect(socket, data);

      // then
      expect(instance.isConnected(10)).to.be.not.ok;
      expect(io.sockets.emitCalled).to.be.not.ok;
    });
  });

  describe('#onDisconnect', function() {
    it('should unregister and notify an existing user', function() {
      ///given
      var io = Mocks.io('dc');
      var MockUser = new Mocks.MockUserFactory(true, true);
      var MockedUserModule = injectr('./lib/modules/usermodule.js',{
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
      var io = Mocks.io('dc');
      var MockUser = Mocks.MockUserFactory(true, true);
      var MockedUserModule = injectr('./lib/modules/usermodule.js',{
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

  describe('#onNameChanged', function() {
    it('should notify a name update for a connected user', function() {
      // given
      var io = Mocks.io('nc');
      var MockUser = new Mocks.MockUserFactory(true, true);
      var MockedUserModule = injectr('./lib/modules/usermodule.js',{
        '../model/User.js': MockUser
      });
      var instance = new MockedUserModule(io);
      instance.addUser(MockUser.fromIo());
      var id = 10;
      var name = 'roger';

      //when
      var result = instance.onNameChanged(id, name);

      //then
      expect(result).to.be.ok;
      expect(io.sockets.emitCalled).to.be.ok;
      expect(io.sockets.calledWithRightCode).to.be.ok;
    });

    it('should not notify a name update for a connected user with a non valid new name', function() {
      /// given
      var io = Mocks.io('nc');
      var MockUser = new Mocks.MockUserFactory(true, false);
      var MockedUserModule = injectr('./lib/modules/usermodule.js',{
        '../model/User.js': MockUser
      });
      var instance = new MockedUserModule(io);
      instance.addUser(MockUser.fromIo());
      var id = 10;
      var name = {payload: 'canard'};

      //when
      var result = instance.onNameChanged(id, name);

      //then
      expect(result).to.be.not.ok;
      expect(io.sockets.emitCalled).to.be.not.ok;
    });

    it('should not notify a name update for a new name which is the same than the actual', function() {
      /// given
      var io = Mocks.io('nc');
      var MockUser = new Mocks.MockUserFactory(true, true);
      var MockedUserModule = injectr('./lib/modules/usermodule.js',{
        '../model/User.js': MockUser
      });
      var instance = new MockedUserModule(io);
      instance.addUser(MockUser.fromIo());
      var id = 10;
      var name = 'quack';

      //when
      var result = instance.onNameChanged(id, name);

      //then
      expect(result).to.be.not.ok;
      expect(io.sockets.emitCalled).to.be.not.ok;
    });

    it('should not notify a name update for a not connected user', function() {
      /// given
      var io = Mocks.io('nc');
      var MockUser = new Mocks.MockUserFactory(true, true);
      var MockedUserModule = injectr('./lib/modules/usermodule.js',{
        '../model/User.js': MockUser
      });
      var instance = new MockedUserModule(io);
      var id = 10;
      var name = 'quack';

      //when
      var result = instance.onNameChanged(id, name);

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

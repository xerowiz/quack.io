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
      var MockUser = Mocks.MockUser;
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
      var MockBadUser = Mocks.MockBadUser;
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
});

'use strict';
var expect = require('chai').expect;
var User = require('./lib/model/User.js');
var UserModule = require('./lib/modules/usermodule.js');
var injectr = require('injectr');

var mockio = {

  expectedCode: '',
  expextedPayload: '',

  emitCalled: false,
  calledWithRightCode: false,
  calledWithRightPayload: false,

  sockets: {
    emit: function(code, data) {
      this.emitCalled = true;
      if(code === this.expectedCode) {
        this.calledWithRightCode= true;
      }
      if(data === this.expectedPayload){
        this.calledWithRightPayload = true;
      }
    }
  }
};

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
      var instance = new UserModule();
      //given
      var id = 0;
      //when
      var result = instance.isConnected(id);
      //then
      expect(result).to.be.not.ok;
    });

    it('should flag as connected a connected user', function() {
      var instance = new UserModule();
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
      var MockUserModule = injectr('./lib/modules/usermodule.js',{
        io:mockio
      });
      var instance = new MockUserModule();
      var user = new User(0, 12, 'canard', 'on');

      //when
      //var result = instance.onConnect()

    });
  });
});

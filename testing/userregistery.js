'use strict';
var expect = require('chai').expect;
var injectr = require('injectr');
var User = require('../lib/model/user.js');
var UserRegistery = require('../lib/modules/userregistery.js');
var Mocks = require('./mocks/mocks.js');
var Result = require('../lib/model/result.js');

describe('userregistery', function() {
  describe('#isIdentified', function() {

    it('should not flag as connected a not connected user', function() {
      var instance = new UserRegistery();
      //given
      var id = 0;
      //when
      var result = instance.isIdentified(id);
      //then
      expect(result).to.be.not.ok;
    });

    it('should flag as connected a connected user', function() {
      var instance = new UserRegistery();

      //given
      var existingUser = new User(0,10,'JC','on');
      instance.users.push(existingUser);

      //when
      var result = instance.isIdentified(existingUser.id);

      //then
      expect(result).to.be.ok;
    });
  });

  describe('#onIdentify', function() {
    it('should register and notify new user', function() {
      //given

      var MockUser = {
        fromIo: function() {
          return {
            id: 10,
            isValid: function() {
              return true;
            }
          };
        }
      };

      var MockedUserRegistery = injectr('../lib/modules/userregistery.js',{
        '../model/user.js': MockUser
      });

      var socket = {id: 10};
      var data = {name: 'quack'};
      var result = null;
      var instance = new MockedUserRegistery();

      //when
      instance.onIdentify(socket, data, function(payload) {
        result = payload;
      });

      //then
      expect(instance.isIdentified(10)).to.be.ok;
      expect(result).to.be.eql(Result.success());
    });

    it('should not register and notify an invalid user', function() {
      // given
      var MockUser = {
        id: 10,
        fromIo: function() {
          return {
            isValid: function() {
              return false;
            }
          };
        }
      };

      var MockedUserRegistery = injectr('../lib/modules/userregistery.js',{
        '../model/user.js': MockUser
      });

      var socket = {id: 10};
      var data = {name: 'quack'};
      var instance = new MockedUserRegistery();
      var result = null;

      // when
      instance.onIdentify(socket, data, function(payload) {
        result = payload;
      });

      // then
      expect(result).to.be.eql(Result.failure(10,{error: 'invalid data'}));
      expect(instance.isIdentified(10)).to.be.not.ok;
    });
  });

  describe('#onDisconnect', function() {
    it('should unregister and notify an existing user', function() {
      // given
      var MockUser = {
        id: 10,
        fromIo: function() {
          return {
            isValid: function() {
              return false;
            }
          };
        }
      };
      var MockedUserRegistery = injectr('../lib/modules/userregistery.js',{
        '../model/User.js': MockUser
      });

      var socket = {id: 10};
      var instance = new MockedUserRegistery();
      var connectedUser = MockUser.fromIo();

      instance.users.push(connectedUser);

      //when
      instance.onDisconnect(socket);

      //then
      expect(instance.isIdentified(10)).to.be.not.ok;
    });

    it('should not unregister and notify a not connected user', function() {
      // given
      var MockUser = Mocks.MockUserFactory(true, true);
      var MockedUserRegistery = injectr('../lib/modules/userregistery.js',{
        '../model/User.js': MockUser
      });
      var socket = {id: 10};
      var instance = new MockedUserRegistery();

      //when
      instance.onDisconnect(socket);

      //then
      expect(instance.isIdentified(10)).to.be.not.ok;
    });
  });

  describe('#onNameChange', function() {
    it('should notify a name update for a connected user', function() {
      // given

      var mockuser = {
        fromio: function() {
          return {
            id: 10,
            isvalid: function() {
              return true;
            },
            validateName: function() {
              return true;
            },
            name: 'joe'
          };
        }
      };

      var userregistery = require('../lib/modules/userregistery.js');

      var instance = new userregistery();

      var result = null;
      var sentevt = null;
      var sentpayload = null;
      var socket = {
        id: 10,
        broadcast: function(evt, payload) {
          sentevt = evt;
          sentpayload = payload;
        }
      };
      var data ={
        name: 'roger'
      };

      var usr = mockuser.fromio();
      instance.users.push(usr);

      //when
      instance.onNameChange(socket, data, function(payload) {
        result = payload;
      });

      //then

      expect(result).to.be.eql(Result.success());
      expect(sentevt).to.be.equal('nameChanged');
      expect(sentpayload).to.be.eql(usr);
    });

    it('should not notify a name update for a connected user with a non valid new name', function() {
      // given

      var MockUser = {
        fromIo: function() {
          return {
            id: 10,
            isValid: function() {
              return true;
            },
            validateName: function() {
              return false;
            },
            name: 'joe'
          };
        }
      };

      var UserRegistery = require('../lib/modules/userregistery.js');

      var instance = new UserRegistery();

      var result = null;
      var sentevt = null;
      var sentpayload = null;
      var socket = {
        id: 10,
        broadcast: function(evt, payload) {
          sentevt = evt;
          sentpayload = payload;
        }
      };
      var data ={
        name: 'roger'
      };

      var usr = MockUser.fromIo();
      instance.users.push(usr);

      //when
      instance.onNameChange(socket, data, function(payload) {
        result = payload;
      });

      //then
      expect(result).to.be.eql(Result.failure(10, {error: 'invalid username'}));
      expect(sentevt).to.be.equal(null);
      expect(sentpayload).to.be.eql(null);
    });

    it('should not notify a name update for a new name which is the same than the actual', function() {
      // given

      var MockUser = {
        fromIo: function() {
          return {
            id: 10,
            isvalid: function() {
              return true;
            },
            validateName: function() {
              return true;
            },
            name: 'joe'
          };
        }
      };

      var UserRegistery = require('../lib/modules/userregistery.js');

      var instance = new UserRegistery();

      var result = null;
      var sentevt = null;
      var sentpayload = null;
      var socket = {
        id: 10,
        broadcast: function(evt, payload) {
          sentevt = evt;
          sentpayload = payload;
        }
      };
      var data ={
        name: 'joe'
      };

      var usr = MockUser.fromIo();
      instance.users.push(usr);

      //when
      instance.onNameChange(socket, data, function(payload) {
        result = payload;
      });

      //then

      expect(result).to.be.eql(Result.failure(10, {error: 'invalid username'}));
      expect(sentevt).to.be.equal(null);
      expect(sentpayload).to.be.eql(null);
    });

    it('should not notify a name update for a not connected user', function() {
      // given

      var MockUser = {
        fromIo: function() {
          return {
            id: 10,
            isValid: function() {
              return true;
            },
            validateName: function() {
              return true;
            },
            name: 'joe'
          };
        }
      };

      var UserRegistery = require('../lib/modules/userregistery.js');

      var instance = new UserRegistery();

      var result = null;
      var sentevt = null;
      var sentpayload = null;
      var socket = {
        id: 10,
        broadcast: function(evt, payload) {
          sentevt = evt;
          sentpayload = payload;
        }
      };
      var data ={
        name: 'joe'
      };


      //when
      instance.onNameChange(socket, data, function(payload) {
        result = payload;
      });

      //then

      expect(result).to.be.eql(Result.failure(10,{error: 'invalid username'}));
      expect(sentevt).to.be.equal(null);
      expect(sentpayload).to.be.eql(null);
    });
  });

  describe('#onStatusChanged',function() {
    it('blah', function() {

    });

  });
});

'use strict';
var expect = require('chai').expect;
var User = require('../lib/model/User.js');

describe('user', function() {
  describe('#isValid', function() {
    it('should flag as valid user a valid user', function() {
      // given
      var validUser = new User('aaaa', 'robert', 'on');
      // when
      var result = validUser.isValid();
      // then
      expect(result).to.be.ok;
    });

    it('should not flag as valid user a badformated one', function() {
      // given
      var validUser = new User(undefined, 'robert', 'on');
      // when
      var result = validUser.isValid();
      // then
      expect(result).to.be.not.ok;
    });

    it('should not flag as valid user an user with bad status ', function() {
      // given
      var validUser = new User('aaaa', 'robert', 'wtf');
      // when
      var result = validUser.isValid();
      // then
      expect(result).to.be.not.ok;
    });
  });
});

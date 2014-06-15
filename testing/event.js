'use strict';
var expect = require('chai').expect;
var Event = require('../lib/model/Event.js');

describe('event', function() {
  describe('#isValid', function() {
    it('should flag as valid a valid event',function () {

      var evt = new Event(10, 'MSG', 'NORMAL', 'DuckDuck');

      var result = evt.isValid();

      expect(result).to.be.ok;
    });
  });

});

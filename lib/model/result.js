'use strict';
var assert = require('assert');

function Result(code, payload) {
  this.code = code;
  this.payload = payload;
}

Result.success = function(payload) {
  return new Result(0, payload);
};

Result.failure = function(code, payload) {
  assert.notEqual(code,0,'0 is a reserved code for successful operations');
  return new Result(code,
                    payload);
};

module.exports = Result;

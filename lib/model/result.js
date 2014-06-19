'use strict';

function Result(status, code, payload) {
  this.status = status;
  this.code = code;
  this.payload = payload;
}

Result.prototype = {

  statuses:['success', 'failure']

};

Result.success = function() {
  return new Result(Result.prototype.statuses[0]);
};

Result.failure = function(code, payload) {
  return new Result(Result.prototype.statuses[1],
                    code,
                    payload);
};

module.exports = Result;

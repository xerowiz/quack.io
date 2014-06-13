'use strict';

function MockIo(code, payload) {
  this.sockets = {
    expectedCode: code,
    expectedPayload: payload,
    emitCalled: false,
    calledWithRightCode: false,
    calledWithRightPayload: false,
    emit: function (code, data) {
      this.emitCalled = true;
      if (code === this.expectedCode) {
        this.calledWithRightCode = true;
      }
      if (data === this.expectedPayload) {
        this.calledWithRightPayload = true;
      }
    }
  };
}

function MockCounter() {
  this.next = function() {
    return 10;
  }
}

exports.io = function (code, payload) {
  return new MockIo(code, payload);
};

exports.counter = function() {
  return new MockCounter();
};

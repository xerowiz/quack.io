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
  };
}

function MockUser(expectedValidResult, expectedValidateNameResult) {
  this.id = 10;
  this.sockId = 10;
  this.name = 'quack';
  this.status = 'on';
  this.isValidResult = expectedValidResult;
  this.validateNameResult = expectedValidateNameResult;
}

MockUser.prototype =  {

  isValid: function() {
    return this.isValidResult;
  },

  validateName: function() {
    return this.validateNameResult;
  }

};

function MockUserFactory(expectedValidResult, expectedValidateNameResult) {
  this.expectedValidResult = expectedValidResult;
  this.expectedValidateNameResult = expectedValidateNameResult;
}

MockUserFactory.prototype = {

  fromIo: function() {
    return new MockUser(this.expectedValidResult, this.expectedValidateNameResult);
  }

};

exports.io = function (code, payload) {
  return new MockIo(code, payload);
};

exports.counter = function() {
  return new MockCounter();
};

exports.MockUserFactory = MockUserFactory;

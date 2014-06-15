'use strict';
var counter = require('./counter.js');
var _ = require('underscore');

function User(id, sockId, name, status) {
  this.id = id;
  this.sockId = sockId;
  this.name = name;
  this.status = status;
}

User.prototype = {

  isValid: function () {
    var result = false;
    // well typeof works for type checking
    // but not instanceof :(.
    // TODO Find why my prototype info is lost here.
    if (this.id !== undefined &&
        typeof this.id === 'number' &&
          this.sockId !== undefined &&
            this.validateName(this.name) &&
             this.validateStatus(this.status)) {
      result = true;
    }
    return result;
  },

  validateName: function(name) {
    if ( name !== undefined &&
          typeof name === 'string' &&
            name.trim().length > 0) {
      return true;
    }
    return false;
  },

  validateStatus: function(status) {
    if(status !== undefined &&
        _.contains(this.statuses, status)) {
      return true;
    }
    return false;
  },

  statuses: ['on', 'aw', 'dnd']
};

User.fromIo = function (socket, data) {
  return new User(counter.next(),
                  socket.id,
                  data.name,
                  User.prototype.statuses[0]);
};

module.exports = User;

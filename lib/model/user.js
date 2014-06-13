'use strict';
var counter = require('./counter.js');

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
      this.name !== undefined &&
      typeof this.name === 'string' &&
      this.name.trim().length > 0 &&
      this.statuses.indexOf(this.status) >= 0) {
      result = true;
    }
    return result;
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

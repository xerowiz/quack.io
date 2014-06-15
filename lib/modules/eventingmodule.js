'use strict';
var Event = require('../model/event.js');

function EventingModule(io, users) {
  this.io = io;
  this.users = users;
}

EventingModule.prototype = {

  onPost: function(data) {
     var event = Event.fromIo(data);
     if(event.isValid() &&
          this.users.isConnected(event.from)) {
        this.io.sockets.notify('event', event);
     }
  }

};

module.exports = EventingModule;

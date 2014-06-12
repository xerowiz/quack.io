'use strict';
var counter = require('./counter.js');

function User(id, sockId, name, status) {
    this.id = id;
    this.sockId = sockId;
    this.name = name;
    this.status = status;
}

User.prototype = {
   
    fromIo: function(sockId, data) {
      return new User(counter.next(),
                      sockId,
                      data.name,
                      this.statuses.online);
    },

    isValid: function() {
      var result = false;
      if(this.id instanceof Number &&
         this.sockId !== undefined &&
         this.name instanceof String &&
         this.name.trim() !== '') {
        result = true; 
      }
      return result; 
    },

    statuses: ['on', 'aw', 'dnd']
};


exports.User = User;

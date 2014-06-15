'use strict';
var _ = require('underscore');

function Event(from, kind, level, payload) {
  this.from = from;
  this.kind = kind;
  this.level = level;
  this.payload = payload;
}

Event.prototype = {
  isValid: function() {
    if(this.from !== undefined &&
        typeof(this.from) === 'number' &&
          _.contains(this.Kinds, this.kind) &&
            _.contains(this.Levels, this.level)) {
      return true;
    }
    return false;
  },

  Kinds: ['MSG'],

  Levels: ['NORMAL','WARN','ALERT','CRITICAL']
};

Event.fromIo = function(data) {
  return new Event(data.from, data.kind, data.level, data.payload);
};

module.exports = Event;

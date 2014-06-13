'use strict';

var count = 0;

exports.next = function() {
  var ret = count;
  count += 1;
  return ret;
};

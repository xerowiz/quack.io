
var count = 0;

exports.next = function() {
  'use strict';
  count += 1;
  return count;
};

var expect = require('chai').expect;
var User = require('./lib/model/User.js');
var injectr = require('injectr');


describe('usermodule', function() {
  describe('#isConnected', function() {

    it('should not flag as connected a not connected user', function() {
      var usermodule = injectr('./lib/modules/usermodule.js', {})();

      //given
      var id = 0;

      //when
      var result = usermodule.isConnected(id);

      //then
      expect(result).to.be.not.ok; 
    });

    it('should flag as connected a connected user', function() {
      //given 
      var existingUser = new User(0,'JC','on');
      var usermodule = injectr('./lib/modules/usermodule.js', {})();

      //when
      var result = usermodule.isConnected(existingUser.id); 

      //then
      expect(result).to.be.ok;
    });
  });
});

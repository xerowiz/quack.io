'use strict';

var io = require('socket.io-client');
var expect = require('chai').expect;

var options ={
  'force new connection': true
};

describe('#identify', function() {

  it('should ack a success when username is valid', function(done) {
    // given
    var payload = { name: 'regis'};

    // when
    var socket = io('http://127.0.0.1:8080', options);
    socket.on('connect', function() {
      socket.emit('identify', payload, function(result) {
        // then
        expect(result).to.be.eql({ status: 'success'});
        socket.disconnect();
        done();
      });
    });
  });

  it('it should ack a failure when username is invalid', function(done) {
    // given
    var payload = 'srouv';

    // when
    var socket = io('http://127.0.0.1:8080', options);
    socket.on('connect', function() {
      socket.emit('identify', payload, function(result) {
        //then
        expect(result).to.be.eql({ status: 'failure', code: 10, payload: { error: 'invalid data' }});
        socket.disconnect();
        done();
      });

    });
  });

});

describe('#join', function() {
  var socket = null;
  var otherSocket = null;

  beforeEach(function(done) {
    socket = io('http://127.0.0.1:8080', options);
    socket.on('connect',function() {
      done();
    });
  });

  afterEach(function(done) {
    socket.on('disconnect',function() {
      done();
    });
    socket.disconnect();
  });

  before(function(done) {
    otherSocket = io('http://127.0.0.1:8080', options);
    otherSocket.on('connect',function() {
      otherSocket.emit('identify', {name: 'testor'}, function(result) {
        otherSocket.emit('join', 'test1', function(result) {
          done();
        });
      });
    });
  });

  after(function(done) {
    otherSocket.on('disconnect',function() {
      done();
    });
    otherSocket.disconnect();
  });

  it('should ack a success for an identified user in an exisiting room', function(done) {
    var roomname = 'test1';
    socket.emit('identify', {name: 'roger'}, function() {

      var roomNotified = false;

      otherSocket.on('userJoined', function() {
        roomNotified = true;
      });

      socket.emit('join', roomname, function(result){
        expect(result).to.be.eql(result);
        expect(roomNotified).to.be.ok;
        done();
      });
    });
  });
});

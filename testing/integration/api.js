'use strict';

var io = require('socket.io-client');
var expect = require('chai').expect;


var serverurl = 'http://' + process.env.QUACKADDR + ':' + process.env.QUACKPORT;
var options ={
  'force new connection': true
};

describe('#identify', function() {

  it('should ack a success when username is valid', function(done) {
    // given
    var payload = {name: 'regis'};

    // when
    var socket = io(serverurl, options);
    socket.on('connect', function() {
      socket.emit('identify', payload, function(result) {
        // then
        expect(result.code).to.be.equal(0);
        expect(result.payload.id).to.be.not.equal(undefined);
        expect(result.payload.name).to.be.equal('regis');
        expect(result.payload.status).to.be.equal('on');
        socket.disconnect();
        done();
      });
    });
  });

  it('it should ack a failure when username is invalid', function(done) {
    // given
    var payload = 'srouv';

    // when
    var socket = io(serverurl, options);
    socket.on('connect', function() {
      socket.emit('identify', payload, function(result) {
        //then
        expect(result).to.be.eql({code: 10, payload: { error: 'invalid data' }});
        socket.disconnect();
        done();
      });

    });
  });

});

describe('#join', function() {
  var socket = null;
  var otherSocket = null;

  before(function(done) {
    socket = io(serverurl, options);
    socket.on('connect',function() {
      done();
    });
  });

  after(function(done) {
    socket.on('disconnect',function() {
      done();
    });
    socket.disconnect();
  });

  before(function(done) {
    otherSocket = io(serverurl, options);
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

  it('should fail to join for an unidentified user', function(done) {
    var roomname = 'test1';

    var roomNotified = false;

    otherSocket.on('userJoined', function() {
      roomNotified = true;
    });

    socket.emit('join', roomname, function(result) {
      expect(result).to.be.eql({code: 11, payload: { error: 'user not identified' }});
      expect(roomNotified).to.be.not.ok;
      done();
    });

  });

  it('should ack a success for an identified user in an exisiting room', function(done) {
    var roomname = 'test1';
    socket.emit('identify', {name: 'roger'}, function() {

      var roomNotified = false;

      otherSocket.on('userJoined', function() {
        roomNotified = true;
      });

      socket.emit('join', roomname, function(result){
        expect(result).to.be.eql({code: 0});
        expect(roomNotified).to.be.ok;
        done();
      });
    });
  });

  it('should fail to join an already joined room', function(done) {
    var roomname = 'test1';
    var roomNotified = false;

    socket.emit('join', roomname, function(result) {

      otherSocket.on('userJoined', function() {
        roomNotified = false;
      });

      socket.emit('join', roomname, function(result) {
        expect(result).to.be.eql({code: 11, payload: {error: 'user already in room'}});
        expect(roomNotified).to.be.not.ok;
        done();
      });
    });
  });
});

describe('#leave', function() {
  var socket = null;
  var otherSocket = null;
  var roomname = 'test1';
  var userid = null;

  before(function(done) {
    socket = io(serverurl, options);
    socket.on('connect',function() {
      done();
    });
  });

  after(function(done) {
    socket.on('disconnect',function() {
      done();
    });
    socket.disconnect();
  });

  before(function(done) {
    otherSocket = io(serverurl, options);
    otherSocket.on('connect',function() {
      otherSocket.emit('identify', {name: 'testor'}, function(result) {
        otherSocket.emit('join', roomname, function(result) {
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

  it('should fail to leave a room with an not identified user', function(done) {
    var roomNotified = false;

    otherSocket.on('userLeft', function() {
      roomNotified = false;
    });

    socket.emit('leave', roomname, function(result){
      expect(result).to.be.eql({code: 11, payload: {error: 'user not identified'}});
      expect(roomNotified).to.be.not.ok;
      done();
    });
  });

  it('should fail to leave a not joined room with an identified user', function(done) {
    socket.emit('identify', {name: 'roger'}, function(result) {

      var roomNotified = false;
      userid = result.payload.id;

      otherSocket.on('userLeft', function() {
        roomNotified = true;
      });

      socket.emit('leave', roomname, function(result){
        expect(result).to.be.eql({code: 11, payload: {error: 'user not in room'}});
        expect(roomNotified).to.be.not.ok;
        done();
      });
    });
  });

  it('should leave a joined room with an identified user', function(done) {
    socket.emit('join', roomname, function(result) {

      var roomNotified = false;

      otherSocket.on('userLeft',function(payload) {
        expect(payload).to.be.equal(userid);
        roomNotified = true;
      });

      socket.emit('leave', roomname, function(result) {
        expect(roomNotified).to.be.ok;
        expect(result).to.be.eql({code: 0});
        done();
      });
    });
  });

});

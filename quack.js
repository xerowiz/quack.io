'use strict';
var express = require('express'),
        app = express(),
        http = require('http').Server(app),
        io = require('socket.io')(http),
        UserRegistery = require('./lib/modules/userregistery.js'),
        RoomService = require('./lib/modules/roomservice.js');

/**
 * App modules
 */
var registery = new UserRegistery();
var roomService = new RoomService(io, registery);

/**
 * Server setup
 */
app.set('ipaddr', process.env.QUACKADDR);
app.set('port', process.env.QUACKPORT);

/**
 * Io events
 */
io.on('connection', function(socket) {

  socket.on('identify', function(data, ack) {
    registery.onIdentify(socket, data, ack);
  });

  socket.on('disconnect', function() {
    roomService.onDisconnect(socket);
    registery.onDisconnect(socket);
  });

  socket.on('nameChange', function(data, ack) {
    registery.onNameChanged(socket, data, ack);
  });

  socket.on('statusChange', function(data, ack) {
    registery.onStatusChanged(socket, data, ack);
  });

  socket.on('join', function(data, ack) {
    roomService.onJoin(socket, data, ack);
  });

  socket.on('leave', function(data, ack) {
    roomService.onLeave(socket, data, ack);
  });

});

http.listen(app.get('port'), app.get('ipaddr'), function(){
  console.log('Server up and running, go to', app.get('ipaddr')+':'+app.get('port'));
});



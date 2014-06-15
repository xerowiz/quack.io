'use strict';
var express = require('express'),
        app = express(),
        http = require('http').createServer(app),
        io = require('socket.io').listen(http),
        UserModule = require('./lib/modules/usermodule.js'),
        EventingModule = require('./lib/modules/eventingmodule.js');

/**
 * App modules
 */
var usermodule = new UserModule(io);
var eventing = new EventingModule(io, usermodule);

/**
 * Server setup
 */
app.set('ipaddr', process.env.MEOWADDR);
app.set('port', process.env.MEOWPORT);

/**
 * Io events
 */
io.on('connection', function(socket) {

  socket.on('join', function(data) {
    usermodule.onJoin(socket, data);
  });

  socket.on('leave', function(data) {
    usermodule.onLeave(data);
  });

  socket.on('disconnect', function() {
    usermodule.onDisconnect(socket);
  });

  socket.on('nameChange', function(data) {
    usermodule.onNameChanged(data);
  });

  socket.on('statusChange', function(data) {
    usermodule.onStatusChanged(data);
  });

  socket.on('post', function(data) {
    eventing.onPost(data);
  });

});

http.listen(app.get('port'), app.get('ipaddr'), function(){
  console.log('Server up and running, go to', app.get('ipaddr')+':'+app.get('port'));
});



'use strict';
var express = require('express'),
        app = express(),
        http = require('http').Server(app),
        io = require('socket.io')(http),
        UserRegistery = require('./lib/modules/userregistery.js');

/**
 * App modules
 */
var registery = new UserRegistery();

/**
 * Server setup
 */
app.set('ipaddr', process.env.DUCKADDR);
app.set('port', process.env.DUCKPORT);

/**
 * Io events
 */
io.on('connection', function(socket) {

  socket.on('identify', function(data) {
    registery.onIdentify(socket, data);
  });

  socket.on('disconnect', function() {
    registery.onDisconnect(socket);
  });

  socket.on('nameChange', function(data) {
    registery.onNameChanged(socket, data);
  });

  socket.on('statusChange', function(data) {
    registery.onStatusChanged(socket, data);
  });

});

http.listen(app.get('port'), app.get('ipaddr'), function(){
  console.log('Server up and running, go to', app.get('ipaddr')+':'+app.get('port'));
});



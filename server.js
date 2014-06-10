var express = require('express'),
        app = express(),
        bodyParser = require('body-parser'),
        http = require('http').createServer(app),
        io = require('socket.io').listen(http),
        _ = require('underscore');

/**
 * Server setup
 */
app.set('ipaddr', process.env.SERVERADDR);
app.set('port', process.env.SERVERPORT);

app.use(bodyParser());


/**
 * Server context
 */

// Users
// - SessionId (id)
// - User Name (name)
var users = [];

/**
 * Server API
 */
app.get('/', function(request, response) {
  response.send(200, {message: 'Express is cool'});
});

app.post('/message', function(req, response) {
  var message = req.body.message;
  if(_.isUndefined(message) || _.isEmpty(message.trim())) {
    return response.json(400, {error: 'Message invalid'}); 
  }

  // Find user name
  var user = req.body.user;
  if(_.isUndefined(user) || _.isEmpty(user.trim())) {
    return response.json(400, {error: 'Invalid username'});
  }

  io.socket.emit('incoming message', {message: message, name: name});

  return response.json(200, {message: 'Message Received'});
});

http.listen(app.get('port'), app.get('ipaddr'), function(){
  console.log('Server up and running, go to', app.get('ipaddr')+':'+app.get('port'));
});

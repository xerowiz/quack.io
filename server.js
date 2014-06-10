var express = require('express'),
        app = express(),
        http = require('http').createServer(app);

app.set('ipaddr', process.env.SERVERADDR);
app.set('port', process.env.SERVERPORT);

app.get('/', function(request, response) {
    response.send('Server Up and Running');
});

http.listen(app.get('port'), app.get('ipaddr'), function(){
  console.log('Server up and running, go to :', app.get('ipaddr'), ':', app.get('port'));
});

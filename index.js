var env = process.env.NODE_ENV || 'production'
var express = require('express')
var app = require('express')();
var bodyParser = require('body-parser');
var fs = require('fs');

var privateKey = fs.readFileSync(__dirname +'/key.pem','utf8');
var certificate = fs.readFileSync(__dirname + '/cert.pem','utf8');
var ca = fs.readFileSync(__dirname + '/chain.pem','utf8');
var optionsss = {
	key: privateKey,
	cert: certificate,
	ca: ca
};

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({
  extended: true
})); // for parsing application/x-www-form-urlencoded
app.use(express.static('./dist'))

// logging
app.use(function(req, res, next) {
  console.log('path: ' + req.path)
  console.log('query:')
  console.log(req.query)
  console.log('body:')
  console.log(req.body)
  console.log('----------------------------')
  next()
})

var pTimeout = env === 'production' ? 60000 : 10000
var pInterval = env === 'production' ? 25000 : 10000
//var server = require('https').createServer(optionsss,app);
var server = require('http').Server(app);
var io = require('socket.io')(server, {
  'pingTimeout': pTimeout,
  'pingInterval': pInterval
});

var port = process.env.PORT || 3210

var routes = require('./routes')
routes(app, io)

var socketHandler = require('./socket/handler')

io.on('connect', function(socket) {
  socketHandler(io, socket)
})

server.listen(port, function() {
  console.log('App listening on port ' + port + '!')
})

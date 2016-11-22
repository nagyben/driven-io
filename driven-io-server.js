var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var dateFormat = require("dateformat");
var dgram = require('dgram');
var server = dgram.createSocket('udp4');
//var timer = require('timer');

var HOST = '0.0.0.0';
var UDP_PORT = 8081;
var WEB_PORT = 8585;

var PASSWORD = "rockinghamfinal";

var REPORT_TIMEOUT = 60; // seconds

var sockets = [];

// ============================
// ROOM LOGIC
var rooms = {};

setInterval(function() {
	var curtime = new Date();
	for (var key in rooms) {
		var delta = curtime.getTime() - rooms[key].time.getTime();
		if (delta > REPORT_TIMEOUT * 1000) {
			console.log('No data from ' + key + ' in last ' + REPORT_TIMEOUT + 's. Deleting from room list...');
			delete rooms[key];
		}
	}
}, 5000);

// ============================
// CONFIG

// serve files from /static
app.use(express.static('static'));

app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

// ============================
// ROUTES

app.get('/', function(req, res) {
	res.sendFile('/static/parts/index.html', {
		"root": __dirname
	})
});

app.get('/api/rooms', function(req, res) {
	res.send(JSON.stringify(rooms));
});

// ============================
// FUNCTIONS
function sendClientInfo() {
	io.emit('clientinfo', JSON.stringify(clientinfo));
}


// listen on the web page port
http.listen(WEB_PORT, function() {
	console.log('listening on ' + HOST + WEB_PORT);
});

// catch any exceptions so it doesn't crash
process.on('uncaughtException', function(err) {
	console.log('Caught exception:');
	console.log(err);
});

// when a client connects with io();
io.on('connection', function(socket) {
	console.log('a user connected');

	// when a client disconnects
	socket.on('disconnect', function() {
		console.log('user disconnected');
	});

	socket.on('subscribe', function(room, remote) {
		console.log('[' + dateFormat(new Date(), 'dd mmm yyyy HH:MM:ss') + '] ' + remote + ' - JOINING ROOM: ' + room);
		socket.join(room);
// 		rooms[room].viewers++;
		console.log(rooms);
	});

	socket.on('unsubscribe', function(room, remote) {
		if (room != null) {
			console.log('[' + dateFormat(new Date(), 'dd mmm yyyy HH:MM:ss') + '] ' + remote + ' - LEAVING ROOM: ' + room);
			socket.leave(room);
// 			rooms[room].viewers--;
			console.log(rooms);
		}
	});
});

// when the UDP server is listening on port 8081
server.on('listening', function() {
	var address = server.address();
	console.log('UDP Server listening on ' + address.address + ":" + address.port);
});

// when the UDP server receives a message on port 8081
server.on('message', function(message, remote) {
	console.log('[' + dateFormat(new Date(), 'dd mmm yyyy HH:MM:ss') + '] ' + remote.address + ':' + remote.port + ' - ' + message + ' - ' + rooms);
	var data = JSON.parse(message);
	if (data.p == PASSWORD) {
		if (data.n !== "") {
			if (data.n in rooms) {
				rooms[data.n].time = new Date();
			} else {
				var obj = {
					time: new Date(),
					viewers: 0
				};
				rooms[data.n] = obj;
			}
			io.sockets.in(data.n).emit('telemetry', message);
		}
	}
});

// bind the UDP server to the host and port
server.bind(UDP_PORT, HOST);
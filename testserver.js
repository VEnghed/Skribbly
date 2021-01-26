const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const io = require("socket.io");
const https = require('https')
const fs = require('fs')

//dropping sessionstore as it interferes with websockets.

const app = express();

let rooms = {};

const sessionMiddleware = session({
	secret: "keyboard-cat",
	resave: true,
	saveUninitialized: true,
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(sessionMiddleware);

app.use(express.static("public"));

app.get("/", (req, res) => {
	res.sendFile(__dirname + "/routes/welcome/index.html");
});

app.get("/game", (req, res) => {
	//we should use ESJ here instead of serving a static file.
	res.sendFile(__dirname + "/routes/game/index.html");
});

app.post("/login", (req, res) => {
	req.session.name = req.body.name;
	req.session.room = req.body.room;
	console.log(req.session.name + " joined " + req.session.room);
	res.redirect("/game");
});

const secureServer = https.createServer({
	key: fs.readFileSync('./ssl/server.key'),
	cert: fs.readFileSync('./ssl/server.cert')
}, app)



server = secureServer.listen(1337, () => console.log("listening on 1337"))
var ws = io(server)


//my own middleware to expose the request, lets us access session data in ws
ws.use((socket, next) => {
	sessionMiddleware(socket.request, {}, next)
});

ws.on("connection", (socket) => {
	if (socket.request.session.name == '') return;

	let name = socket.request.session.name
	let room = socket.request.session.room

	console.log(name + ' connected')

	socket.join(room)

	if (!rooms[room]) {
		console.log("Created room " + room)
		rooms[room] = { players: {}, drawing: [], messages: [] }
	}
	rooms[room].players[name] = { points: 0 }
	socket.on("sketch", (data) => {
		socket.to(room).emit("stroke", data);
		rooms[room].drawing.push({ x: data.x, y: data.y });
	})

	// Player sends message, broadcast to room.
	socket.on("sendmsg", (msg) => {
		ws.in(room).emit("recvmsg", { sender: name, msg: msg.msg });

	});

	// When a player disconnects.
	socket.on("disconnect", () => {
		console.log(name + ' has disconnected')
		delete rooms[room].players[name];

		ws.in(room).emit('newConnection', Object.keys(rooms[room].players));
	})

	// A player clears the canvas.
	socket.on('clear', () => {
		rooms[room].drawing = []
		ws.in(room).emit('clear')
	})

	// When someone connects, we tell all in the room.
	setTimeout(() => {
		ws.in(room).emit('newConnection', { players: Object.keys(rooms[room].players), drawing: rooms[room].drawing });
	}, 50);



});

function ObjectLength(object) {
	var length = 0;
	for (var key in object) {
		if (object.hasOwnProperty(key)) {
			++length;
		}
	}
	return length;
}

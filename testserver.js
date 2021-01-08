const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const io = require("socket.io");

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

let server = app.listen(1337, () => console.log("listening..."));

var ws = io(server);

//my own middleware to expose the request, lets us access session data in ws
ws.use((socket, next) => {
	sessionMiddleware(socket.request, {}, next);
});

ws.on("connection", (socket) => {
	let name = socket.request.session.name;
	let room = socket.request.session.room;

	console.log(name + " connected");

	socket.join(room);

	if (!rooms[room]) {
		console.log("Created room " + room);
		rooms[room] = { players: {} };
	}
	rooms[room].players[name] = { points: 0 };

	console.log(rooms);

	socket.on("sketch", (data) => {
		socket.to(room).emit("stroke", data);
	});

	socket.on("sendmsg", (msg) => {
		ws.in(room).emit("recvmsg", { sender: name, msg: msg.msg });
	});

	// When a player disconnects.
	socket.on("disconnect", () => {
		console.log(name + " has disconnected");
		delete rooms[room].players[name];

		ws.in(room).emit("newConnection", Object.keys(rooms[room].players));
		// if no players are present in the room -> delete room
		if (ObjectLength(rooms[room].players) === 0) {
			console.log("Deleting " + rooms[room] + "...");
			delete rooms[room];
		}
		console.log("\t", rooms);
	});

	// When someone connects, we tell all in the room.
	ws.in(room).emit("newConnection", Object.keys(rooms[room].players));

	console.log(rooms);
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

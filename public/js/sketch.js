var prevX = -1
var prevY = -1
let inputField
let chatButton
let chatWindow


function setup() {
	let canvas = createCanvas(600, 400);
	canvas.parent('sketch-wrapper')
	background(0)
	noStroke()

	inputField = document.getElementById('sendField')
	chatButton = document.getElementById('sendButton')
	chatWindow = document.getElementById('chat')
	clearButton = document.getElementById('clearButton')
	chatButton.onclick = () => {
		sendMessage(inputField.value);
		inputField.value = ''
	}

	clearButton.onclick = () => {
		socket.emit('clear')
	}

	socket.on('stroke', data => {
		ellipse(data.x, data.y, 15, 15)
	})

	socket.on('newConnection', updatePlayers)

	socket.on("recvmsg", (msg) => {
		console.log(msg.sender + ": " + msg.msg);
		chatWindow.innerHTML += "<p>" + msg.sender + ": " + msg.msg + "</p>"
	});

	socket.on('clear', () => {
		background(0);
	})

	socket.on('getChatHistory', messages => {
		messages.forEach(msg => {
			chatWindow.innerHTML += "<p>" + msg.sender + ": " + msg.msg + "</p>"
		})
	})
}

function draw() {
	let x = Math.floor(mouseX);
	let y = Math.floor(mouseY);

	if (mouseIsPressed && x >= 0 && y >= 0 && x <= 600 && y <= 400)
		if (prevX != x || prevY != y) {
			prevX = x;
			prevY = y;
			ellipse(x, y, 15, 15);
			sendStroke(x, y);
		}
}

function sendStroke(x, y) {
	socket.emit("sketch", { x: x, y: y });
}

function updatePlayers(data) {
	let leftColumn = document.getElementById("left")
	leftColumn.innerHTML = "Online:";
	data.players.forEach(element => {
		leftColumn.innerHTML += "<p>" + element + "</p>"
	});
	data.drawing.forEach(point => ellipse(point.x, point.y, 15, 15))
}

function sendMessage(msg) {
	socket.emit("sendmsg", { msg: msg });
	console.log("sending message: " + msg);
}
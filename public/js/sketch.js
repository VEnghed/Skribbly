var prevX = -1;
var prevY = -1;
var body;
var chatInputField;
var chatSendButton;
var chatBox;
var drawLine = false;

function setup() {
	let canvas = createCanvas(600, 400);
	canvas.parent("sketch-wrapper");
	background(0);
	let c = color(255, 255, 255);
	fill(c);
	noStroke();

	body = document.getElementById("gamebody");
	chatInputField = document.getElementById("chat-input-field");
	chatSendButton = document.getElementById("chat-send-btn");
	chatBox = document.getElementById("chat-box");

	chatBox.addEventListener("DOMSubtreeModified", () => {
		chatBox.scrollTop = chatBox.scrollHeight;
	});

	chatSendButton.onclick = () => {
		sendMessage(chatInputField.value);
		chatInputField.value = "";
	};

	body.addEventListener("mouseup", () => {
		console.log("mouseup");
		drawLine = false;
	});

	socket.on("stroke", (data) => {
		console.log(data);
		if (data.drawLine) {
			line(data.lineStartX, data.lineStartY, data.x, data.y);
		}
		line(data.x, data.y, data.x, data.y);
	});

	socket.on("newConnection", updatePlayers);

	socket.on("recvmsg", (msg) => {
		console.log(msg.sender + ": " + msg.msg);
		chatBox.innerHTML += "<p><b>" + msg.sender + ":</b> " + msg.msg + "</p>";
	});
}

function draw() {
	let x = Math.floor(mouseX);
	let y = Math.floor(mouseY);

	if (mouseIsPressed && x >= 0 && y >= 0 && x <= 600 && y <= 400) {
		if (prevX != x || prevY != y) {
			stroke(255); // White
			strokeWeight(10); // Line width

			if (drawLine) {
				line(prevX, prevY, x, y);
			}

			line(x, y, x, y); // Ellipse does not support being "filled", line is by default filled
			sendStroke(x, y, drawLine, prevX, prevY);

			prevX = x;
			prevY = y;
			drawLine = true;
		}
	}
}

function sendStroke(x, y) {
	socket.emit("sketch", {
		x: x,
		y: y,
		drawLine: drawLine,
		lineStartX: prevX,
		lineStartY: prevY,
	});
}

function updatePlayers(data) {
	let userListColumn = document.getElementById("userlist");
	userListColumn.innerHTML = "<p>Users in room:</p>";
	data.forEach((element) => {
		userListColumn.innerHTML += "<p>" + element + "</p>";
	});
}

// Key listener
function keyPressed() {
	if (keyCode === ENTER) {
		sendMessage(chatInputField.value);
		chatInputField.value = "";
	}
}

function sendMessage(msg) {
	socket.emit("sendmsg", { msg: msg });
	console.log("sending message: " + msg);
}

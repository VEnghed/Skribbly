var prevX = -1;
var prevY = -1;
var chatSendField;
var chatSendButton;
var chatBox;

function setup() {
	let canvas = createCanvas(600, 400);
	canvas.parent("sketch-wrapper");
	background(0);
	noStroke();

	chatSendField = document.getElementById("chatSendField");
	chatSendButton = document.getElementById("chatSendButton");
  chatBox = document.getElementById("chat-box");

  chatBox.addEventListener("DOMSubtreeModified", () => {
    chatBox.scrollTop = chatBox.scrollHeight;
  });
  
	chatSendButton.onclick = () => {
		sendMessage(chatSendField.value);
		chatSendField.value = "";
	};

	socket.on("stroke", (data) => {
		ellipse(data.x, data.y, 15, 15);
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
	let userListColumn = document.getElementById("userlist");
	userListColumn.innerHTML = "<p>Users in room:</p>";
	data.forEach((element) => {
		userListColumn.innerHTML += "<p>" + element + "</p>";
	});
}

// Key listener
function keyPressed() {
	if (keyCode === ENTER) {
		sendMessage(chatSendField.value);
		chatSendField.value = "";
	}
}

function sendMessage(msg) {
	socket.emit("sendmsg", { msg: msg });
	console.log("sending message: " + msg);
}


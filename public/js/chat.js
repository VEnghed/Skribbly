var socket;
var inputField;

function setup() {
	socket = io.connect("http://localhost:1337");

	inputField = createInput("");
	inputField.id("chat-inputfield");
	inputField.parent("chat-wrapper");

	//inputField.input(inputEvent);

	socket.on("recvmsg", (msg) => {
		console.log("someone sent: " + msg.msg);
	});
}

function keyPressed() {
	if (keyCode === ENTER) {
		let inputFieldByID = document.getElementById("chat-inputfield");
		sendMessage(inputFieldByID.value);
		inputFieldByID.value = "";
	}
}

function sendMessage(msg) {
	socket.emit("sendmsg", { msg: msg });
	console.log("sending message: " + msg);
}

function inputEvent() {
	console.log("you are typingXD: ", this.value());
}


function setupChat() {
	//inputField.input(inputEvent);
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

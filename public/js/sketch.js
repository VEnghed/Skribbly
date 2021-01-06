var socket;
var prevX = -1;
var prevY = -1;

function setup() {
	socket = io.connect("http://localhost:1337");

	let canvas = createCanvas(600, 400);
	canvas.parent("sketch-wrapper");
	background(0);
	noStroke();

	socket.on("stroke", (data) => {
		ellipse(data.x, data.y, 15, 15);
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
			send(x, y);
		}
}

function send(x, y) {
	socket.emit("message", { x: x, y: y });
	console.log("sending");
}

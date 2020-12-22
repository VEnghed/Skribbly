console.log('hello, client.')

var socket

function setup() {
  
  socket = io.connect('http://localhost:1337')

  socket.on('hey', () => console.log('connected'))
  
  let canvas = createCanvas(600, 400);
  canvas.parent('sketch-wrapper')
  background(0)
  noStroke()

  
  
  var button1 = document.getElementById('b1')
  button1.onclick = send


}

function draw() {
  let x = Math.floor(mouseX)
  let y = Math.floor(mouseY)

  if (mouseIsPressed) {
    ellipse(x, y, 15, 15)
    send(x, y)
  }
}

function send(x, y) {
  socket.emit('message', {x: x, y: y})
  console.log('sending')
}



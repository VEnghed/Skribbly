const express = require('express');
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const session = require('express-session')
var FileStore = require('session-file-store')(session)
const io = require('socket.io');
const sharedsession = require('express-socket.io-session')


const app = express();

var sessions = {}

var sessconf = session({
    store: new FileStore({}),
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
})

// middleware
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(sessconf)


// static content
app.use(express.static("public"))


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/routes/welcome/index.html')
})

app.get('/game', (req, res) => {
    res.sendFile(__dirname + '/routes/game/index.html')
})

app.post('/login', (req, res) => {
    console.log('(POST) Login: ' + req.body.name + ' into room ' + req.body.room + '.')


    console.log('setting the session name for this one')
    req.session.name = req.body.name;
    req.session.room = req.body.room;

    res.redirect('/game')
})

let server = app.listen(1337, () => console.log('listening...'))

var ws = io(server)

ws.use((socket, next) => {
    sessconf(socket.request, {}, next)
})

ws.on('connection', socket => {

    console.log('session from socket.io', socket.request.session.name)

    socket.emit('init', {})
    socket.on('message', data => console.log(data))

    socket.on('disconnect', () => {
        console.log(socket.request.session.name)
    })
})

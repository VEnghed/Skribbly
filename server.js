const express = require('express');
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const session = require('express-session')
var FileStore = require('session-file-store')(session)
const io = require('socket.io')

const app = express();

// middleware
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(session({
    store: new FileStore({}),
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}))

// static content
app.use(express.static("public"))


app.get('/', (req, res) => {

    if (req.session.number) {
        req.session.number++
        res.send('views: ' + req.session.number)
    } else {
        req.session.number = 1
        res.send('yo :P')
    }

    //res.sendFile(__dirname + '/routes/welcome/index.html')
})

app.get('/game', (req, res) => {
    res.sendFile(__dirname + '/routes/game/index.html')
})

app.post('/login', (req, res) => {
    console.log('(POST) Login: ' + req.body.name + ' into room ' + req.body.room + '.')

    if (req.cookies.name) {
        console.log('\t', req.cookies)
    } else {
        res.cookie('name', req.body.name)
    }

    res.redirect('/game')
})

let server = app.listen(1337, () => console.log('listening...'))

var ws = io(server)

ws.on('connection', socket => {
    //console.log(socket.handshake.headers.cookie)
    //socket.emit('hey', {})
    //socket.on('message', data => console.log(data))
    //socket.on('disconnect', () => console.log('disconnected.'))
})

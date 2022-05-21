const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const {v4: uuidV4} = require('uuid')


app.set('view engine', 'ejs') 
app.use(express.static('public'))


app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`)
});

app.get('/:room', (req, res) => {
    res.render('room', {roomId: req.params.room})
})

io.on('connection', socket => {
    // When someone attempts to join the room
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId)  // Join the room
        socket.broadcast.emit('user-connected', userId) // Tell everyone else in the room that we joined
        
        // Communicate the disconnection
        socket.on('disconnect', () => {
            socket.broadcast.emit('user-disconnected', userId)
        })
    })
})

server.listen(6123, () => {
  console.log('listening on port:6123');
});
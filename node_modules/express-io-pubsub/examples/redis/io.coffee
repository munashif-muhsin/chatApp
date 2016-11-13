express = require 'express'
http    = require 'http'
io      = require 'socket.io'
pubsub  = require '../../lib/express-io-pubsub'

app = express()
server = http.createServer app
io = io.listen server

app.get '/', (req, res) ->
  res.send '
    <script src="/socket.io/socket.io.js"></script>
    <script>
      var socket = io.connect("http://localhost:3001");
      socket.on("connect", function(data) {
        socket.emit("join room", "lobby");
        socket.on("update", function (data) {
          var p = document.createElement("p");
          var t = document.createTextNode(data.msg);
          p.appendChild(t);
          document.body.appendChild(p);
        });
      });
    </script>
    <body><p>waiting for messages</p></body>
  '

io.sockets.on 'connection', (socket) ->
  socket.on 'join room', (room) ->
    socket.join room

pubsub.listen io.sockets, {
  channel: 'pubsub'
  host: 'localhost'
  port: 6379
  type: 'redis'
}

server.listen 3001

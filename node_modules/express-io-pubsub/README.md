# Express to Socket.io PubSub

## Features
 * Allows an Express server to publish messages to a subscribed Socket.io server
 * Shared data storage can use MongoDB (capped collection tailable cursors) or Redis (pubsub)
 * Servers can be completely independent. They just need to be able to connect to the data store

## Description
Express server connects to either a MongoDB capped collection or publishes to a Redis channel.
This is accomplished through simple middleware making request.publish(room, event, data) available

Socket.io server connects to the same collection or subscribes to a Redis channel.  This is done 
through a listen command, and then the client can join the room/channel to listen to.

## Usage
### Socket.io
```
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
  collection: 'events'
  database: 'test'
  host: 'localhost'
  port: 27017
  type: 'mongodb'
}

server.listen 3001
```

### Express
```
express = require 'express'
pubsub  = require '../../lib/express-io-pubsub'

app = express()

app.configure () ->
  app.use pubsub.middleware {
    collection: 'events'
    database: 'test'
    host: 'localhost'
    port: 27017
    type: 'mongodb'
  }
app.get '/', (req, res) ->
  req.publish "lobby", "update", {msg: 'Hello World!'}
  res.send "message sent"

app.listen 3002
```

## LICENSE
```
Copyright (c) 2012 Bryant Williams <b.n.williams@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```


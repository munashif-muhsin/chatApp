var express = require('express');
var path = require('path');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');

app.use(express.static(__dirname + '/views'));
app.use(express.static(__dirname + '/scripts'));



mongoose.connect("mongodb://127.0.0.1:27017");

app.get('/', function(req, res){
  res.sendFile("/index.html");
});

//Chat Schema
var ChatSchema = mongoose.Schema({
  created: Date,
  message: String,
  sentBy: String,
  room: String
});

//chat model
var Chat = mongoose.model('Chat', ChatSchema);


//access control
app.all('*', function(req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET,POST');
});




io.on('connection', function(socket){
  console.log('a user connected');

  socket.on('join room', function(data) {
    socket.join(data.room);
    socket.broadcast.to(data.room).emit('user joined', data);
    socket.username = data.name;
    socket.room = data.room;
  });

  socket.on('chat message', function(data){
     var newMsg = new Chat({
        created: data.date,
        message: data.text,
        sentBy: data.sentBy,
        room: data.room
      });
      //Save it to database
     newMsg.save(function(err, msg){
        //Send message to those connected in the room
        console.log("message recieved: "+ JSON.stringify(data));
        socket.broadcast.to(msg.room).emit('chat message', data);
     });

  });

  socket.on('disconnect', function(){
    console.log('user disconnected');
    var data = {
        left: socket.username
    }
    socket.to(socket.room).emit('user left', data);
    console.log("user left: "+socket.username);
  });
});






http.listen(3000, function(){
  console.log('listening on *:3000');
});

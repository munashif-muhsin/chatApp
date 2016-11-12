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

//access control, CORS
app.all('*', function(req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET,POST');
});


io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

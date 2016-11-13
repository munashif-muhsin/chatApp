var myApp = angular.module('chatAPP', ['ngRoute']);

//Route config
myApp.config(function($routeProvider) {
  $routeProvider

  // route for the home page
    .when('/', {
    templateUrl: 'login.html',
    controller: 'loginCtrl'
  })

  // route for the chat page
  .when('/room', {
    templateUrl: 'room.html',
    controller: 'roomCtrl'
  });
});

//Login Page Controller
myApp.controller('loginCtrl', ['$scope', '$location', 'loginService', function($scope, $location, loginService) {
  console.log("Hello World from controller");
  $scope.login = function(data) {
    if (data.username != "" && data.room != "") {
      loginService.update(data.username, data.room);
      $location.path('/room');
    }
  }
}]);

//Chat Page Controller
myApp.controller('roomCtrl', ['$scope', 'loginService', '$location', '$anchorScroll', function($scope, loginService, $location, $anchorScroll) {
  console.log("Hello World from controller");
  loginService.init();
  var data = loginService.get();
  document.body.style.background = '#000';

  $scope.chatText = [];
  console.log("name: " + data.name);
  console.log("room: " + data.room);
  $scope.roomName = data.room;


  angular.element(document).ready(function() {
    socket.emit("join room", data);
  });


  socket.on('chat history', function(chatdata) {
    for (var i = 0; i < chatdata.length; i++) {
      if (chatdata[i].sentBy == data.name)
        chatdata[i].sentBy = "me";
      $scope.chatText.push(chatdata[i]);
    }
    console.log("chat text: " + JSON.stringify($scope.chatText));
    $scope.$apply();
    $("#chatDiv").scrollTop($("#chatDiv").children().height());

  });

  socket.on('user joined', function(msg) {
    console.log("joined room: " + JSON.stringify(msg));
    $scope.chatText.push(msg);
    $scope.$apply();
    $("#chatDiv").scrollTop($("#chatDiv").children().height());

  });

  socket.on('user left', function(msg) {
    console.log("left room: " + JSON.stringify(msg));
    $scope.chatText.push(msg);
    $scope.$apply();
    $("#chatDiv").scrollTop($("#chatDiv").children().height());

  });

  socket.on('chat message', function(msg) {
    console.log("message recieved: " + JSON.stringify(msg));
    $scope.chatText.push(msg);
    $scope.$apply();
    $("#chatDiv").scrollTop($("#chatDiv").children().height());

  });



  $scope.sendMessage = function(message) {
    if ($scope.txt != "") {
      var messageObj = {
        sentBy: data.name,
        room: data.room,
        message: message,
        date: Date()
      };
      socket.emit('chat message', messageObj);
      $scope.txt = "";
      messageObj.sentBy = "me";
      $scope.chatText.push(messageObj);
      //$("#chatDiv").scrollTop($("#chatDiv").children().height());
      $('#chatDiv').animate({
        "scrollTop": $('#chatDiv')[0].scrollHeight
      }, "fast");


    }

  }



}]);

//loginService
myApp.factory('loginService', function() {

  var data = {};

  return {
    get: function() {
      return data
    },
    update: function(name, room) {
      data.name = name;
      data.room = room;
      sessionStorage["loginService"] = JSON.stringify(data);
    },

    init: function() {
      var temp = JSON.parse(sessionStorage["loginService"]);
      data.name = temp.name;
      data.room = temp.room;
    }
  };
});

//socket service
/*
myApp.factory('socket', ['$rootScope', function($rootScope) {
  var socket = io.connect();

  return {
    on: function(eventName, callback){
      socket.on(eventName, callback);
    },
    emit: function(eventName, data) {
      socket.emit(eventName, data);
    }
  };
}]);
*/

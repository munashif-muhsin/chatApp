

var myApp = angular.module('chatAPP', ['ngRoute']);

myApp.config(function($routeProvider) {
        $routeProvider

            // route for the home page
            .when('/', {
                templateUrl : 'login.html',
                controller  : 'loginCtrl'
            })

            // route for the contact page
            .when('/room', {
                templateUrl : 'room.html',
                controller  : 'roomCtrl'
            });
    });

//Login Page Controller
myApp.controller('loginCtrl', ['$scope','$location', function ($scope,$location) {
    console.log("Hello World from controller");
    $scope.login = function(data){
        console.log("name: "+data.username);
        console.log("room: "+data.room);
        $location.path('/room');
    }

}]);

//Chat Page Controller
myApp.controller('roomCtrl', ['$scope', function ($scope) {
    console.log("Hello World from controller");
    $scope.login = function(data){
        console.log("name: "+data.username);
        console.log("room: "+data.room);
    }

}]);

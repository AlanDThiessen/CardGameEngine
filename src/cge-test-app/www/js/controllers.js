angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope) {
})

/*
.controller('PlaylistCtrl', function($scope) {
  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
})


.controller('PlaylistCtrl', function($scope, $stateParams) {
*/

.controller('TestsCtrl', function($scope) {
  $scope.tests = [
    { title: 'Register User', id: 1 },
    { title: 'Login', id: 2 },
    { title: 'Get Games', id: 3 }
  ];
})

.controller('TestsCtrl', function($scope, $stateParams) {
})

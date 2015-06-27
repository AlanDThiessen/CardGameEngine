
var configCtrl = angular.module('config_controller', []);

configCtrl.controller('ConfigCtrl', ['$scope', '$window', 'cge.utils.Config', 'cge.utils.Logger', function($scope, $window, config, log) {
   $scope.userName = config.GetUserName();
   $scope.password = config.GetPassword();
   $scope.logToConsole = config.GetLogToConsole();
   $scope.logToFile = config.GetLogToFile();
   $scope.logMask = {};
   $scope.logMask.value = config.GetLogMask();
   $scope.logMask.debug = (($scope.logMask.value & log.DEBUG) == log.DEBUG);
   $scope.logMask.info  = (($scope.logMask.value & log.INFO ) == log.INFO );
   $scope.logMask.warn  = (($scope.logMask.value & log.WARN ) == log.WARN );
   $scope.logMask.error = (($scope.logMask.value & log.ERROR) == log.ERROR);

   // Server settings will be local to $scope app, so no need to call config
   $scope.server = {};
   if($window.localStorage.serverProtocol) {
      $scope.server.protocol = $window.localStorage.serverProtocol;
   }
   else {
      $scope.server.protocol = 'https';
   }

   if($window.localStorage.serverHost) {
      $scope.server.host = $window.localStorage.serverHost;
   }
   else {
      $scope.server.host = 'gator4021.hostgator.com';
   }

   if($window.localStorage.serverPath) {
      $scope.server.path = $window.localStorage.serverPath;
   }
   else {
      $scope.server.path = '/~thiessea/TheThiessens.net/cge/cge.php';
   }

   // Update the logger with what we read out of configuration.
   log.SetLogToConsole($scope.logToConsole);
   log.SetLogToFile($scope.logToFile);
   log.SetMask(config.GetLogMask());

   // Update Ajax object
   ajax.server.protocol = $scope.server.protocol;
   ajax.server.hostname = $scope.server.host;
   ajax.server.path = $scope.server.path;

   $scope.UpdateUserName = function() {
      config.SetUserName($scope.userName);
   };

   $scope.UpdatePassword = function() {
      config.SetPassword($scope.password);
   };

   $scope.UpdateLogToConsole = function() {
      log.SetLogToConsole($scope.logToConsole);
      config.SetLogToConsole($scope.logToConsole);
   };

   $scope.UpdateLogToFile = function() {
      log.SetLogToFile($scope.logToFile);
      config.SetLogToFile($scope.logToFile);
   };

   $scope.UpdateLogMask = function() {
      $scope.logMask.value = 0x00;

      if($scope.logMask.debug) {
         $scope.logMask.value |= log.DEBUG;
      }

      if($scope.logMask.info) {
         $scope.logMask.value |= log.INFO;
      }

      if($scope.logMask.warn) {
         $scope.logMask.value |= log.WARN;
      }

      if($scope.logMask.error) {
         $scope.logMask.value |= log.ERROR;
      }

      log.SetMask($scope.logMask.value);
      config.SetLogMask($scope.logMask.value);
   };

   $scope.UpdateServer = function() {
      ajax.server.protocol = $scope.server.protocol;
      ajax.server.hostname = $scope.server.host;
      ajax.server.path = $scope.server.path;

      $window.localStorage.serverProtocol = $scope.server.protocol;
      $window.localStorage.serverHost = $scope.server.host;
      $window.localStorage.serverPath = $scope.server.path;
   };
}]);



var configCtrl = angular.module('config_controller', []);

configCtrl.controller('ConfigCtrl', function() {
   this.logToConsole = config.GetLogToConsole();
   this.logToFile = config.GetLogToFile();

   this.UpdateLogToConsole = function() {
      config.SetLogToConsole(this.logToConsole);
   };

   this.UpdateLogToFile = function() {
      config.SetLogToFile(this.logToConsole);
   };
});


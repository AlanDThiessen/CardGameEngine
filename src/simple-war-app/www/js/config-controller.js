
var configCtrl = angular.module('config_controller', []);

configCtrl.controller('ConfigCtrl', function() {
   this.userName = config.GetUserName();
   this.password = config.GetPassword();
   this.logToConsole = config.GetLogToConsole();
   this.logToFile = config.GetLogToFile();
   this.logMask = {};
   this.logMask.value = config.GetLogMask();
   this.logMask.debug = ((this.logMask.value & log.DEBUG) == log.DEBUG);
   this.logMask.info  = ((this.logMask.value & log.INFO ) == log.INFO );
   this.logMask.warn  = ((this.logMask.value & log.WARN ) == log.WARN );
   this.logMask.error = ((this.logMask.value & log.ERROR) == log.ERROR);

/* Server settings are not available in the actual game
   // Server settings will be local to this app, so no need to call config
   this.server = {};
   if(window.localStorage.serverProtocol) {
      this.server.protocol = window.localStorage.serverProtocol;
   }
   else {
      this.server.protocol = 'https';
   }

   if(window.localStorage.serverHost) {
      this.server.host = window.localStorage.serverHost;
   }
   else {
      this.server.host = 'gator4021.hostgator.com';
   }

   if(window.localStorage.serverPath) {
      this.server.path = window.localStorage.serverPath;
   }
   else {
      this.server.path = '/~thiessea/TheThiessens.net/cge/cge.php';
   }

   // Update Ajax object
   ajax.server.protocol = this.server.protocol;
   ajax.server.hostname = this.server.host;
   ajax.server.path = this.server.path;
*/

   // Update the logger with what we read out of configuration.
   log.SetLogToConsole(this.logToConsole);
   log.SetLogToFile(this.logToFile);
   log.SetMask(config.GetLogMask());

   this.UpdateUserName = function() {
      config.SetUserName(this.userName);
   };

   this.UpdatePassword = function() {
      config.SetPassword(this.password);
   };

   this.UpdateLogToConsole = function() {
      log.SetLogToConsole(this.logToConsole);
      config.SetLogToConsole(this.logToConsole);
   };

   this.UpdateLogToFile = function() {
      log.SetLogToFile(this.logToFile);
      config.SetLogToFile(this.logToFile);
   };

   this.UpdateLogMask = function() {
      this.logMask.value = 0x00;

      if(this.logMask.debug) {
         this.logMask.value |= log.DEBUG;
      }

      if(this.logMask.info) {
         this.logMask.value |= log.INFO;
      }

      if(this.logMask.warn) {
         this.logMask.value |= log.WARN;
      }

      if(this.logMask.error) {
         this.logMask.value |= log.ERROR;
      }

      log.SetMask(this.logMask.value);
      config.SetLogMask(this.logMask.value);
   };

/*
   this.UpdateServer = function() {
      ajax.server.protocol = this.server.protocol;
      ajax.server.hostname = this.server.host;
      ajax.server.path = this.server.path;

      window.localStorage.serverProtocol = this.server.protocol;
      window.localStorage.serverHost = this.server.host;
      window.localStorage.serverPath = this.server.path;
   };
*/
});


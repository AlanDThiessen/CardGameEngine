
angular.module( "cge.utils.logger", [] ).
   // TODO: Put this back in!
   // factory('cge.utils.Logger', ['cge.utils.Config', 'cge.utils.FileSystem', function(config, fs) {
    factory('cge.utils.Logger', ['cge.utils.Config', function(config, fs) {

   log = {
      DEBUG: 0x01,
      INFO: 0x02,
      WARN: 0x04,
      ERROR: 0x08,

      toFile: false,
      toConsole: false,
      fileReady: false,
      mask: 0xFF,
      pendingStr: null
   };

    //log.mask = config.GetLogMask() || (log.WARN | log.ERROR);

   log.SetMask = function (value) {
      log.mask = value;
   };

   log.SetLogToConsole = function (value) {
      log.toConsole = value;
   };

   log.SetLogToFile = function (value) {
      log.toFile = value;
   };

   log.FileSystemReady = function () {
      // TODO: Put this back in!
      // FS.OpenLogFile(log.LogFileReady, log.LogFileWriteComplete);
   };


   log.LogFileReady = function (ready) {
      log.fileReady = true;
      //log.mask = 0xFF;
      log.info("App Log Startup");
   };

   log.LogFileWriteComplete = function () {

      var str = pendingStr;

      pendingStr = null;

      if (str !== null) {
         // TODO: Put this back in
         // FS.WriteLogFile(true, str);
      } else {
         log.fileReady = true;
      }
   };

   log.GetDate = function () {
      var date = new Date();
      dateStr = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
      dateStr += " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + "." + date.getMilliseconds();
      return dateStr;
   };


   log.debug = function (format) {
      var args = Array.prototype.slice.call(arguments, 0);
      args.unshift(log.DEBUG);

      if (log.mask & log.DEBUG) {
         log._out.apply(this, args);
      }
   };

   log.info = function (format) {
      var args = Array.prototype.slice.call(arguments, 0);
      args.unshift(log.INFO);

      if (log.mask & log.INFO) {
         log._out.apply(this, args);
      }
   };

   log.warn = function (format) {
      var args = Array.prototype.slice.call(arguments, 0);
      args.unshift(log.WARN);

      if (log.mask & log.WARN) {
         log._out.apply(this, args);
      }
   };

   log.error = function (format) {
      var args = Array.prototype.slice.call(arguments, 0);
      args.unshift(log.ERROR);

      if (log.mask & log.ERROR) {
         log._out.apply(this, args);
      }
   };

   log._out = function (level, format) {
      var i = -1;
      var args = Array.prototype.slice.call(arguments, 2);
      var str;

      var dateStr = log.GetDate();
      dateStr = "[" + dateStr + "] ";
      format = "" + format;

      str = format.replace(/\%[sd]/g, function () {
         i++;
         return args[i];
      });

      switch (level) {
         case log.DEBUG:
            console.log(dateStr + "DEBUG: " + str);
            log._ToFile(dateStr + "DEBUG: " + str);
            break;

         case log.INFO:
            console.log(dateStr + " INFO: " + str);
            log._ToFile(dateStr + " INFO: " + str);
            break;

         case log.WARN:
            console.warn(dateStr + " WARN: " + str);
            log._ToFile(dateStr + " WARN: " + str);
            break;

         case log.ERROR:
            console.error(dateStr + "ERROR: " + str);
            log._ToFile(dateStr + "ERROR: " + str);
            break;
      }
   };

   log._ToFile = function (str) {
      if (log.fileReady) {
         log.fileReady = false;
         str += '\n';
         // TODO: Put this back in!
         // FS.WriteLogFile(true, str);
      }
      else {
         log.pendingStr += str + '\n';
      }
   };

   return log;
}]);

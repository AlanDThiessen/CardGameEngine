
angular.module('cge.utils').factory('cge.utils.Logger', ['cge.utils.Config', 'cge.utils.FileSystem', function(config, fs) {

   var log = {
      DEBUG: 0x01,
      INFO: 0x02,
      WARN: 0x04,
      ERROR: 0x08,

      fileReady: false,
      pendingStr: null
   };


   log.FileSystemReady = function () {
      fs.OpenLogFile(LogFileReady, log.LogFileWriteComplete);
   };


   var LogFileReady = function (ready) {
      log.fileReady = true;
      log.info("App Log Startup");
   };

   log.LogFileWriteComplete = function () {
      var str = pendingStr;
      pendingStr = null;

      if (str !== null) {
         fs.WriteLogFile(true, str);
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

      if (config.GetLogMask() & log.DEBUG) {
         log._out.apply(this, args);
      }
   };

   log.info = function (format) {
      var args = Array.prototype.slice.call(arguments, 0);
      args.unshift(log.INFO);

      if (config.GetLogMask() & log.INFO) {
         log._out.apply(this, args);
      }
   };

   log.warn = function (format) {
      var args = Array.prototype.slice.call(arguments, 0);
      args.unshift(log.WARN);

      if (config.GetLogMask() & log.WARN) {
         log._out.apply(this, args);
      }
   };

   log.error = function (format) {
      var args = Array.prototype.slice.call(arguments, 0);
      args.unshift(log.ERROR);

      if (config.GetLogMask() & log.ERROR) {
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
            if(config.GetLogToConsole()) { console.log(dateStr + "DEBUG: " + str); }
            if(config.GetLogToFile())    { log._ToFile(dateStr + "DEBUG: " + str); }
            break;

         case log.INFO:
            if(config.GetLogToConsole()) { console.log(dateStr + " INFO: " + str); }
            if(config.GetLogToFile())    { log._ToFile(dateStr + " INFO: " + str); }
            break;

         case log.WARN:
            if(config.GetLogToConsole()) { console.warn(dateStr + " WARN: " + str); }
            if(config.GetLogToFile())    { log._ToFile(dateStr + " WARN: " + str);  }
            break;

         case log.ERROR:
            if(config.GetLogToConsole()) { console.error(dateStr + "ERROR: " + str); }
            if(config.GetLogToFile())    { log._ToFile(dateStr + "ERROR: " + str); }
            break;
      }
   };

   log._ToFile = function (str) {
      if (log.fileReady) {
         log.fileReady = false;
         str += '\n';
         fs.WriteLogFile(true, str);
      }
      else {
         log.pendingStr += str + '\n';
      }
   };

   return log;
}]);

log = { };

log.DEBUG   = 0x01;
log.INFO    = 0x02;
log.WARN    = 0x04;
log.ERROR   = 0x08;

log.mask = 0xFF;

log.debug = function (format) {
   var args = Array.prototype.slice.call(arguments, 0);
   args.unshift(log.DEBUG);

   if (log.mask & log.DEBUG) {
      log._out.apply(this, args);
   }
}

log.info = function (format) {
   var args = Array.prototype.slice.call(arguments, 0);
   args.unshift(log.INFO);

   if (log.mask & log.INFO) {
      log._out.apply(this, args);
   }
}

log.warn = function (format) {
   var args = Array.prototype.slice.call(arguments, 0);
   args.unshift(log.INFO);

   if (log.mask & log.WARN) {
      log._out.apply(this, args);
   }
}

log.error = function (format) {
   var args = Array.prototype.slice.call(arguments, 0);
   args.unshift(log.INFO);

   if (log.mask & log.ERROR) {
      log._out.apply(this, args);
   }
}

log._out = function (level, format) {
   var i = -1;
   var args = Array.prototype.slice.call(arguments, 2);

   format = "" + format;

   var str = format.replace(/\%[sd]/g, function () {
      i++;  
      return args[i];
   });

   switch (level) {
      case log.DEBUG:
         console.log("DEBUG: " + str);
         break;

      case log.INFO:
         console.log("INFO: " + str);
         break;

      case log.WARN:
         console.warn("WARN: " + str);
         break;

      case log.ERROR:
         console.error("ERROR: " + str);
         break;
   }
};

module.exports = log;

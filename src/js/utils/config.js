
config = {}


config.GetUserName = function() {
   return window.localStorage.username;
};

config.SetUserName = function(value) {
   window.localStorage.setItem('username', value);
};

config.GetPassword = function() {
   return window.localStorage.password;
};

config.SetPassword = function(value) {
   window.localStorage.setItem('password', value);
};

config.GetLogMask = function() {
   var value = 0;

   if(window.localStorage.logMask) {
      value = parseInt(window.localStorage.logMask);
   }
   
   return value;
};

config.SetLogMask = function(value) {
   window.localStorage.setItem('logMask', value.toString());
};

config.GetLogToConsole = function() {
   return window.localStorage.logToConsole === 'true';
};

config.SetLogToConsole = function(value) {
   window.localStorage.setItem('logToConsole', value.toString());
};

config.GetLogToFile = function() {
   return window.localStorage.logToFile === 'true';
};

config.SetLogToFile = function(value) {
   window.localStorage.setItem('logToFile', value.toString());
};

module.exports = config;

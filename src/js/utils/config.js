

function GetUserName() {
   return window.localStorage.username;
}

function SetUserName(value) {
   window.localStorage.setItem('username', value);
}

function GetPassword() {
   return window.localStorage.password;
}

function SetPassword(value) {
   window.localStorage.setItem('password', value);
}

function GetLogMask() {
   return window.localStorage.logMask;
}

function SetLogMask(value) {
   window.localStorage.setItem('logMask', value);
}

function GetLogToConsole() {
   return window.localStorage.logToConsole;
}

function SetLogToConsole(value) {
   window.localStorage.setItem('logToConsole', value);
}

function GetLogToFile() {
   return window.localStorage.logToFile;
}

function SetLogToFile(value) {
   window.localStorage.setItem('logToFile', value);
}

module.exports = {
                  GetUserName: GetUserName,
                  SetUserName: SetUserName,
                  GetPassword: GetPassword,
                  SetPassword: SetPassword,
                  GetLogMask: GetLogMask,
                  SetLogMask: SetLogMask,
                  GetLogToConsole: GetLogToConsole,
                  SetLogToConsole: SetLogToConsole,
                  GetLogToFile: GetLogToFile,
                  SetLogToFile: SetLogToFile
};

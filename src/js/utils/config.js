

function GetUserName() {
   return localStorage.username;
}

function SetUserName(value) {
   localStorage.setItem('username', value);
}

function GetPassword() {
   return localStorage.password;
}

function SetPassword(value) {
   localStorage.setItem('password', value);
}

function GetLogMask() {
   return localStorage.logMask;
}

function SetLogMask(value) {
   localStorage.setItem('logMask', value);
}

function GetLogToConsole() {
   return localStorage.logToConsole;
}

function SetLogToConsole(value) {
   localStorage.setItem('logToConsole', value);
}

function GetLogToFile() {
   return localStorage.logToFile;
}

function SetLogToFile(value) {
   localStorage.setItem('logToFile', value);
}

module.exports = {
                  GetUserName: GetUserName,
                  SetUserName: SetUserName,
                  GetPassword: GetPassword,
                  SetPassword: SetPassword,
                  GetLogLevel: GetLogLevel,
                  SetLogLevel: SetLogLevel,
                  GetLogToConsole: GetLogToConsole,
                  SetLogToConsole: SetLogToConsole,
                  GetLogToFile: GetLogToFile,
                  SetLogToFile: SetLogToFile
};

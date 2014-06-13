

function GetUserName() {
   localStorage.getItem('username');
}

function SetUserName(value) {
   localStorage.setItem('username', value);
}

function GetPassword() {
   localStorage.getItem('password');
}

function SetPassword(value) {
   localStorage.setItem('password', value);
}

function GetLogLevel() {
   localStorage.getItem('logLevel');
}

function SetLogLevel(value) {
   localStorage.setItem('logLevel', value);
}

function GetLogToFile() {
   localStorage.getItem('logToFile');
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
                  GetLogToFile: GetLogToFile,
                  SetLogToFile: SetLogToFile
};

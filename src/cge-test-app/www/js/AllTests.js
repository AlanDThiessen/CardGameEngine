(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

log = require("./Logger.js");

ajax = {};

ajax.server = {
   protocol:   'https',
   hostname:   'gator4021.hostgator.com',
   port:       443,
   path:       '/~thiessea/TheThiessens.net/cge/cge.php'
};


ajax.ServerPost = function(postData, success, failure) {
   var url = ajax.server.protocol + '://' + ajax.server.hostname + ajax.server.path;
   var formData = new FormData();
   var request = new XMLHttpRequest();

	for(var key in postData) {
	   if(postData.hasOwnProperty(key)) {
	      formData.append(key, postData[key]);
	   }
	}

   request.open("POST", url, true );
   request.responseType = 'text';
   request.onreadystatechange = function(e){ajax.HandleResponse(e, this, success, failure);};
   request.send(formData);
}


ajax.HandleResponse = function(event, resp, success, failure) {
   if(resp.readyState == resp.DONE) {
      if(resp.status == 200) {
         if(typeof success === 'function') {
            log.info(resp.responseText);
            success(JSON.parse(resp.responseText));
         }
      }
      else {
         if(typeof failure === 'function') {
            failure(resp.status);
         }
      }
   }
}

module.exports = ajax;

},{"./Logger.js":6}],2:[function(require,module,exports){

server = require("./ServerInterface.js");

authenticator = {};


/******************************************************************************
 * Authenticator Events
 ******************************************************************************/
authenticator.events = {
   AUTH_REGISTRATION:                    1,
   AUTH_USER_LOGGED_IN:                  2,
   AUTH_USER_LOGGED_OUT:                 3,
   AUTH_MAX_EVENT:                       4   // For validation: should always be
                                             // one more than the last event.
};


/******************************************************************************
 * Authenticator Status/Error Values
 ******************************************************************************/
authenticator.status = {
   // Successfull status
   AUTH_SUCCESS:                         0,
   AUTH_REQUESTED:                       1,
   AUTH_USER_AUTHENTICATED:              2,
   AUTH_USER_NOT_AUTHENTICATED:          3,

   // Error codes   
   AUTH_FAILURE:                        -1,  // The specific error is unknown
   AUTH_USERNAME_EXISTS:                -2,
   AUTH_SERVER_ERROR:                   -3,
   AUTH_AUTHENTICATION_ERROR:           -4
};


/******************************************************************************
 * Authenticator Callbacks
 ******************************************************************************/
authenticator.callBacks = [
];


authenticator.AddCallback = function(callback) {
   var status = false;

   if(typeof(callback) === "function") {
      if(authenticator.callBacks.indexOf(callback) == -1) {
         authenticator.callBacks.push(callback);
         status = true;
      }
   }

   return status;
};


authenticator.RemoveCallback = function(callback) {
   var status = false;

   if(typeof(callback) === "function" ) {
      var index = authenticator.callBacks.indexOf(callback);

      if(index > -1) {
         authenticator.callBacks.splice(index, 1);
         status = true;
      }
   }

   return status;
}


// More for testing purposes.
authenticator.ResetCallbacks = function() {
   authenticator.callBacks = [];
};


authenticator.CallBack = function(event, callStatus, data) {
   var status = false;

   if((event > 0) && (event < authenticator.events.AUTH_MAX_EVENT)) {
      for(var cntr = 0; cntr < authenticator.callBacks.length; cntr++) {
         if(typeof(authenticator.callBacks[cntr]) === "function") {
            (authenticator.callBacks[cntr])(event, callStatus);
         }
      }

      status = true;
   }

   return status;
};


/******************************************************************************
 * Authenticator Token
 ******************************************************************************/
authenticator.token = {
   status:        authenticator.status.AUTH_USER_NOT_AUTHENTICATED,
   userId:        undefined,
   userName:      undefined,
   displayName:   undefined,
   email:         undefined
};

authenticator.GetUserStatus = function() {
   return authenticator.token.status;
};

authenticator.GetUserId = function() {
   return authenticator.token.userId;
};

authenticator.GetUserName = function() {
   return authenticator.token.userName;
};

authenticator.GetUserDisplayName = function() {
   return authenticator.token.displayName;
};

authenticator.GetUserEmail = function() {
   return authenticator.token.email;
};


/******************************************************************************
 * Server Event Handlers
 ******************************************************************************/
authenticator.ServerLoginCallback = function(status, data) {

};



/******************************************************************************
 * Authenticator Interface Methods
 ******************************************************************************/
authenticator.Init = function() {
   authenticator.token.status       = authenticator.status.AUTH_USER_NOT_AUTHENTICATED;
   authenticator.token.userId       = undefined;
   authenticator.token.userName     = undefined;
   authenticator.token.displayName  = undefined;
   authenticator.token.email        = undefined;

   server.AddCallback(server.events.SI_LOGIN, authenticator.ServerLoginCallback);
};


authenticator.RegisterUser = function(userName, password, displayName, email) {
   var status = server.RegisterUser(userName, password, displayName, email);

   if(status == server.status.SI_SUCCESS) {
      authenticator.token.status = authenticator.status.AUTH_REQUESTED;
   }
};


authenticator.LoginUser = function(userName, password) {

};


authenticator.LogoutUser = function() {

};


module.exports = authenticator;


},{"./ServerInterface.js":7}],3:[function(require,module,exports){
/*******************************************************************************
 * 
 * FileSystem.js
 * 
 * This file provides the following functionality:
 *    - Initializes the filesystem for the application
 *    - Provides the interface for storing game data from from the filesystem.
 *    - Provides the interface for retrieving game data from the filesystem.
 * 
 * Usage:
 *    var FS = require('FileSystem.js');
 * 
 *    document.addEventListener("deviceready", function(){
 *       FS.InitFileSystem();
 *       }, false);
 * 
 ******************************************************************************/

//var log = require('./Logger.js');

/*******************************************************************************
 * Constants
 ******************************************************************************/
var STORAGE_SIZE_BYTES = 512;
var GAME_DEFS_DIR      = "gameDefs";
var DECK_DEFS_DIR      = "deckDefs";
var ACTIVE_GAMES_DIR   = "games";

var LOG_FILE_NAME          = "cge.log";
var GAME_SUMMARY_FILE_NAME   = "gameSummary";

/*******************************************************************************
 * Variables
 ******************************************************************************/
var fileSystemGo    = false;       // Whether the fileSystem is usable
var onReadyCallback = undefined;
var onErrorCallback = undefined;
var fsError         = "";

// Variable holding the directory entries
var dirEntries = {appStorageDir: undefined,
                  gamesDefsDir: undefined,
                  deckDefsDir: undefined,
                  activeGamesDir: undefined
                  };

// File Object
function FileEntity(name, onReady, onWriteEnd, fileEntry) {
   this.name = name;
   this.type = "text";
   this.data = undefined;           // Data to write to the file after opening
   this.truncate = false;
   this.entry = fileEntry;
   this.writer = undefined;
   this.onReady = onReady;          // Callback when ready to write
   this.onReadEnd = undefined;      // Callback when done reading the file
   this.onWriteEnd = onWriteEnd;    // Callback when finished writing
}

// Array to hold the FileEntry objects that are open
var fileEntries = {log: undefined,
                   gameSummary: undefined,
                   gameDefs: {},
                   deckDefs: {},
                   games: []
                   };


/*******************************************************************************
 * Initialization Methods
 ******************************************************************************/
// InitFileSystem() should always be called once at app startup
// Note: This function cannot be called until after the Device Ready event.
function InitFileSystem(onReady, onError) {
   fileSystemGo = false;
   fsError = "";
   onReadyCallback = onReady;
   onErrorCallback = onError;
   RequestFileSystem();
}


function SetErrorCallback(onError) {
   onErrorCallback = onError;
}


function RequestFileSystem() {
   if(typeof LocalFileSystem !== "undefined") {
      window.requestFileSystem(LocalFileSystem.PERSISTENT,
                               STORAGE_SIZE_BYTES,
                               InitDirectories,                                       // Success
                               function(error){FSError(error, 'RequestFileSystem');} // Error
                               );
   }
   else {
      SetFileSystemReady(false);
   }
}


function InitDirectories(fileSystem) {
   // First, retrieve the application storage location using Cordova libraries
   dirEntries.appStorageDir = fileSystem.root;

   if((dirEntries.gamesDefsDir === undefined) ||
      (dirEntries.deckDefsDir === undefined) ||
      (dirEntries.activeGamesDir === undefined)){
      // Attempt to read the dir entries
      //log.info("Retrieving game directories");
      dirReader = new DirectoryReader(dirEntries.appStorageDir.toInternalURL());
      dirReader.readEntries(ReadRootDir, function(error){FSError(error, 'Read Directory');});
   }
   else {
      //log.info("Game directory objects already exist");
      SetFileSystemReady(true);
   }
}


function ReadRootDir(entries){
   // Go through looking for our entries
   for(cntr = 0; cntr < entries.length; cntr++) {
      if(entries[cntr].isDirectory) {
         SetRootDirEntry(entries[cntr]);
      }
      else if(entries[cntr].isFile) {
         if(entries[cntr].name == LOG_FILE_NAME) {
            //alert('Found log file!');
            //fileEntries.log = new FileEntity(entries[cntr].name, undefined, undefined, entries[cntr]);
         }
         
         if(entries[cntr].name == GAME_SUMMARY_FILE_NAME) {
            //alert('Found game summary file!');
            //fileEntries.gameSummary = new FileEntity(entries[cntr].name, undefined, undefined, entries[cntr]);
         }
      }
   }

   CheckRootDirEntries();
}
   
  
function CheckRootDirEntries() {
   // Create directories if they don't exist
   if(dirEntries.gamesDefsDir === undefined) {
      //log.info("Creating directory: " + GAME_DEFS_DIR );
      dirEntries.appStorageDir.getDirectory(GAME_DEFS_DIR,
                                            {create: true, exclusive: false},
                                            DirectoryCreated,
                                            function(error){FSError(error, "Create dir '" + GAME_DEFS_DIR + "'");}
                                            );
   }
   
   if(dirEntries.deckDefsDir === undefined) {
      //log.info("Creating directory: " + DECK_DEFS_DIR );
      dirEntries.appStorageDir.getDirectory(DECK_DEFS_DIR,
                                            {create: true, exclusive: false},
                                            DirectoryCreated,
                                            function(error){FSError(error, "Create dir '" + DECK_DEFS_DIR + "'");}
                                            );
   }
   
   if(dirEntries.activeGamesDir === undefined) {
      //log.info("Creating directory: " + ACTIVE_GAMES_DIR );
      dirEntries.appStorageDir.getDirectory(ACTIVE_GAMES_DIR,
                                            {create: true, exclusive: false},
                                            DirectoryCreated,
                                            function(error){FSError(error, "Create dir '" + ACTIVE_GAMES_DIR + "'");}
                                            );
   }
}


function SetRootDirEntry(entry) {
   //log.info("Setting directory object for " + entry.name);
   if(entry.name == GAME_DEFS_DIR) {
      dirEntries.gamesDefsDir = entry;
   }
   
   if(entry.name == DECK_DEFS_DIR){
      dirEntries.deckDefsDir = entry;
   }
   
   if(entry.name == ACTIVE_GAMES_DIR){
      dirEntries.activeGamesDir = entry;
   }

   if((dirEntries.gamesDefsDir !== undefined) &&
      (dirEntries.deckDefsDir !== undefined) &&
      (dirEntries.activeGamesDir !== undefined)){
      SetFileSystemReady(true);
   }
}


function DirectoryCreated(entry) {
   SetRootDirEntry(entry);

   if((dirEntries.gamesDefsDir !== undefined) &&
      (dirEntries.deckDefsDir !== undefined) &&
      (dirEntries.activeGamesDir !== undefined)){
      SetFileSystemReady(true);
   }
}


function SetFileSystemReady(status) {
   fileSystemGo = status;

   if(typeof onReadyCallback === "function") {
      onReadyCallback(true);
   }
}


/*******************************************************************************
 * File Entity Methods
 ******************************************************************************/
function OpenFileEntity(entity, dirEntry) {
   // If the file entry is undefined, then we need to get the file
   if(entity.entry === undefined) {
      if(dirEntry !== undefined) {
         dirEntry.getFile(entity.name,
                          {create: true, exclusive: false},
                          function(entry){entity.entry = entry; FileEntityCreateWriter(entity);},
                          function(error){FSError(error, 'Open file ' + entity.name);}
                         );
      }
   }
   else {
      if(entity.writer === undefined) {
         FileEntityCreateWriter(entity);
      }
      else {
         entity.writer.onwriteend = entity.onWriteEnd;
         FileEntityReady(entity, true);
      }
   }
}


function FileEntityCreateWriter(entity) {
   if((entity !== undefined) && (entity.entry !== undefined)) {
      entity.entry.createWriter(function(writer){FileEntitySetWriter(entity, writer);},
                                function(error){FSError(error, "CreateFileWriter");}
                                );
   }
}


function FileEntitySetWriter(entity, writer) {
   if(entity !== undefined) {
      entity.writer = writer;
      entity.writer.onerror = function(error){FSError(error, "Write file " + entity.name);};

      if(entity.truncate) {
         entity.writer.onwriteend = function(){FileEntityTruncateAfterWrite(entity)};
      }
      else {
         entity.writer.onwriteend = entity.onWriteEnd;
      }

      if(entity.data !== undefined) {
         FileEntityWriteData(entity);
      }
      else {
         FileEntityReady(entity, true);
      }
   }
}


function FileEntityWriteData(entity) {
   if((entity !== undefined) && (entity.writer !== undefined)) {
      entity.writer.seek(0);
      entity.writer.write(entity.data);
      entity.data = undefined;
   }
}


function FileEntityTruncateAfterWrite(entity) {
   if(typeof entity.onWriteEnd === "function") {
      entity.writer.onwriteend = entity.onWriteEnd;
   }

   entity.writer.truncate(entity.writer.position);
}


function FileEntityReady(entity, ready) {
   if((entity.entry !== undefined) &&
      (typeof entity.onReady === "function")) {
      entity.onReady(ready);
   }
}


function FileEntityRead(entity) {
   if((entity !== undefined) && (entity.entry !== undefined)) {
      entity.entry.file(function(file){FileEntityReader(entity, file);},
                        function(error){FSError(error, "FileEntityRead");}
                       );
   }
}


function FileEntityReader(entity, file) {
   var reader = new FileReader();

   reader.onloadend = function(e) {
      if(entity.type == "JSON") {
         data = JSON.parse(this.result);
      }
      else {
         data = this.result;
      }
      
      FileEntityReadComplete(entity, data);
   };

   reader.readAsText(file);
}


function FileEntityReadComplete(entity, data) {
   if((entity.entry !== undefined) &&
      (typeof entity.onReadEnd === "function")) {
      entity.onReadEnd(data);
   }
}


/*******************************************************************************
 * Status Methods
 ******************************************************************************/
function GetStatus() {
   return fileSystemGo;
}


function GetError() {
   return fsError;
}


/*******************************************************************************
 * Log File Methods
 ******************************************************************************/
function OpenLogFile(onReady, onWriteEnd) {
   // If the entry is undefined, then create one
   if(fileEntries.log === undefined) {
      fileEntries.log = new FileEntity(LOG_FILE_NAME, onReady, onWriteEnd, undefined);
   }
   else {
      // Just update the onReady and onWriteEnd methods
      fileEntries.log.onReady = onReady;
      fileEntries.log.onWriteEnd = onWriteEnd;

      if(fileEntries.log.writer !== undefined) {
         fileEntries.log.writer.onwriteend = onWriteEnd;
      }
   }

   OpenFileEntity(fileEntries.log, dirEntries.appStorageDir);
}


function ClearLogFile() {
   if((fileEntries.log !== undefined) && (fileEntries.log.writer !== undefined)) {
      fileEntries.log.writer.truncate(0);
   }
}


function WriteLogFile(append, data) {
   if((fileEntries.log !== undefined) && (fileEntries.log.writer !== undefined)) {
      fileEntries.log.writer.seek(fileEntries.log.writer.length);
      fileEntries.log.writer.write(data);
   }
}


function ReadLogFile(onReadEnd) {
   if(fileEntries.log !== undefined) {
      fileEntries.log.onReadEnd = onReadEnd;
      FileEntityRead(fileEntries.log);
   }
}


/*******************************************************************************
 * Deck Spec File Methods
 ******************************************************************************/
function WriteDeckSpec(specName, data, onWriteEnd) {
   fileName = specName + ".deckDef";

   // Create a new entity if one does not already exist by this name
   if(fileEntries.deckDefs[specName] === undefined) {
      fileEntries.deckDefs[specName] = new FileEntity(fileName, undefined, onWriteEnd, undefined);
      fileEntries.deckDefs[specName].type = "JSON";
   }
   else {
      // Just update the onWriteEnd method
      fileEntries.deckDefs[specName].onWriteEnd = onWriteEnd;
   }

   fileEntries.deckDefs[specName].truncate = true;    // Indicate we want this file truncated after write.
   fileEntries.deckDefs[specName].data = data;        // Indicate we want the data written immediate after open.
   OpenFileEntity(fileEntries.deckDefs[specName], dirEntries.deckDefsDir);
}


function ReadDeckSpec(specName, onReadEnd) {
   fileName = specName + ".deckDef";

   if(fileEntries.deckDefs[specName] === undefined) {
      fileEntries.deckDefs[specName] = new FileEntity(fileName, undefined, undefined, undefined);
      fileEntries.deckDefs[specName].type = "JSON";
   }

   fileEntries.deckDefs[specName].onReadEnd = onReadEnd;
   FileEntityRead(fileEntries.deckDefs[specName]);
}


/*******************************************************************************
 * Game Spec File Methods
 ******************************************************************************/
function WriteGameSpec(specName, data, onWriteEnd) {
   fileName = specName + ".gameDef";

   // Create a new entity if one does not already exist by this name
   if(fileEntries.gameDefs[specName] === undefined) {
      fileEntries.gameDefs[specName] = new FileEntity(fileName, undefined, onWriteEnd, undefined);
      fileEntries.gameDefs[specName].type = "JSON";
   }
   else {
      // Just update the onWriteEnd method
      fileEntries.gameDefs[specName].onWriteEnd = onWriteEnd;
   }

   fileEntries.gameDefs[specName].truncate = true;    // Indicate we want this file truncated after write.
   fileEntries.gameDefs[specName].data = data;        // Indicate we want the data written immediate after open.
   OpenFileEntity(fileEntries.gameDefs[specName], dirEntries.gamesDefsDir);
}


function ReadGameSpec(specName, onReadEnd) {
   fileName = specName + ".gameDef";

   if(fileEntries.gameDefs[specName] === undefined) {
      fileEntries.gameDefs[specName] = new FileEntity(fileName, undefined, undefined, undefined);
      fileEntries.gameDefs[specName].type = "JSON";
   }

   fileEntries.gameDefs[specName].onReadEnd = onReadEnd;
   FileEntityRead(fileEntries.gameDefs[specName]);
}


/*******************************************************************************
 * Error Handler
 ******************************************************************************/
function FSError(error, location) {
   var errorStr = "FS: " + error.code + " - ";
   
   switch(error.code) {
   case 1:
      errorStr += "Not Found Error";
      break;
      
   case 2:
      errorStr += "Security Error";
      break;
      
   case 3:
      errorStr += "Abort Error";
      break;
      
   case 4:
      errorStr += "Not Readable Error";
      break;
      
   case 5:
      errorStr += "Encoding Error";
      break;
      
   case 6:
      errorStr += "No Modification Allowed Error";
      break;
      
   case 7:
      errorStr += "Invalid State Error";
      break;
      
   case 8:
      errorStr += "Syntax Error";
      break;
      
   case 9:
      errorStr += "Invalid Modification Error";
      break;
      
   case 10:
      errorStr += "Quota Exceeded Error";
      break;
      
   case 11:
      errorStr += "Type Mismatch Error";
      break;
      
   case 12:
      errorStr += "Path Exists Error";
      break;
      
   default:
      errorStr += "Unknown Error";
      break;
   }
   
   errorStr += " in " + location;
   
//   alert(errorStr);
   fsError = errorStr;

   if(typeof onErrorCallback === "function") {
      onErrorCallback(error.code, errorStr);
   }
}


module.exports = {
                  // Initialization methods
                  InitFileSystem:   InitFileSystem,
                  SetErrorCallback: SetErrorCallback,
                  // Log file methods
                  OpenLogFile:      OpenLogFile,
                  WriteLogFile:     WriteLogFile,
                  ClearLogFile:     ClearLogFile,
                  ReadLogFile:      ReadLogFile,
                  // Deck Spec methods
                  WriteDeckSpec:    WriteDeckSpec,
                  ReadDeckSpec:     ReadDeckSpec,
                  // Game Spec methods
                  WriteGameSpec:    WriteGameSpec,
                  ReadGameSpec:     ReadGameSpec,
                  // Status methods
                  GetStatus:        GetStatus,
                  GetError:         GetError,
                  // Data export (for testing)
                  dirEntries:       dirEntries,
                  fileEntries:      fileEntries
                  };


},{}],4:[function(require,module,exports){

module.exports = {
};


},{}],5:[function(require,module,exports){

},{}],6:[function(require,module,exports){
var config = require("./config.js");
var FS = require("./FileSystem.js");

log = {
   DEBUG:      0x01,
   INFO:       0x02,
   WARN:       0x04,
   ERROR:      0x08,

   toFile:     false,
   toConsole:  false,
   fileReady:  false,
   mask:       0xFF,
   pendingStr: null
};

//log.mask = config.GetLogMask() || (log.WARN | log.ERROR);

log.SetMask = function(value) {
   log.mask = value;
};

log.SetLogToConsole = function(value) {
   log.toConsole = value;
};

log.SetLogToFile = function(value) {
   log.toFile = value;
};

log.FileSystemReady = function() {
   FS.OpenLogFile(log.LogFileReady, log.LogFileWriteComplete);
};


log.LogFileReady = function(ready) {
   log.fileReady = true;
   //log.mask = 0xFF;
   log.info("App Log Startup");
};

log.LogFileWriteComplete = function() {

   var str = pendingStr;

   pendingStr = null;

   if (str !== null) {
      FS.WriteLogFile(true, str);
   } else {
      log.fileReady = true;
   }
};


log.GetDate = function() {
   var date = new Date();
   dateStr  = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
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


log._ToFile = function(str) {
   if(log.fileReady) {
      log.fileReady = false;
      str += '\n';
      FS.WriteLogFile(true, str);
   }
   else {
      log.pendingStr += str + '\n';
   }
};


module.exports = log;

},{"./FileSystem.js":3,"./config.js":8}],7:[function(require,module,exports){

ajax = require("./Ajax.js");
log = require("./Logger.js");

server = {};

/******************************************************************************
 * Server Events
 ******************************************************************************/
server.events = {
   SI_LOGIN:                             1,
   SI_GAME_TYPES_RETRIEVED:              2,
   SI_DECK_SPEC_RETRIEVED:               3,
   SI_USER_GAMES_RETRIEVED:              4,
   SI_USER_JOINABLE_GAMES_RETRIEVED:     5,
   SI_JOINED_GAME:                       6,
   SI_GAME_STARTED:                      7,
   SI_GAME_PAUSED:                       8,
   SI_GAME_RESUMED:                      9,
   SI_GAME_ENDED:                       10,
   SI_MAX_EVENT:                        11   // For validation: should always be
                                             // one more than the last event.
};


/******************************************************************************
 * Server Status/Error Values
 ******************************************************************************/
server.status = {
   SI_SUCCESS:                           0,
   SI_FAILURE:                          -1,  // The specific error is unknown
   SI_ERROR_INVALID_EVENT:              -2,
   SI_ERROR_INVALID_CALLBACK:           -3,
   SI_ERROR_CALLBACK_ALREADY_EXISTS:    -4,
   SI_ERROR_NOT_FOUND:                  -5,
   SI_ERROR_TOKEN_INVALID:              -6,
   SI_ERROR_SERVER_TIMEOUT:             -7,
   SI_ERROR_SERVER_DATABASE:            -8,
   SI_ERROR_LOGIN_INVALID:              -9,
   SI_ERROR_REGISTER_NAME_EXISTS:      -10
};


/******************************************************************************
 * Server CGEServer Error Codes
 ******************************************************************************/
server.cgeError = {
   SI_CGE_ERROR_USER_EXISTS:             1,
   SI_CGE_ERROR_DB_ERROR:                2
};

/******************************************************************************
 * Server Callbacks
 ******************************************************************************/
server.callBacks = {
};

server.AddCallback = function(event, callback) {
   var status = server.status.SI_SUCCESS;

   if((event <= 0) || (event >= server.events.SI_MAX_EVENT)) {
      status = server.status.SI_ERROR_INVALID_EVENT;
   }
   else if(typeof(callback) !== "function") {
      status = server.status.SI_ERROR_INVALID_CALLBACK;
   }
   else {
      if(server.callBacks[event] === undefined) {
         server.callBacks[event] = [];
      }

      if(server.callBacks[event].indexOf(callback) != -1) {
         status = server.status.SI_ERROR_CALLBACK_ALREADY_EXISTS;
      }
      else {
         server.callBacks[event].push(callback);
      }
   }

   return status;
};


server.RemoveCallback = function(event, callback) {
   var status = server.status.SI_SUCCESS;

   if((event <= 0) || (event >= server.events.SI_MAX_EVENT)) {
      status = server.status.SI_ERROR_INVALID_EVENT;
   }
   else if(server.callBacks[event] === undefined) {
      status = server.status.SI_ERROR_NOT_FOUND;
   }
   else if(typeof(callback) !== "function" ) {
      status = server.status.SI_ERROR_INVALID_CALLBACK;
   }
   else {
      var index = server.callBacks[event].indexOf(callback);

      if(index > -1) {
         server.callBacks[event].splice(index, 1);
      }
      else {
         status = server.status.SI_ERROR_NOT_FOUND;
      }
   }

   return status;
}


// More for testing purposes.
server.ResetCallbacks = function() {
   server.callBacks = {};
};


server.CallBack = function(event, callStatus, data) {
   var status = server.status.SI_SUCCESS;

   if((event <= 0) || (event >= server.events.SI_MAX_EVENT)) {
      status = server.status.SI_ERROR_INVALID_EVENT;
   }
   else if(server.callBacks[event] === undefined) {
      status = server.status.SI_ERROR_NOT_FOUND;
   }
   else {
      for(var cntr = 0; cntr < server.callBacks[event].length; cntr++) {
         if(typeof(server.callBacks[event][cntr]) == "function") {
            (server.callBacks[event][cntr])(callStatus, data);
         }
      }
   }

   return status;
};


/******************************************************************************
 * Server Authentication Token
 ******************************************************************************/
server.token = {
   valid:      false,
   userId:     0
};

server.SetTokenUser = function(userId) {
   server.token.userId = userId;
   server.token.valid  = true;
};


server.ClearToken = function() {
   server.token.valid  = false;
   server.token.userId = 0;
}


/******************************************************************************
 * Register User
 ******************************************************************************/
server.RegisterUser = function(username, password, displayName, email) {
   var postData = {
      'action': 'cge_register_user',
      'username': username,
      'password': password,
      'display_name': displayName,
      'email': email
   };

   ajax.ServerPost(postData, server.RegisterUserSuccess, server.RegisterUserFailure);

   return server.status.SI_SUCCESS;
};


server.RegisterUserSuccess = function(response) {
   var status = server.status.SI_SUCCESS;

   if(response.cge_error_id !== undefined) {
      if(response.cge_error_id == server.cgeError.SI_CGE_ERROR_USER_EXISTS) {
         status = server.status.SI_ERROR_REGISTER_NAME_EXISTS;
      }
      else if(response.cge_error_id == server.cgeError.SI_CGE_ERROR_DB_ERROR) {
         status = server.status.SI_ERROR_SERVER_DATABASE;
      }
      else {
         status = server.status.SI_FAILURE;
      }
   }

   server.CallBack(server.events.SI_LOGIN, status, response);
};


server.RegisterUserFailure = function(callstatus) {
   var status = server.status.SI_FAILURE;
   server.Failure(status, "RegisterUser");

   if((callstatus >= 400) && (callstatus < 500)) {
      switch(callstatus) {
         case 408:
            status = server.status.SI_ERROR_SERVER_TIMEOUT;
            break;
      }
   }

   server.CallBack(server.events.SI_LOGIN, status, undefined);
};


/******************************************************************************
 * Login User
 ******************************************************************************/
server.LoginUser = function(username, password) {
   var postData = {
      'action': 'cge_login_user',
      'username': username,
      'password': password
   };

   ajax.ServerPost(postData, server.LoginUserSuccess, server.LoginUserFailure);

   return server.status.SI_SUCCESS;
};


server.LoginUserSuccess = function(user) {
   server.CallBack(server.event.SI_LOGIN, server.status.SI_SUCCESS, user);
};


server.LoginUserFailure = function(status) {
   server.failure(status, "LoginUser");
};


/******************************************************************************
 * Get Game Types
 ******************************************************************************/ 
server.GetGameTypes = function() {
   var postData = {
      'action': 'cge_get_game_types'
   };
   
   ajax.ServerPost(postData, server.GetGameTypesSuccess, server.GetGameTypesFailure);
   
   return server.status.SI_SUCCESS;
};


server.GetGameTypesSuccess = function(gameTypes) {
};


server.GetGameTypesFailure = function(status) {
   server.failure(status, "GetGameTypes");
};


/******************************************************************************
 * Load Deck Spec
 ******************************************************************************/ 
server.LoadDeckSpec = function(deckTypeId) {
   var postData = {
      'action': 'cge_load_deck_spec',
      'deck_type_id': deckTypeId
   };
   
   ajax.ServerPost(postData, server.LoadDeckSpecSuccess, server.LoadDeckSpecFailure);
   
   return server.status.SI_SUCCESS;
};


server.LoadDeckSpecSuccess = function(game) {
};


server.LoadDeckSpecFailure = function(status) {
   server.failure(status, "LoadDeckSpec");
};


/******************************************************************************
 * Get User Games
 ******************************************************************************/
server.GetUserGames = function() {
   if((server.token.valid == true) && (server.token.userId != 0)) {
      var postData = {
         'action': 'cge_get_my_games',
         'user_id': server.token.userId
      };

      ajax.ServerPost(postData, server.GetUserGamesSuccess, server.GetUserGamesFailure);

      return server.status.SI_SUCCESS;
   }
   else {
      return server.status.SI_ERROR_TOKEN_INVALID;
   }
};


server.GetUserGamesSuccess = function(games) {
   var cntr;
   var gameNames = "";

   for(cntr = 0; cntr < games.length; cntr++) {
      gameNames += '"' + games[cntr].game_name + '", ';
   }
};


server.GetUserGamesFailure = function(status) {
   server.failure(status, "GetUserGames");
};


/******************************************************************************
 * Get Joinable Games
 ******************************************************************************/ 
server.GetJoinableGames = function() {
   if((server.token.valid == true) && (server.token.userId != 0)) {
      var postData = {
         'action': 'cge_get_joinable_games',
         'user_id': server.token.userId
      };

      ajax.ServerPost(postData, server.GetJoinableGamesSuccess, server.GetJoinableGamesFailure);
      
      return server.status.SI_SUCCESS;
   }
   else {
      return server.status.SI_ERROR_TOKEN_INVALID;
   }
};


server.GetJoinableGamesSuccess = function(joinableGames) {
};


server.GetJoinableGamesFailure = function(status) {
   server.failure(status, "GetJoinableGames");
};


/******************************************************************************
 * Join Game
 ******************************************************************************/
server.JoinGame = function(gameId) {
   if((server.token.valid == true) && (server.token.userId != 0)) {
      var postData = {
         'action': 'cge_join_game',
         'game_id': gameId,
         'user_id': token.server.userId
      };
      
      ajax.ServerPost(postData, server.JoinGameSuccess, server.JoinGameFailure);

      return server.status.SI_SUCCESS;
   }
   else {
      return server.status.SI_ERROR_TOKEN_INVALID;
   }
};


server.JoinGameSuccess = function(game) {
};


server.JoinGameFailure = function(status) {
   server.failure(status, "JoinGame");
};


/******************************************************************************
 * Start Game
 ******************************************************************************/ 
server.StartGame = function(gameId) {
   if((server.token.valid == true) && (server.token.userId != 0)) {
      var postData = {
         'action': 'cge_start_game',
         'user_id': server.token.userId,
         'game_type_id': gameId
      };

      ajax.ServerPost(postData, server.StartGameSuccess, server.StartGameFailure);

      return server.status.SI_SUCCESS;
   }
   else {
      return server.status.SI_ERROR_TOKEN_INVALID;
   }
};


server.StartGameSuccess = function(game) {
};


server.StartGameFailure = function(status) {
   server.failure(status, "StartGame");
};


/******************************************************************************
 * 
 ******************************************************************************/ 
server.GetNumPlayersInGame = function(gameId) {
   var postData = {
      'action': 'cge_get_num_players',
      'game_id': gameId
   };
   
   ajax.ServerPost(postData, server.GetNumPlayersInGameSuccess, server.GetNumPlayersInGameFailure);
   
   return server.status.SI_SUCCESS;
};


server.GetNumPlayersInGameSuccess = function(game) {
};


server.GetNumPlayersInGameFailure = function(status) {
   server.failure(status, "GetNumPlayersInGame");
};


/******************************************************************************
 * Record Transaction
 ******************************************************************************/ 
server.RecordTransaction = function(gameId,
                                    fromContainer,
                                    toContainer,
                                    cards) {
   if((server.token.valid == true) && (server.token.userId != 0)) {
      var postData = {
         'action': 'cge_record_transaction',
         'game_id': gameId,
         'user_id': server.token.userId,
         'from_group_id': fromContainer,
         'to_group_id': toContainer,
         'items': cards
      };

      ajax.ServerPost(postData, server.RecordTransactionSuccess, server.RecordTransactionFailure);

      return server.status.SI_SUCCESS;
   }
   else {
      return server.status.SI_ERROR_TOKEN_INVALID;
   }
};


server.RecordTransactionSuccess = function(response) {
};


server.RecordTransactionFailure = function(status) {
   server.failure(status, "RecordTransaction");
};


/******************************************************************************
 * Pause Game
 ******************************************************************************/ 
server.PauseGame = function(gameId) {
   if((server.token.valid == true) && (server.token.userId != 0)) {
      var postData = {
         'action': 'cge_pause_game',
         'game_id': gameId,
         'user_id': server.token.userId
      };
      
      ajax.ServerPost(postData, server.PauseGameSuccess, server.PauseGameFailure);

      return server.status.SI_SUCCESS;
   }
   else {
      return server.status.SI_ERROR_TOKEN_INVALID;
   }
};


server.PauseGameSuccess = function(success) {
};


server.PauseGameFailure = function(status) {
   server.failure(status, "PauseGame");
};


/******************************************************************************
 * Resume Game
 ******************************************************************************/ 
server.ResumeGame = function(gameId) {
   if((server.token.valid == true) && (server.token.userId != 0)) {
      var postData = {
         'action': 'cge_resume_game',
         'game_id': gameId,
         'user_id': server.token.userId
      };

      ajax.ServerPost(postData, server.ResumeGameSuccess, server.ResumeGameFailure);

      return server.status.SI_SUCCESS;
   }
   else {
      return server.status.SI_ERROR_TOKEN_INVALID;
   }
};


server.ResumeGameSuccess = function(success) {
};


server.ResumeGameFailure = function(status) {
   server.failure(status, "ResumeGame");
};


/******************************************************************************
 * End Game
 ******************************************************************************/ 
server.EndGame = function(gameId) {
   if((server.token.valid == true) && (server.token.userId != 0)) {
      var postData = {
         'action': 'cge_end_game',
         'game_id': gameId,
         'user_id': server.token.userId
      };

      ajax.ServerPost(postData, server.EndGameSuccess, server.EndGameFailure);

      return server.status.SI_SUCCESS;
   }
   else {
      return server.status.SI_ERROR_TOKEN_INVALID;
   }
};


server.EndGameSuccess = function(success) {
};


server.EndGameFailure = function(status) {
   server.failure(status, "EndGame");
};

   
/******************************************************************************
 * Ack Event
 ******************************************************************************/ 
server.AckEvent = function(userId, gameId, notificationId) {
   var postData = {
      'action': 'cge_ack_event',
      'game_id': gameId,
      'user_id': userId,
      'notif_id': notificationId
   };
   
   ajax.ServerPost(postData, server.AckEventSuccess, server.AckEventFailure);
   
   return server.status.SI_SUCCESS;
};


server.AckEventSuccess = function(game) {
};


server.AckEventFailure = function(status) {
   server.failure(status, "AckEvent");
};


/******************************************************************************
 * Failure to Send - TODO: Needs some thought
 ******************************************************************************/ 
server.Failure = function(status, name) {
   log.warn("ServerInterface Error: " + status + " in " + name);
};


module.exports = server;


},{"./Ajax.js":1,"./Logger.js":6}],8:[function(require,module,exports){

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

},{}],9:[function(require,module,exports){

//require("./TestFileSystem.js");
//require("./TestLogger.js");
require("./TestServerInterface.js");
require("./TestAuthenticator.js");
require("./TestGameDataManager.js");
require("./TestGameManager.js");
require("./TestAuthService.js");


},{"./TestAuthService.js":11,"./TestAuthenticator.js":12,"./TestGameDataManager.js":13,"./TestGameManager.js":14,"./TestServerInterface.js":15}],10:[function(require,module,exports){

serverMock = {};

serverMock.ServerTimeout = function() {
   return {
      "status": 408,
      "content-type": 'text/JSON',
      "responseText": ''
   };
};


serverMock.ServerError = function() {
   return {
      "status": 403,
      "content-type": 'text/JSON',
      "responseText": ''
   };
};

serverMock.UserExists = function(userName) {
   return {
      "status": 200,
      "content-type": 'text/JSON',
      "responseText": '{"cge_error_id": "001", "cge_error": "User ' + userName + ' already exists."}'
   };
};


serverMock.DatabaseError = function() {
   return {
      "status": 200,
      "content-type": 'text/JSON',
      "responseText": '{"cge_error_id": "002", "cge_error": "Database error."}'
   };
};


serverMock.UserResponse = function(userId, userName, displayName, email) {
   return {
      "status": 200,
      "content-type": 'text/JSON',
      "responseText":   '{"id": "' + userId + '",'
                      +  ' "username": "' + userName + '",'
                      +  ' "display_name": "' + displayName + '",'
                      +  ' "email": "' + email + '"'
                      + '}'
   };
};

module.exports = serverMock;


},{}],11:[function(require,module,exports){
describe( "TestAuthService", function() {

   var AuthService = null;

   beforeEach(angular.module('myApp'));

   beforeEach ( function () {
      AuthService = angular.injector(['myApp']).get('AuthService');
   });

   it("should be defined", function () {
      expect(AuthService).not.toBe(null);
   });

   xit("should initially indicate that the user is not authenticated", function () {
   });

   xit("should be able log in with stored creditials from config", function () {
   });

   xit("should be able to log in with creditials supplied as parameters", function () {
   });

   xit("should be able to store creditials to the config on a succesful login", function () {
   });

   xit("should be able to clear stored creditials", function () {
   });

   xit("should log out the user when the network becomes unavailable", function () {
   });

   xit("should log in the user when the network becomes available", function () {
   });
});
},{}],12:[function(require,module,exports){

// Pull in the module we're testing.
var server = require("../../../src/js/utils/ServerInterface.js");
var auth = require("../../../src/js/utils/Authenticator.js");
var mock = require("./Data-MockServerInterface.js");


describe("Authenticator", function() {

   it("indicates user not authenticated upon initialization", function() {
      auth.Init();
      expect(auth.GetUserStatus()).toEqual(auth.status.AUTH_USER_NOT_AUTHENTICATED);
      expect(auth.GetUserId()).not.toBeDefined();
      expect(auth.GetUserName()).not.toBeDefined();
      expect(auth.GetUserDisplayName()).not.toBeDefined();
      expect(auth.GetUserEmail()).not.toBeDefined();
   });

   // Terminology:
   //    "Indicate" - The status is returned when queried.
   //    "Report" - The module calls a call-back method.
   describe("-when adding a callback method,", function() {

      afterEach(function() {
         auth.ResetCallbacks();
      });

      it("adds a valid callback method", function() {
         var TestCallBackAdd = function() {
            // Nothing needs to be done in this function
         };

         // Validate the lowest event
         var status = auth.AddCallback(TestCallBackAdd);
         expect(status).toEqual(true);
         expect(auth.callBacks).toBeDefined();
         expect(auth.callBacks).toContain(TestCallBackAdd);
      });
      
      it("indicates an error if the same callback is added twice", function() {
         var TestCallBackAdd = function() {
            // Nothing needs to be done in this function
         };

         // Validate the lowest event
         var status = auth.AddCallback(TestCallBackAdd);
         expect(status).toEqual(true);
         expect(auth.callBacks).toBeDefined();
         expect(auth.callBacks).toContain(TestCallBackAdd);
         var newStatus = auth.AddCallback(TestCallBackAdd);
         expect(newStatus).toEqual(false);
         expect(auth.callBacks.length).toEqual(1);
      });

      it("indicates an error for invalid callback method", function() {
         var TestCallBackAdd = "Just Testing";     // Oops! It's not a funciton!

         var status = auth.AddCallback(TestCallBackAdd);
         expect(status).toEqual(false);
         expect(auth.callBacks.length).toEqual(0);
      });

      it("calls back multiple functions", function() {
         var counter = 0;

         var CallBack1 = function(status, data) {
            if(status) {
               counter += 1;
            }
         };

         var CallBack2 = function(status, data) {
            if(status) {
               counter += 2;
            }
         };

         var status1 = auth.AddCallback(CallBack1);
         var status2 = auth.AddCallback(CallBack2);

         // Normally, this method is not called external of the ServerInterface;
         // However, for testing purposes...
         var status3 = auth.CallBack(auth.events.AUTH_REGISTRATION, auth.status.AUTH_SUCCESS, undefined);

         expect(status1).toEqual(true);
         expect(status2).toEqual(true);
         expect(status3).toEqual(true);
         expect(counter).toEqual(3);
      });

   });

   describe("-when removing a callback method,", function() {
      var CallBack1 = function() {};
      var CallBack2 = function() {};

      beforeEach(function() {
         auth.ResetCallbacks();
         auth.AddCallback(CallBack1);
      });

      afterEach(function() {
         auth.ResetCallbacks();
      });

      it("removes a callback method from the minimum event", function() {
         var status = auth.RemoveCallback(CallBack1);
         expect(status).toEqual(true);
         expect(auth.callBacks).not.toContain(CallBack1);
      });

      it("indicates an error for invalid callback method", function() {
         var TestCallBackAdd = "Just Testing";     // Oops! It's not a funciton!

         var status = auth.RemoveCallback(TestCallBackAdd);
         expect(status).toEqual(false);
         expect(auth.callBacks).toContain(CallBack1);
      });

      it("indicates if the method is not found", function() {
         var status = auth.RemoveCallback(CallBack2);
         expect(status).toEqual(false);
         expect(auth.callBacks).toContain(CallBack1);
      });
      
   });

   describe("-when not authenticated,", function() {

      beforeEach(function() {
         jasmine.Ajax.install();
      });

      afterEach(function() {
         jasmine.Ajax.uninstall();
         auth.ResetCallbacks();
      });

      it("reports username exists error on user registration", function() {
         var testEvent = undefined;
         var testStatus = undefined;

         var CallBack = function(event, status) {
            testEvent = event;
            testStatus = status;
         }

         auth.AddCallback(CallBack);
         auth.RegisterUser("TestUser", "testPassword", "Test User 1", "testuser1@chamrock.net");

         expect(auth.GetUserStatus()).toEqual(authenticator.status.AUTH_REQUESTED);

         jasmine.Ajax.requests.mostRecent().response(mock.UserExists("TestUser"));

         expect(testEvent).toEqual(auth.events.AUTH_REGISTRATION);
         expect(testStatus).toEqual(auth.status.AUTH_USERNAME_EXISTS);
         expect(auth.GetUserStatus()).toEqual(auth.status.AUTH_USER_NOT_AUTHENTICATED);
      });

      it("reports server error upon receiving a database error on user registration", function() {
         var testEvent = undefined;
         var testStatus = undefined;

         var CallBack = function(event, status) {
            testEvent = event;
            testStatus = status;
         }

         auth.AddCallback(CallBack);
         auth.RegisterUser("TestUser", "testPassword", "Test User 1", "testuser1@chamrock.net");

         expect(auth.GetUserStatus()).toEqual(authenticator.status.AUTH_REQUESTED);

         jasmine.Ajax.requests.mostRecent().response(mock.DatabaseError());

         expect(testEvent).toEqual(auth.events.AUTH_REGISTRATION);
         expect(testStatus).toEqual(auth.status.AUTH_SERVER_ERROR);
         expect(auth.GetUserStatus()).toEqual(auth.status.AUTH_USER_NOT_AUTHENTICATED);
      });

      it("reports user authenticated upon successful registration", function() {
         var testEvent = undefined;
         var testStatus = undefined;
         var userId = '0001';
         var userName = 'TestUser';
         var testPassword = 'testPassword';
         var displayName = 'Test User 1';
         var email = 'testuser1@chamrock.net';

         var CallBack = function(event, status) {
            testEvent = event;
            testStatus = status;
         }
         
         spyOn(server, "SetTokenUser");

         auth.AddCallback(CallBack);
         auth.RegisterUser(userName, testPassword, displayName, email);

         expect(auth.GetUserStatus()).toEqual(authenticator.status.AUTH_REQUESTED);

         jasmine.Ajax.requests.mostRecent().response(mock.UserResponse(userId,
                                                                       userName,
                                                                       testPassword,
                                                                       displayName,
                                                                       email));

         expect(testEvent).toEqual(auth.events.AUTH_REGISTRATION);
         expect(testStatus).toEqual(auth.status.AUTH_USER_AUTHENTICATED);
         expect(server.SetTokenUser).toHaveBeenCalledWith(userId);
         expect(auth.GetUserStatus()).toEqual(auth.status.AUTH_USER_AUTHENTICATED);
         expect(auth.GetUserId()).toEqual(userId);
         expect(auth.GetUserName()).toEqual(userName);
         expect(auth.GetUserDisplayName()).toEqual(displayName);
         expect(auth.GetUserEmail()).toEqual(email);
      });

      xit("reports authentication error with invalid username on authentication", function() {
      });

      xit("reports authentication error with invalid password on authentication", function() {
      });

      xit("reports user authenticated upon successful login", function() {
      });

   });

   describe("-when authenticated,", function() {

      xit("reports user un-authenticated upon receiving server error", function() {
      });

      xit("reports user un-authenticated upon user logout", function() {
      });

      xit("rescinds authentication token from server interface upon user un-authentication", function() {
      });

   });
});



},{"../../../src/js/utils/Authenticator.js":2,"../../../src/js/utils/ServerInterface.js":7,"./Data-MockServerInterface.js":10}],13:[function(require,module,exports){

// Pull in the module we're testing.
var gameData = require("../../../src/js/utils/GameDataManager.js");


describe("GameDataManager", function() {

   xit("registers callbacks with the server interface", function() {
      // spy on the game data to ensure it registers all callbacks with the 
      // server comms when it is initialized.
   });

   describe("-when no data exists,", function() {

      xit("retrieves game types from the server", function(done) {
         // Verify game types are retrieved from the server and stored in a file.
      });

      xit("retrieves a deck specification from the server", function(done) {
         // Verify deck specifications are retrieved from the server and stored
         // in files.
      });

      xit("retrieves user's games from the server", function(done) {
         // Verify user's games are retrieved from the server and stroed in files.
      });

      xit("retrieves user's joinable games from the server", function(done) {
         // These are not stored in a file.
      });

      // Not sure why this is necessary... ???
      xit("retrieves number of players in a game from the server", function(done) {
      });

   });

   describe("-when data exists in files,", function() {

      xit("populates game types from the file", function(done) {
      });

      xit("populates deck specifications from files", function(done) {
      });

      xit("populates user's games from files", function(done) {
      });

      xit("syncs game types with the server", function(done) {
      });

      xit("syncs deck specifications with the server", function(done) {
      });

      xit("syncs user's games with the server", function(done) {
      });
   });

} );


},{"../../../src/js/utils/GameDataManager.js":4}],14:[function(require,module,exports){

// Pull in the module we're testing.
var fileSystem = require("../../../src/js/utils/GameManager.js");

describe( "GameManager", function() {
} );



},{"../../../src/js/utils/GameManager.js":5}],15:[function(require,module,exports){

// Pull in the module we're testing.
var server = require("../../../src/js/utils/ServerInterface.js");
var mock = require("./Data-MockServerInterface.js");


describe( "ServerInterface", function() {
   // Terminology:
   //    "Indicate" - The status is returned when queried.
   //    "Report" - The module calls a call-back method.

   describe("-when adding a callback method,", function() {

      afterEach(function() {
         server.ResetCallbacks();
      });

      it("adds a valid callback method for the lowest event", function() {
         var TestCallBackAdd = function() {
            // Nothing needs to be done in this function
         };

         // Validate the lowest event
         var minStatus = server.AddCallback(1, TestCallBackAdd);
         expect(minStatus).toEqual(server.status.SI_SUCCESS);
         expect(server.callBacks[1]).toBeDefined();
         expect(server.callBacks[1]).toContain(TestCallBackAdd);
      });

      it("adds a valid callback method for the highest event", function() {
         var TestCallBackAdd = function() {
            // Nothing needs to be done in this function
         };

         // Validate the highest event
         var maxStatus = server.AddCallback((server.events.SI_MAX_EVENT - 1), TestCallBackAdd);
         expect(maxStatus).toEqual(server.status.SI_SUCCESS);
         expect(server.callBacks[(server.events.SI_MAX_EVENT - 1)]).toBeDefined();
         expect(server.callBacks[(server.events.SI_MAX_EVENT - 1)]).toContain(TestCallBackAdd);
      });
      
      it("indicates an error if the same callback is added twice", function() {
         var TestCallBackAdd = function() {
            // Nothing needs to be done in this function
         };

         // Validate the lowest event
         var minStatus = server.AddCallback(1, TestCallBackAdd);
         expect(minStatus).toEqual(server.status.SI_SUCCESS);
         expect(server.callBacks[1]).toBeDefined();
         expect(server.callBacks[1]).toContain(TestCallBackAdd);
         var newStatus = server.AddCallback(1, TestCallBackAdd);
         expect(newStatus).toEqual(server.status.SI_ERROR_CALLBACK_ALREADY_EXISTS);
         expect(server.callBacks[1].length).toEqual(1);
      });

      it("indicates an error for too low of an event", function() {
         var TestCallBackAdd = function() {
            // Nothing needs to be done in this function
         };

         // Validate 0 is an invalid number
         var minStatus = server.AddCallback(0, TestCallBackAdd);
         expect(minStatus).toEqual(server.status.SI_ERROR_INVALID_EVENT);
         expect(server.callBacks[0]).toBeUndefined();
      });

      it("indicates an error for too high of an event", function() {
         var TestCallBackAdd = function() {
            // Nothing needs to be done in this function
         };

         // Validate the maximum number is invalid
         var maxStatus = server.AddCallback(server.events.SI_MAX_EVENT, TestCallBackAdd);
         expect(maxStatus).toEqual(server.status.SI_ERROR_INVALID_EVENT);
         expect(server.callBacks[server.status.SI_MAX_EVENT]).toBeUndefined();
      });

      it("indicates an error for invalid callback method", function() {
         var TestCallBackAdd = "Just Testing";     // Oops! It's not a funciton!

         var status = server.AddCallback(1, TestCallBackAdd);
         expect(status).toEqual(server.status.SI_ERROR_INVALID_CALLBACK);
         expect(server.callBacks[1]).toBeUndefined();
      });

      it("calls back multiple functions with the same event", function() {
         var counter = 0;

         var CallBack1 = function(status, data) {
            if(status) {
               counter += 1;
            }
         };

         var CallBack2 = function(status, data) {
            if(status) {
               counter += 2;
            }
         };

         var status1 = server.AddCallback(server.events.SI_LOGIN, CallBack1);
         var status2 = server.AddCallback(server.events.SI_LOGIN, CallBack2);

         // Normally, this method is not called external of the ServerInterface;
         // However, for testing purposes...
         var status3 = server.CallBack(server.events.SI_LOGIN, true, undefined);

         expect(status1).toEqual(server.status.SI_SUCCESS);
         expect(status2).toEqual(server.status.SI_SUCCESS);
         expect(status3).toEqual(server.status.SI_SUCCESS);
         expect(counter).toEqual(3);
      });

   });

   describe("-when removing a callback method,", function() {
      var CallBackMin = function() {};
      var CallBackMax = function() {};

      beforeEach(function() {
         server.ResetCallbacks();

         server.AddCallback(1, CallBackMin);
         server.AddCallback((server.events.SI_MAX_EVENT - 1), CallBackMax);
      });

      afterEach(function() {
         server.ResetCallbacks();
      });

      it("removes a callback method from the minimum event", function() {
         var status = server.RemoveCallback(1, CallBackMin);
         expect(status).toEqual(server.status.SI_SUCCESS);
         expect(server.callBacks[1]).not.toContain(CallBackMin);
      });

      it("removes a callback method from the maximum event", function() {
         var status = server.RemoveCallback((server.events.SI_MAX_EVENT - 1), CallBackMax);
         expect(status).toEqual(server.status.SI_SUCCESS);
         expect(server.callBacks[(server.events.SI_MAX_EVENT - 1)]).not.toContain(CallBackMax);
      });

      it("indicates an error for too low of an event", function() {
         var status = server.RemoveCallback(0, CallBackMax);
         expect(status).toEqual(server.status.SI_ERROR_INVALID_EVENT);
      });

      it("indicates an error for too high of an event", function() {
         var status = server.RemoveCallback(server.events.SI_MAX_EVENT, CallBackMax);
         expect(status).toEqual(server.status.SI_ERROR_INVALID_EVENT);
      });

      it("indicates an error for invalid callback method", function() {
         var TestCallBackAdd = "Just Testing";     // Oops! It's not a funciton!

         var status = server.RemoveCallback(1, TestCallBackAdd);
         expect(status).toEqual(server.status.SI_ERROR_INVALID_CALLBACK);
         expect(server.callBacks[1]).toContain(CallBackMin);
      });

      it("indicates if the event is not found", function() {
         var status = server.RemoveCallback(2, CallBackMax);
         expect(status).toEqual(server.status.SI_ERROR_NOT_FOUND);
      });

      it("indicates if the method is not found", function() {
         var status = server.RemoveCallback(1, CallBackMax);
         expect(status).toEqual(server.status.SI_ERROR_NOT_FOUND);
         expect(server.callBacks[1]).toContain(CallBackMin);
      });
      
   });

   // The authentication token indicates a user is logged-in.  With no auth
   // token, certain functionality is not allowed.
   describe("-when registering a user,", function() {

      beforeEach(function() {
         jasmine.Ajax.install();
      });

      afterEach(function() {
         jasmine.Ajax.uninstall();
         server.ResetCallbacks();
      });

      it("reports an error on http timeout", function() {
         var status = undefined;

         var RegisterSuccess = function(callStatus, data) {
            status = callStatus;
         };

         var addStatus = server.AddCallback(server.events.SI_LOGIN, RegisterSuccess);
         server.RegisterUser('TestUser', 'TestPassword');
         jasmine.Ajax.requests.mostRecent().response(mock.ServerTimeout());

         expect(status).toEqual(server.status.SI_ERROR_SERVER_TIMEOUT);
      });

      it("reports an error on http error", function() {
         var status = undefined;

         var RegisterSuccess = function(callStatus, data) {
            status = callStatus;
         };

         var addStatus = server.AddCallback(server.events.SI_LOGIN, RegisterSuccess);
         server.RegisterUser('TestUser', 'TestPassword');
         jasmine.Ajax.requests.mostRecent().response(mock.ServerError());

         expect(status).toEqual(server.status.SI_FAILURE);
      });

      it("reports error if user exists", function() {
         var status = undefined;

         var RegisterSuccess = function(callStatus, data) {
            status = callStatus;
         };

         var addStatus = server.AddCallback(server.events.SI_LOGIN, RegisterSuccess);
         server.RegisterUser('TestUser', 'TestPassword');
         jasmine.Ajax.requests.mostRecent().response(mock.UserExists('TestUser'));

         expect(status).toEqual(server.status.SI_ERROR_REGISTER_NAME_EXISTS);
      });
      
      it("reports an error if the server responds with an error", function() {
         var status = undefined;

         var RegisterSuccess = function(callStatus, data) {
            status = callStatus;
         };

         var addStatus = server.AddCallback(server.events.SI_LOGIN, RegisterSuccess);
         server.RegisterUser('TestUser', 'TestPassword');
         jasmine.Ajax.requests.mostRecent().response(mock.DatabaseError());

         expect(status).toEqual(server.status.SI_ERROR_SERVER_DATABASE);
      });
      
      it("reports successful user registration", function() {
         var status = undefined;

         var RegisterSuccess = function(callStatus, data) {
            status = callStatus;
         };

         var addStatus = server.AddCallback(server.events.SI_LOGIN, RegisterSuccess);
         server.RegisterUser('TestUser', 'TestPassword', "Test User 1", "testuser1@chamrock.net");
         jasmine.Ajax.requests.mostRecent().response(mock.UserResponse('TestUser', 'TestPassword', "Test User 1", "testuser1@chamrock.net"));

         expect(status).toEqual(server.status.SI_SUCCESS);
      });
   });

   // The authentication token indicates a user is logged-in.  With no auth
   // token, certain functionality is not allowed.
   describe("-with no authentication token,", function() {

      beforeEach(function() {
         jasmine.Ajax.install();
      });

      afterEach(function() {
         jasmine.Ajax.uninstall();
         server.ResetCallbacks();
      });

      it("registers a user", function() {
         // At this point, we don't care about callbacks, just the return status
         var status = server.RegisterUser('TestUser', 'TestPassword', "Test User 1", "testuser1@chamrock.net");
         expect(status).toEqual(server.status.SI_SUCCESS);
      });

      it("logs-in a user", function() {
         // At this point, we don't care about callbacks, just the return status
         var status = server.LoginUser('TestUser', 'TestPassword');
         expect(status).toEqual(server.status.SI_SUCCESS);
      });

      xit("retrieves game types", function() {
      });

      xit("retrieves a deck specification", function() {
      });

      it("indicates not-connected when requested to retrieve user's games", function() {
         // At this point, we don't care about callbacks, just the return status
         var status = server.GetUserGames();
         expect(status).toEqual(server.status.SI_ERROR_TOKEN_INVALID);
      });

      it("indicates not-connected when requested to retrieve joinable games for user", function() {
         // At this point, we don't care about callbacks, just the return status
         var status = server.GetJoinableGames();
         expect(status).toEqual(server.status.SI_ERROR_TOKEN_INVALID);
      });

      it("indicates not-connected when requested to join a game", function() {
         // At this point, we don't care about callbacks, just the return status
         var status = server.JoinGame(1);
         expect(status).toEqual(server.status.SI_ERROR_TOKEN_INVALID);
      });

      it("indicates not-connected when requested to start a game", function() {
         // At this point, we don't care about callbacks, just the return status
         var status = server.StartGame(1);
         expect(status).toEqual(server.status.SI_ERROR_TOKEN_INVALID);
      });

      it("indicates not-connected when requested to record a transaction", function() {
         // At this point, we don't care about callbacks, just the return status
         var status = server.RecordTransaction(1, "from", "to", "{['SA', 'S2', 'S3'}]");
         expect(status).toEqual(server.status.SI_ERROR_TOKEN_INVALID);
      });

      it("indicates not-connected when requested to pause a game", function() {
         // At this point, we don't care about callbacks, just the return status
         var status = server.GetUserGames();
         expect(status).toEqual(server.status.SI_ERROR_TOKEN_INVALID);
      });

      it("indicates not-connected when requested to resume a game", function() {
         // At this point, we don't care about callbacks, just the return status
         var status = server.PauseGame(1);
         expect(status).toEqual(server.status.SI_ERROR_TOKEN_INVALID);
      });

      it("indicates not-connected when requested to end a game", function() {
         // At this point, we don't care about callbacks, just the return status
         var status = server.ResumeGame(1);
         expect(status).toEqual(server.status.SI_ERROR_TOKEN_INVALID);
      });

   });

   describe("-with authentication token,", function() {

      xit("accepts a token", function() {
      });
      
      xit("clears the token", function() {
      });

      xit("retrieves game types", function() {
      });

      xit("retrieves a deck specification", function() {
      });

      xit("retrieves user's games", function() {
      });

      xit("retrieves joinable games for user", function() {
      });

      xit("joins a game", function() {
      });

      xit("starts a game", function() {
      });

      xit("records a transaction", function() {
      });

      xit("pauses a game", function() {
      });

      xit("resumes a game", function() {
      });

      xit("ends a game", function() {
      });

   });

   // Not sure why this is necessary... ???
   xit("retrieves number of players in a game", function(done) {
   });

} );


},{"../../../src/js/utils/ServerInterface.js":7,"./Data-MockServerInterface.js":10}]},{},[9]);

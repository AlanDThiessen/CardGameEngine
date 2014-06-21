(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*******************************************************************************
 * 
 * main.js
 * 
 * This file provides the main entry point for the application!
 * 
 ******************************************************************************/

var FS = require('./utils/FileSystem.js');
var config = require('./utils/config.js');
var log = require('./utils/Logger.js');
var server = require('./utils/Server.js');


function main ()
{
   document.addEventListener('deviceready', OnDeviceReady, false);
}


function OnDeviceReady() {
   FS.InitFileSystem(FileSystemReady);
}

function BrowserMain() {
   FS.InitFileSystem(FileSystemReady);
}


function FileSystemReady() {
   //alert("Filesystem ready!");
   log.SetMask(0xFE);
   log.FileSystemReady();
  
   setTimeout(LoginToServer, 1000);
}

function LoginToServer() {
   server.LoginUser('athiessen', 'hello');
}



if (typeof window === 'undefined') {
   main();
}
else {
   window.addEventListener('load', BrowserMain, false);
}

},{"./utils/FileSystem.js":3,"./utils/Logger.js":4,"./utils/Server.js":5,"./utils/config.js":6}],2:[function(require,module,exports){

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
            failure();
         }
      }
   }
}

module.exports = ajax;

},{"./Logger.js":4}],3:[function(require,module,exports){
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

// Variable holding the directory entries
var dirEntries = {appStorageDir: undefined,
                  gamesDefsDir: undefined,
                  deckDefsDir: undefined,
                  activeGamesDir: undefined
                  };

// File Object
function FileEntity(name, onReady, onWriteEnd, fileEntry) {
   this.name = name;
   this.entry = fileEntry;
   this.writer = undefined;
   this.onReady = onReady;          // Callback when ready to write
   this.onWriteEnd = onWriteEnd;    // Callback when finished writing
}

// Array to hold the FileEntry objects that are open
var fileEntries = {log: undefined,
                   gameSummary: undefined,
                   gameDefs: [],
                   deckDefs: [],
                   games: []
                   };


/*******************************************************************************
 * Initialization Methods
 ******************************************************************************/
// InitFileSystem() should always be called once at app startup
// Note: This function cannot be called until after the Device Ready event.
function InitFileSystem(onReady) {
   fileSystemGo = false;
   onReadyCallback = onReady;
   RequestFileSystem();
}


function RequestFileSystem() {
   //log.info("Requesting file system");
   window.requestFileSystem(LocalFileSystem.PERSISTENT,
                            STORAGE_SIZE_BYTES,
                            InitDirectories,                                       // Success
                            function(error){FSError(error, 'RequestFileSystem');} // Error
                            );
}


function InitDirectories(fileSystem) {
   // First, retrieve the application storage location using Cordova libraries
   dirEntries.appStorageDir = fileSystem.root;
 
   if((dirEntries.gamesDefsDir === undefined) ||
      (dirEntries.deckDefsDir === undefined) ||
      (dirEntries.activeGamesDir === undefined)){
      // Attempt to read the dir entries
      //log.info("Retrieving game directories");
      dirReader = new DirectoryReader(dirEntries.appStorageDir.toURL());
      dirReader.readEntries(ReadRootDir, function(error){FSError(error, 'Read Directory');});
   }
   else {
      //log.info("Game directory objects already exist");
      SetFileSystemReady();
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
            alert('Found game summary file!');
            fileEntries.gameSummary = new FileEntity(entries[cntr].name, undefined, undefined, entries[cntr]);
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
      SetFileSystemReady();
   }
}


function DirectoryCreated(entry) {
   SetRootDirEntry(entry);

   if((dirEntries.gamesDefsDir !== undefined) &&
      (dirEntries.deckDefsDir !== undefined) &&
      (dirEntries.activeGamesDir !== undefined)){
      SetFileSystemReady();
   }
}


function SetFileSystemReady() {
   //log.info("Filesystem is ready to go!");
   fileSystemGo = true;
   
   if(typeof onReadyCallback === "function") {
      onReadyCallback();
   }
}


/*******************************************************************************
 * File Entity Methods
 ******************************************************************************/
function OpenFileEntity(entity) {
   // If the file entry is undefined, then we need to get the file
   if(entity.entry === undefined) {
      if(dirEntries.appStorageDir !== undefined) {
         dirEntries.appStorageDir.getFile(LOG_FILE_NAME,
                                          {create: true, exclusive: false},
                                          function(entry){entity.entry = entry; FileEntityCreateWriter(entity);},
                                          function(error){FSError(error, 'Open log file');}
                                         );
      }
      else {
         //log.warn("App storage not defined. Cannot create log file");
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
                                function(error){FSError(error, "GetLogFileWriter");}
                                );
   }
}


function FileEntitySetWriter(entity, writer) {
   if(entity !== undefined) {
      entity.writer = writer;
      entity.writer.onwriteend = entity.onWriteEnd;
      FileEntityReady(entity, true);
   }
   else {
      FileEntityReady(entity, false);
   }
}

   
function FileEntityReady(entity, ready) {
   if((entity.entry !== undefined) &&
      (typeof entity.onReady === "function")) {
      entity.onReady(ready);
   }
}


/*******************************************************************************
 * File Methods
 ******************************************************************************/
function OpenLogFile(onReady, onWriteEnd) {
   // If the entry is undefined, then create one
   if(fileEntries.log === undefined) {
      fileEntries.log = new FileEntity(LOG_FILE_NAME, onReady, onWriteEnd, undefined);
   }

   OpenFileEntity(fileEntries.log);
}


function WriteLogFile(append, data) {
   if((fileEntries.log !== undefined) &&
      (fileEntries.log.writer !== undefined)) {
      if(append) {
         fileEntries.log.writer.seek(fileEntries.log.writer.length);
      }
      else {
         fileEntries.log.writer.seek(0);
      }
      
      fileEntries.log.writer.write(data);
   }
}



/*******************************************************************************
 * Error Handler
 ******************************************************************************/
function FSError(error, location) {
   var errorStr = "FS: ";
   
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
   
   //log.error(errorStr);
   
   alert(errorStr);
}


module.exports = {
                  InitFileSystem: InitFileSystem,
                  OpenLogFile:    OpenLogFile,
                  WriteLogFile:   WriteLogFile
                  };


},{}],4:[function(require,module,exports){
var config = require("./config.js");
var FS = require("./FileSystem.js");

log = { };

log.DEBUG   = 0x01;
log.INFO    = 0x02;
log.WARN    = 0x04;
log.ERROR   = 0x08;

log.toFile = false;
log.toConsole = false;
log.fileReady = false;
log.mask = 0xFF;
//log.mask = config.GetLogMask() || (log.WARN | log.ERROR);

log.SetMask = function(value) {
   log.mask = value;
}

log.SetLogToConsole = function(value) {
   log.toConsole = value;
};

log.SetLogToFile = function(value) {
   log.toFile = value;
};

log.FileSystemReady = function() {
   FS.OpenLogFile(log.LogFileReady, log.LogFileWriteComplete);
}


log.LogFileReady = function(ready) {
   log.fileReady = true;
   //log.mask = 0xFF;
   log.info("App Log Startup");
}

log.LogFileWriteComplete = function() {
   log.fileReady = true;
}


log.GetDate = function() {
   var date = new Date();
   dateStr  = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
   dateStr += " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + "." + date.getMilliseconds();
   return dateStr;
}


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
}


module.exports = log;

},{"./FileSystem.js":3,"./config.js":6}],5:[function(require,module,exports){

ajax = require("./Ajax.js");
log = require("./Logger.js");

server = {};


/******************************************************************************
 * Register User
 ******************************************************************************/
server.RegisterUser = function(username, password) {
   var postData = {
      'action': 'cge_register_user',
      'username': username,
      'password': password,
      'display_name': displayName,
      'email': email
   };

   ajax.ServerPost(postData, server.LoginUserSuccess, server.Failure);
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

   ajax.ServerPost(postData, server.LoginUserSuccess, server.Failure);
};


server.LoginUserSuccess = function(user) {
   alert("Logged in as: " + user.display_name);
   log.info("Logged in as: " + user.display_name);
   
   // Now, get the user's games.
   server.GetUserGames(user.id);
};


/******************************************************************************
 * Get User Games
 ******************************************************************************/
server.GetUserGames = function(userId) {
   var postData = {
      'action': 'cge_get_my_games',
      'user_id': userId
   };
   
   ajax.ServerPost(postData, server.GetUserGamesSuccess, server.Failure);
};


server.GetUserGamesSuccess = function(games) {
   var cntr;
   var gameNames = "";
   
   for(cntr = 0; cntr < games.length; cntr++) {
      gameNames += '"' + games[cntr].game_name + '", ';
   }
   
   alert("There are " + games.length + " games: " + gameNames);
   log.info("There are " + games.length + " games: " + gameNames);
};

/******************************************************************************
 * Get Game Types
 ******************************************************************************/ 
server.GetGameTypes = function() {
   var postData = {
      'action': 'cge_get_game_types'
   };
   
   ajax.ServerPost(postData, server.GetGameTypesSuccess, server.Failure);
};


server.GetGameTypesSuccess = function(gameTypes) {
};


/******************************************************************************
 * Get Joinable Games
 ******************************************************************************/ 
server.GetJoinableGames = function(userId) {
   var postData = {
      'action': 'cge_get_joinable_games',
      'user_id': userId
   };
   
   ajax.ServerPost(postData, server.GetJoinableGamesSuccess, server.Failure);
};


server.GetJoinableGamesSuccess = function(joinableGames) {
};

   
/******************************************************************************
 * Join Game
 ******************************************************************************/
server.JoinGame = function(userId, gameId) {
   var postData = {
      'action': 'cge_join_game',
      'game_id': gameId,
      'user_id': userId
   };
   
   ajax.ServerPost(postData, server.JoinGameSuccess, server.Failure);
};


server.JoinGameSuccess = function(game) {
};


/******************************************************************************
 * Start Game
 ******************************************************************************/ 
server.StartGame = function(userId, gameId) {
   var postData = {
      'action': 'cge_start_game',
      'user_id': userId,
      'game_type_id': gameId
   };
   
   ajax.ServerPost(postData, server.StartGameSuccess, server.Failure);
};


server.StartGameSuccess = function(game) {
};


/******************************************************************************
 * Load Deck Spec
 ******************************************************************************/ 
server.LoadDeckSpec = function(deckTypeId) {
   var postData = {
      'action': 'cge_load_deck_spec',
      'deck_type_id': deckTypeId
   };
   
   ajax.ServerPost(postData, server.LoadDeckSpecSuccess, server.Failure);
};


server.LoadDeckSpecSuccess = function(game) {
};


/******************************************************************************
 * 
 ******************************************************************************/ 
server.GetNumPlayersInGame = function(gameId) {
   var postData = {
      'action': 'cge_get_num_players',
      'game_id': gameId
   };
   
   ajax.ServerPost(postData, server.GetNumPlayersInGameSuccess, server.Failure);
};


server.GetNumPlayersInGameSuccess = function(game) {
};


/******************************************************************************
 * Record Transaction
 ******************************************************************************/ 
server.RecordTransaction = function(userId,
                                    gameId,
                                    fromContainer,
                                    toContainer,
                                    cards) {
   var postData = {
      'action': 'cge_record_transaction',
      'game_id': gameId,
      'user_id': userId,
      'from_group_id': fromContainer,
      'to_group_id': toContainer,
      'items': cards
   };
   
   ajax.ServerPost(postData, server.RecordTransactionSuccess, server.Failure);
};


server.RecordTransactionSuccess = function(response) {
};


/******************************************************************************
 * Pause Game
 ******************************************************************************/ 
server.PauseGame = function(userId, gameId) {
   var postData = {
      'action': 'cge_pause_game',
      'game_id': gameId,
      'user_id': userId
   };
   
   ajax.ServerPost(postData, server.PauseGameSuccess, server.Failure);
};


server.PauseGameSuccess = function(success) {
};


/******************************************************************************
 * Resume Game
 ******************************************************************************/ 
server.ResumeGame = function(userId, gameId) {
   var postData = {
      'action': 'cge_resume_game',
      'game_id': gameId,
      'user_id': userId
   };
   
   ajax.ServerPost(postData, server.ResumeGameSuccess, server.Failure);
};


server.ResumeGameSuccess = function(success) {
};


/******************************************************************************
 * End Game
 ******************************************************************************/ 
server.EndGame = function(userId, gameId) {
   var postData = {
      'action': 'cge_end_game',
      'game_id': gameId,
      'user_id': userId
   };
   
   ajax.ServerPost(postData, server.EndGameSuccess, server.Failure);
};


server.EndGameSuccess = function(success) {
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
   
   ajax.ServerPost(postData, server.AckEventSuccess, server.Failure);
};


server.AckEventSuccess = function(game) {
};


/******************************************************************************
 * Failure to Send - TODO: Needs some thought
 ******************************************************************************/ 
server.Failure = function() {
   log.warn("Ajax Request Failed");
   alert("Ajax Request Failed");
};



module.exports = server;

},{"./Ajax.js":2,"./Logger.js":4}],6:[function(require,module,exports){

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

},{}]},{},[1])
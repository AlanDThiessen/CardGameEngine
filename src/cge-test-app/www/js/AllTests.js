(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

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

},{"./Logger.js":4}],2:[function(require,module,exports){

module.exports = {
};


},{}],3:[function(require,module,exports){
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
//   alert("Ajax Request Failed");
};



module.exports = server;

},{"./Ajax.js":1,"./Logger.js":4}],6:[function(require,module,exports){

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

},{}],7:[function(require,module,exports){

require("./TestFileModule.js");
require("./TestLogger.js");
require("./TestCGEServer.js");
require("./TestGameData.js");

},{"./TestCGEServer.js":10,"./TestFileModule.js":11,"./TestGameData.js":12,"./TestLogger.js":13}],8:[function(require,module,exports){
module.exports = {
  "cge_deck": {
    "id": "standard",
    "name": "Standard Deck",
    "suited": {
      "suits": {
        "suit": [
          {
            "id": "clubs",
            "name": "Clubs",
            "shortname": "C",
            "color": "black"
          },
          {
            "id": "hearts",
            "name": "Hearts",
            "shortname": "H",
            "color": "red"
          },
          {
            "id": "spades",
            "name": "Spades",
            "shortname": "S",
            "color": "black"
          },
          {
            "id": "diamonds",
            "name": "Diamonds",
            "shortname": "D",
            "color": "red"
          }
        ]
      },
      "values": {
        "value": [
          {
            "id": "2",
            "name": "Two",
            "shortname": "2",
            "rank": "2",
            "quantity": "1"
          },
          {
            "id": "3",
            "name": "Three",
            "shortname": "3",
            "rank": "3",
            "quantity": "1"
          },
          {
            "id": "4",
            "name": "Four",
            "shortname": "4",
            "rank": "4",
            "quantity": "1"
          },
          {
            "id": "5",
            "name": "Five",
            "shortname": "5",
            "rank": "5",
            "quantity": "1"
          },
          {
            "id": "6",
            "name": "Six",
            "shortname": "6",
            "rank": "6",
            "quantity": "1"
          },
          {
            "id": "7",
            "name": "Seven",
            "shortname": "7",
            "rank": "7",
            "quantity": "1"
          },
          {
            "id": "8",
            "name": "Eight",
            "shortname": "8",
            "rank": "8",
            "quantity": "1"
          },
          {
            "id": "9",
            "name": "Nine",
            "shortname": "9",
            "rank": "9",
            "quantity": "1"
          },
          {
            "id": "10",
            "name": "Ten",
            "shortname": "10",
            "rank": "10",
            "quantity": "1"
          },
          {
            "id": "J",
            "name": "Jack",
            "shortname": "J",
            "rank": "11",
            "quantity": "1"
          },
          {
            "id": "Q",
            "name": "Queen",
            "shortname": "Q",
            "rank": "12",
            "quantity": "1"
          },
          {
            "id": "K",
            "name": "King",
            "shortname": "K",
            "rank": "13",
            "quantity": "1"
          },
          {
            "id": "A",
            "name": "Ace",
            "shortname": "A",
            "rank": "14",
            "quantity": "1"
          }
        ]
      }
    },
    "nonsuited": {
      "values": {
        "value": {
          "id": "joker",
          "name": "Joker",
          "shortname": "Joker",
          "rank": "0",
          "quantity": "2",
          "color": "black"
        }
      }
    }
  }
};


},{}],9:[function(require,module,exports){
module.exports = {
  "cge_game": {
    "id": "simple-war",
    "name": "Simple War",
    "required": {
      "deck": "standard",
      "minPlayers": "2",
      "maxPlayers": "4"
    },
    "server": {
      "isPrimary": "false",
      "players": ""
    }
  }
};


},{}],10:[function(require,module,exports){

// Pull in the module we're testing.
var server = require("../../../src/js/utils/Server.js");


describe( "CGEServer", function() {

   xit("registers a user", function(done) {
   });

   xit("logs-in a user", function(done) {
   });

   xit("retrieves user's games", function(done) {
   });

   xit("retrieves game types", function(done) {
   });

   xit("retrieves a deck specification", function(done) {
   });

   xit("retrieves joinable games for user", function(done) {
   });

   // Not sure why this is necessary... ???
   xit("retrieves number of players in a game", function(done) {
   });

   xit("joins a game", function(done) {
   });

   xit("starts a game", function(done) {
   });

   xit("records a transaction", function(done) {
   });

   xit("pauses a game", function(done) {
   });

   xit("resumes a game", function(done) {
   });

   xit("ends a game", function(done) {
   });

} );


},{"../../../src/js/utils/Server.js":5}],11:[function(require,module,exports){

// Pull in the module we're testing.
var fileSystem = require("../../../src/js/utils/FileSystem.js");
var dataDeckSpec = require("./Data-DeckSpec.js");
var dataGameSpec = require("./Data-GameSpec.js");


describe( "FileModule", function() {
   var fsStatus = false;
   var fsError = null;
   var testStr1 = "Test writing to the file.";
   var testStr2 = "Test appending to the file.";

   beforeEach(function() {
      fsStatus = false;
      fsError = null;
   });

   var CommonExpectations = function() {
      expect(fsError).toBeNull();
      expect(fsStatus).toBeTruthy();
   };

   it("initializes the file system", function(done) {
      var OnReady = function(status) {
         fsStatus = status;
         CommonExpectations();
         InitExpectations();
         done();
      };

      var Failure = function(errorCode, errorStr) {
         fsError = errorStr;
         CommonExpectations();
         done();
      };

      var InitExpectations = function() {
         expect(fileSystem.dirEntries.appStorageDir).toBeDefined();
         expect(fileSystem.dirEntries.gamesDefsDir).toBeDefined();
         expect(fileSystem.dirEntries.deckDefsDir).toBeDefined();
         expect(fileSystem.dirEntries.activeGamesDir).toBeDefined();

         expect(fileSystem.dirEntries.appStorageDir.isDirectory).toBeTruthy();
         expect(fileSystem.dirEntries.gamesDefsDir.isDirectory).toBeTruthy();
         expect(fileSystem.dirEntries.deckDefsDir.isDirectory).toBeTruthy();
         expect(fileSystem.dirEntries.activeGamesDir.isDirectory).toBeTruthy();
      };

      fileSystem.InitFileSystem(OnReady, Failure);
   });

   it("opens the log file", function(done) {
      var OnOpenReady = function(status) {
         fsStatus = status;
         CommonExpectations();
         OpenLogExpectations();
         done();
      };

      var OnOpenEnd = function() {
         // Do nothing here.
      };

      var Failure = function(errorCode, errorStr) {
         fsError = errorStr;
         CommonExpectations();
         done();
      };

      var OpenLogExpectations = function() {
         expect(fileSystem.fileEntries.log).toBeDefined();
         expect(fileSystem.fileEntries.log.entry.isFile).toBeTruthy();
         expect(fileSystem.fileEntries.log.writer).toBeDefined();
      };

      fileSystem.SetErrorCallback(Failure);
      fileSystem.OpenLogFile(OnOpenReady, OnOpenEnd);
   });

   it("writes the log file", function(done) {
      var OnWriteReady = function(status) {
         fsStatus = status;
      };

      var OnWriteEnd = function() {
         CommonExpectations();
         WriteLogExpectations();
         done();
      };

      var Failure = function(errorCode, errorStr) {
         fsError = errorStr;
         CommonExpectations();
         done();
      };

      var WriteLogExpectations = function() {
         expect(fileSystem.fileEntries.log).toBeDefined();
         expect(fileSystem.fileEntries.log.entry.isFile).toBeTruthy();
         expect(fileSystem.fileEntries.log.writer).toBeDefined();
         expect(fileSystem.fileEntries.log.writer.length).toEqual(testStr1.length);
      };

      fileSystem.SetErrorCallback(Failure);
      // Log file should already be open, just change its callbacks
      fileSystem.OpenLogFile(OnWriteReady, OnWriteEnd);
      fileSystem.WriteLogFile(false, testStr1);
   });

   it("appends the log file", function(done) {
      var OnAppendReady = function(status) {
         fsStatus = status;
      };

      var OnAppendEnd = function() {
         CommonExpectations();
         AppendLogExpectations();
         done();
      };

      var Failure = function(errorCode, errorStr) {
         fsError = errorStr;
         CommonExpectations();
         done();
      };

      var AppendLogExpectations = function() {
         expect(fileSystem.fileEntries.log).toBeDefined();
         expect(fileSystem.fileEntries.log.entry.isFile).toBeTruthy();
         expect(fileSystem.fileEntries.log.writer).toBeDefined();
         expect(fileSystem.fileEntries.log.writer.length).toEqual(testStr1.length + testStr2.length);
      };

      fileSystem.SetErrorCallback(Failure);
      // Log file should already be open, just change its callbacks
      fileSystem.OpenLogFile(OnAppendReady, OnAppendEnd);
      fileSystem.WriteLogFile(false, testStr2);
   });

   it("reads the log file", function(done) {
      var OnReadComplete = function(data) {
         fsStatus = true;
         CommonExpectations();
         ReadLogExpectations(data);
         done();
      };

      var Failure = function(errorCode, errorStr) {
         fsError = errorStr;
         CommonExpectations();
         done();
      };

      var ReadLogExpectations = function(data) {
         expect(data.length).toEqual(testStr1.length + testStr2.length);
      };

      fileSystem.SetErrorCallback(Failure);
      // Log file should already be open, just change its callbacks
      fileSystem.ReadLogFile(OnReadComplete);
   });

   it("clears the log file", function(done) {
      var OnClearReady = function(status) {
         fsStatus = status;
      };

      var OnClearEnd = function() {
         CommonExpectations();
         ClearLogExpectations();
         done();
      };

      var Failure = function(errorCode, errorStr) {
         fsError = errorStr;
         CommonExpectations();
         done();
      };

      var ClearLogExpectations = function() {
         expect(fileSystem.fileEntries.log).toBeDefined();
         expect(fileSystem.fileEntries.log.entry.isFile).toBeTruthy();
         expect(fileSystem.fileEntries.log.writer).toBeDefined();
         expect(fileSystem.fileEntries.log.writer.length).toEqual(0);
      };

      fileSystem.SetErrorCallback(Failure);
      // Log file should already be open, just change its callbacks
      fileSystem.OpenLogFile(OnClearReady, OnClearEnd);
      fileSystem.ClearLogFile();
   });

   it("writes a deck specification file", function(done) {
      var OnWriteDeck = function() {
         fsStatus = true;
         CommonExpectations();
         WriteDeckSpecExpectations();
         done();
      };

      var Failure = function(errorCode, errorStr) {
         fsError = errorStr;
         CommonExpectations();
         done();
      };

      var WriteDeckSpecExpectations = function() {
         expect(fileSystem.fileEntries.deckDefs['standard']).toBeDefined();
         expect(fileSystem.fileEntries.deckDefs['standard'].entry.isFile).toBeTruthy();
         expect(fileSystem.fileEntries.deckDefs['standard'].writer).toBeDefined();
//         expect(fileSystem.fileEntries.deckDefs['standard'].writer.length).toEqual(dataDeckSpec.toJSON().length);
      };

      fileSystem.SetErrorCallback(Failure);
      // Log file should already be open, just change its callbacks
      fileSystem.WriteDeckSpec(dataDeckSpec['cge_deck']['id'], dataDeckSpec, OnWriteDeck);
   });

   it("reads a deck specification file", function(done) {
      var OnReadDeck = function(deckSpec) {
         fsStatus = true;
         CommonExpectations();
         ReadDeckSpecExpectations(deckSpec);
         done();
      };

      var Failure = function(errorCode, errorStr) {
         fsError = errorStr;
         CommonExpectations();
         done();
      };

      var ReadDeckSpecExpectations = function(deckSpec) {
         expect(deckSpec).toBeDefined();
         expect(deckSpec).toEqual(dataDeckSpec);
      };

      fileSystem.SetErrorCallback(Failure);
      // Log file should already be open, just change its callbacks
      fileSystem.ReadDeckSpec("standard", OnReadDeck);
   });

   it("writes a game specification file", function(done) {
      var OnWriteGame = function() {
         fsStatus = true;
         CommonExpectations();
         WriteGameSpecExpectations();
         done();
      };

      var Failure = function(errorCode, errorStr) {
         fsError = errorStr;
         CommonExpectations();
         done();
      };

      var WriteGameSpecExpectations = function() {
         expect(fileSystem.fileEntries.gameDefs['simple-war']).toBeDefined();
         expect(fileSystem.fileEntries.gameDefs['simple-war'].entry.isFile).toBeTruthy();
         expect(fileSystem.fileEntries.gameDefs['simple-war'].writer).toBeDefined();
//         expect(fileSystem.fileEntries.deckDefs['standard'].writer.length).toEqual(dataDeckSpec.toJSON().length);
      };

      fileSystem.SetErrorCallback(Failure);
      // Log file should already be open, just change its callbacks
      fileSystem.WriteGameSpec(dataGameSpec['cge_game']['id'], dataGameSpec, OnWriteGame);
   });

   it("reads a game specification file", function(done) {
      var OnReadGame = function(gameSpec) {
         fsStatus = true;
         CommonExpectations();
         ReadGameSpecExpectations(gameSpec);
         done();
      };

      var Failure = function(errorCode, errorStr) {
         fsError = errorStr;
         CommonExpectations();
         done();
      };

      var ReadGameSpecExpectations = function(gameSpec) {
         expect(gameSpec).toBeDefined();
         expect(gameSpec).toEqual(dataGameSpec);
      };

      fileSystem.SetErrorCallback(Failure);
      // Log file should already be open, just change its callbacks
      fileSystem.ReadGameSpec("simple-war", OnReadGame);
   });

   xit("writes a game file for a given user", function() {
   });

   xit("reads a game file for a given user", function() {
   });
});


},{"../../../src/js/utils/FileSystem.js":3,"./Data-DeckSpec.js":8,"./Data-GameSpec.js":9}],12:[function(require,module,exports){

// Pull in the module we're testing.
var gameData = require("../../../src/js/utils/CGEGameData.js");


describe("gameData", function() {

   xit("registers callbacks with the server", function() {
      // spy on the game data to ensure it registers all callbacks with the 
      // server comms when it is initialized.
   });

   describe("when no data exists", function() {
      
      xit("retrieves game types from the server", function(done) {
         // Verify game types are retrieved from the server and stored in a file.
      });

      xit("retrieves a deck specification", function(done) {
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

   describe("when data exists in files", function() {
      
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


},{"../../../src/js/utils/CGEGameData.js":2}],13:[function(require,module,exports){

// Pull in the module we're testing.
var fileSystem = require("../../../src/js/utils/FileSystem.js");
var logger = require("../../../src/js/utils/Logger.js");

describe("Logger", function () {

   var fsStatus = false;

   it("should write to the log file", function (done) {

      // fileSystem.SetErrorCallback(function (errorCode, errorStr) {
      //    expect(errorStr).toBeNull();
      //    expect(fsStatus).toBeTruthy();
      //    done();
      // });

      // fileSystem.OpenLogFile(

      //    function (status) {
      //       fsStatus = status;
      //    },

      //     function () {
      //       expect(fileSystem.fileEntries.log).toBeDefined();
      //       done();
      //        // logger.debug("test");

      //        // setTimeout(function () {
      //        //    expect(fileSystem.fileEntries.log.writer.length).toEqual("test\n".length);
      //        //    done();
      //        // }, 250);
      //     }
      // );

      // fileSystem.ClearLogFile();

      var OnClearReady = function(status) {
         console.log("OnClearReady");
         fsStatus = status;
      };

      var OnClearEnd = function() {
//         CommonExpectations();
//         ClearLogExpectations();
         //expect(true).toBeTruthy();
         console.log("OnClearEnd");
         done();
      };

      var Failure = function(errorCode, errorStr) {
         fsError = errorStr;
//         CommonExpectations();
         expect(false).toBeTruthy();
         console.log("Failure");
         done();
      };

      var ClearLogExpectations = function() {
         expect(fileSystem.fileEntries.log).toBeDefined();
         expect(fileSystem.fileEntries.log.entry.isFile).toBeTruthy();
         expect(fileSystem.fileEntries.log.writer).toBeDefined();
         expect(fileSystem.fileEntries.log.writer.length).toEqual(0);
      };

      console.log("Running logger test");

      fileSystem.SetErrorCallback(Failure);
      // Log file should already be open, just change its callbacks
      fileSystem.OpenLogFile(OnClearReady, OnClearEnd);
      fileSystem.ClearLogFile();
   });
});
},{"../../../src/js/utils/FileSystem.js":3,"../../../src/js/utils/Logger.js":4}]},{},[7])
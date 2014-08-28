(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
function OpenFileEntity(entity) {
   // If the file entry is undefined, then we need to get the file
   if(entity.entry === undefined) {
      if(dirEntries.appStorageDir !== undefined) {
         dirEntries.appStorageDir.getFile(entity.name,
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


function GetStatus() {
   return fileSystemGo;
}


function GetError() {
   return fsError;
}


/*******************************************************************************
 * File Methods
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

   OpenFileEntity(fileEntries.log);
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
   
   //alert(errorStr);
   fsError = errorStr;

   if(typeof onErrorCallback === "function") {
      onErrorCallback(error.code, errorStr);
   }
}


module.exports = {
                  InitFileSystem:   InitFileSystem,
                  SetErrorCallback: SetErrorCallback,
                  OpenLogFile:      OpenLogFile,
                  WriteLogFile:     WriteLogFile,
                  ClearLogFile:     ClearLogFile,
                  GetStatus:        GetStatus,
                  GetError:         GetError,
                  dirEntries:       dirEntries,
                  fileEntries:      fileEntries
                  };


},{}],2:[function(require,module,exports){
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

},{"./FileSystem.js":1,"./config.js":3}],3:[function(require,module,exports){

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

},{}],4:[function(require,module,exports){

require("./TestFileModule.js");
require("./TestLogger.js");


},{"./TestFileModule.js":5,"./TestLogger.js":6}],5:[function(require,module,exports){

// Pull in the module we're testing.
var fileSystem = require("../../../src/js/utils/FileSystem.js");


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

   xit("reads the log file", function() {
   });

   it("clears the log file", function() {
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

   xit("writes a deck specification file", function() {
   });

   xit("reads a deck specification file", function() {
   });

   xit("writes a game specification file", function() {
   });

   xit("reads a game specification file", function() {
   });

   xit("writes a game file for a given user", function() {
   });

   xit("reads a game file for a given user", function() {
   });
});


},{"../../../src/js/utils/FileSystem.js":1}],6:[function(require,module,exports){

// Pull in the module we're testing.
var fileSystem = require("../../../src/js/utils/FileSystem.js");
var logger = require("../../../src/js/utils/Logger.js");

describe("Logger", function () {

   var fsStatus = false;

   it("should write to the log file", function (done) {

      fileSystem.SetErrorCallback(function (errorCode, errorStr) {
         expect(errorStr).toBeNull();
         expect(fsStatus).toBeTruthy();
         done();
      });

      fileSystem.OpenLogFile(

         function (status) {
            fsStatus = status;
         },

          function () {
            expect(fileSystem.fileEntries.log).toBeDefined();
            done();
             // logger.debug("test");

             // setTimeout(function () {
             //    expect(fileSystem.fileEntries.log.writer.length).toEqual("test\n".length);
             //    done();
             // }, 250);
          }
      );

      fileSystem.ClearLogFile();
   });
});
},{"../../../src/js/utils/FileSystem.js":1,"../../../src/js/utils/Logger.js":2}]},{},[4])
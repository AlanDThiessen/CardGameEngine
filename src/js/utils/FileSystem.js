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
   if(typeof LocalFileSystem !== "undefined") {
      window.requestFileSystem(LocalFileSystem.PERSISTENT,
                               STORAGE_SIZE_BYTES,
                               InitDirectories,                                       // Success
                               function(error){FSError(error, 'RequestFileSystem');} // Error
                               );
   }
   else if(typeof onReadyCallback === "function") {
      onReadyCallback(false);
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


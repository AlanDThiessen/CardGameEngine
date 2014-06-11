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

var log = require('./Logger.js');

var STORAGE_SIZE_BYTES = 512;
var GAME_DEFS_DIR      = "gameDefs";
var DECK_DEFS_DIR      = "deckDefs";
var ACTIVE_GAMES_DIR   = "games";

var fileSystemGo    = false;       // Whether the fileSystem is usable

// Variable holding the directory entries
var dirEntries = {appStorageDir: undefined,
                  gamesDefsDir: undefined,
                  deckDefsDir: undefined,
                  activeGamesDir: undefined
                  };


// InitFileSystem() should always be called once at app startup
// Note: This function cannot be called until after the Device Ready event.
function InitFileSystem() {
   fileSystemGo = false;
   RequestFileSystem();
}


function RequestFileSystem() {
   log.info("Requesting file system");
   window.requestFileSystem(LocalFileSystem.PERSISTENT,
                            STORAGE_SIZE_BYTES,
                            InitDirectories,                                       // Success
                            function(error){FSError(error, 'RequestFileSystem');} // Error
                            );
}


function InitDirectories() {
   // First, retrieve the application storage location using Cordova libraries
   dirEntries.appStorageDir = window.resolveLocalFileSystemURL(cordova.file.applicationStorageDirectory);
 
   if((dirEntries.gamesDefsDir === undefined) ||
      (dirEntries.deckDefsDir === undefined) ||
      (dirEntries.activeGamesDir === undefined)){
      // Attempt to read the dir entries
      log.info("Retrieving game directories");
      dirReader = new DirectoryReader(cordova.file.applicationStorageDirectory);
      dirReader.readEntries(CheckIfGameDirsExist, function(error){FSError(error, 'Read Directory');});
   }
   else {
      log.info("Game directory objects already exist");
      SetFileSystemReady();
   }
}


function CheckIfGameDirsExist(entries){
   // Go through looking for our entries
   for(cntr = 0; cntr < entries.length; cntr++) {
      SetDirEntry(entries[cntr]);
   }
   
   // Create directories if they don't exist
   if(dirEntries.gameDefsDir === undefined) {
      log.info("Creating directory: " + GAME_DEFS_DIR );
      dirEntries.appStorageDir.getDirectory(GAME_DEFS_DIR,
                                            {create: true, exclusive: false},
                                            DirectoryCreated,
                                            function(error){FSError(error, "Create dir '" + GAME_DEFS_DIR + "'");}
                                            );
   }
   
   if(dirEntries.gameDefsDir === undefined) {
      log.info("Creating directory: " + DECK_DEFS_DIR );
      dirEntries.appStorageDir.getDirectory(DECK_DEFS_DIR,
                                            {create: true, exclusive: false},
                                            DirectoryCreated,
                                            function(error){FSError(error, "Create dir '" + DECK_DEFS_DIR + "'");}
                                            );
   }
   
   if(dirEntries.gameDefsDir === undefined) {
      log.info("Creating directory: " + ACTIVE_GAMES_DIR );
      dirEntries.appStorageDir.getDirectory(ACTIVE_GAMES_DIR,
                                            {create: true, exclusive: false},
                                            DirectoryCreated,
                                            function(error){FSError(error, "Create dir '" + ACTIVE_GAMES_DIR + "'");}
                                            );
   }
}


function SetDirEntry(entry) {
   log.info("Setting directory object for " + entry.name);
   if(entry.name == GAME_DEFS_DIR){
      dirEntries.gameDefsDir = entry[cntr];
   }
   
   if(entry.name == DECK_DEFS_DIR){
      dirEntries.deckDefsDir = entry[cntr];
   }
   
   if(entry.name == ACTIVE_GAMES_DIR){
      dirEntries.activeGamesDir = entry[cntr];
   }
}


function DirectoryCreated(entry) {
   SetDirEntry(entry);

   if((dirEntries.gamesDefsDir !== undefined) &&
      (dirEntries.deckDefsDir !== undefined) &&
      (dirEntries.activeGamesDir !== undefined)){
      SetFileSystemReady();
   }
}


function SetFileSystemReady() {
   log.info("Filesystem is ready to go!");
   fileSystemGo = true;
}



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
   
   log.error(errorStr);
}


module.exports = {
                  InitFileSystem: InitFileSystem
                  };


var log = require('./Logger.js');

var STORAGE_SIZE_BYTES = 512;
var GAME_DEFS_DIR      = "gameDefs";
var DECK_DEFS_DIR      = "deckDefs";
var ACTIVE_GAMES_DIR   = "games";

var fileSystemGo    = false;       // Whether the fileSystem is usable
var appStorageDir   = undefined;   // Constant which holds the app storage location

// Variable holding the directory entries
var dirEntries = {gamesDefsDir: undefined,
                  deckDefsDir: undefined,
                  activeGamesDir: undefined
                  };


// Note: This function cannot be called until Device Ready event.
function RequestFileSystem() {
   window.requestFileSystem(LocalFileSystem.PERSISTENT,
                            STORAGE_SIZE_BYTES,
                            InitDirectories,                                    	// Success
                            function(error){FSError(error, 'RequestFileSystem');} // Error
                            );
}


function InitDirectories() {
   // First, retrieve the application storage location using Cordova libraries
   appStorageDir = window.resolveLocalFileSystemURL(cordova.file.applicationStorageDirectory);
 
   if((dirEntries.gamesDefsDir === undefined) ||
      (dirEntries.deckDefsDir === undefined) ||
      (dirEntries.activeGamesDir === undefined)){
      // Attempt to read the dir entries
      dirReader = new DirectoryReader(cordova.file.applicationStorageDirectory);
      dirReader.readEntries(CheckIfGameDirsExist, function(error){FSError(error, 'Read Directory');});
   }
}


function CheckIfGameDirsExist(entries){
   // Go through looking for our entries
   for(cntr = 0; cntr < entries.length; cntr++) {
      if(entry[cntr].name == GAME_DEFS_DIR){
         dirEntries.gameDefsDir = entry[cntr];
      }
      
      if(entry[cntr].name == DECK_DEFS_DIR){
         dirEntries.deckDefsDir = entry[cntr];
      }
      
      if(entry[cntr].name == ACTIVE_GAMES_DIR){
         dirEntries.activeGamesDir = entry[cntr];
      }
   }
   
   // TODO: Create directories if they don't exist
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

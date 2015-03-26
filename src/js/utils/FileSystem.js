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
 *
 *    document.addEventListener("deviceready", function(){
 *       FS.InitFileSystem();
 *       }, false);
 * 
 ******************************************************************************/

angular.module( "cge.utils.filesystem", [] ).factory('cge.utils.FileSystem', function() {

   /*******************************************************************************
    * Constants
    ******************************************************************************/
   var STORAGE_SIZE_BYTES = 512;
   var GAME_DEFS_DIR = "gameDefs";
   var DECK_DEFS_DIR = "deckDefs";
   var ACTIVE_GAMES_DIR = "games";

   var LOG_FILE_NAME = "cge.log";
   var GAME_SUMMARY_FILE_NAME = "gameSummary";

   /*******************************************************************************
    * Variables
    ******************************************************************************/
   var fileSystemGo = false;       // Whether the fileSystem is usable
   var onReadyCallback = undefined;
   var onErrorCallback = undefined;
   var fsError = "";

   // Variable holding the directory entries
   var dirEntries = {
      appStorageDir: undefined,
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
   var fileEntries = {
      log: undefined,
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
      if (typeof LocalFileSystem !== "undefined") {
         window.requestFileSystem(LocalFileSystem.PERSISTENT,
             STORAGE_SIZE_BYTES,
             InitDirectories,                                       // Success
             function (error) {
                FSError(error, 'RequestFileSystem');
             } // Error
         );
      }
      else {
         SetFileSystemReady(false);
      }
   }


   function InitDirectories(fileSystem) {
      // First, retrieve the application storage location using Cordova libraries
      dirEntries.appStorageDir = fileSystem.root;

      if ((dirEntries.gamesDefsDir === undefined) ||
          (dirEntries.deckDefsDir === undefined) ||
          (dirEntries.activeGamesDir === undefined)) {
         // Attempt to read the dir entries
         //log.info("Retrieving game directories");
         dirReader = new DirectoryReader(dirEntries.appStorageDir.toInternalURL());
         dirReader.readEntries(ReadRootDir, function (error) {
            FSError(error, 'Read Directory');
         });
      }
      else {
         //log.info("Game directory objects already exist");
         SetFileSystemReady(true);
      }
   }


   function ReadRootDir(entries) {
      // Go through looking for our entries
      for (cntr = 0; cntr < entries.length; cntr++) {
         if (entries[cntr].isDirectory) {
            SetRootDirEntry(entries[cntr]);
         }
         else if (entries[cntr].isFile) {
            if (entries[cntr].name == LOG_FILE_NAME) {
               //alert('Found log file!');
               //fileEntries.log = new FileEntity(entries[cntr].name, undefined, undefined, entries[cntr]);
            }

            if (entries[cntr].name == GAME_SUMMARY_FILE_NAME) {
               //alert('Found game summary file!');
               //fileEntries.gameSummary = new FileEntity(entries[cntr].name, undefined, undefined, entries[cntr]);
            }
         }
      }

      CheckRootDirEntries();
   }


   function CheckRootDirEntries() {
      // Create directories if they don't exist
      if (dirEntries.gamesDefsDir === undefined) {
         //log.info("Creating directory: " + GAME_DEFS_DIR );
         dirEntries.appStorageDir.getDirectory(GAME_DEFS_DIR,
             {create: true, exclusive: false},
             DirectoryCreated,
             function (error) {
                FSError(error, "Create dir '" + GAME_DEFS_DIR + "'");
             }
         );
      }

      if (dirEntries.deckDefsDir === undefined) {
         //log.info("Creating directory: " + DECK_DEFS_DIR );
         dirEntries.appStorageDir.getDirectory(DECK_DEFS_DIR,
             {create: true, exclusive: false},
             DirectoryCreated,
             function (error) {
                FSError(error, "Create dir '" + DECK_DEFS_DIR + "'");
             }
         );
      }

      if (dirEntries.activeGamesDir === undefined) {
         //log.info("Creating directory: " + ACTIVE_GAMES_DIR );
         dirEntries.appStorageDir.getDirectory(ACTIVE_GAMES_DIR,
             {create: true, exclusive: false},
             DirectoryCreated,
             function (error) {
                FSError(error, "Create dir '" + ACTIVE_GAMES_DIR + "'");
             }
         );
      }
   }


   function SetRootDirEntry(entry) {
      //log.info("Setting directory object for " + entry.name);
      if (entry.name == GAME_DEFS_DIR) {
         dirEntries.gamesDefsDir = entry;
      }

      if (entry.name == DECK_DEFS_DIR) {
         dirEntries.deckDefsDir = entry;
      }

      if (entry.name == ACTIVE_GAMES_DIR) {
         dirEntries.activeGamesDir = entry;
      }

      if ((dirEntries.gamesDefsDir !== undefined) &&
          (dirEntries.deckDefsDir !== undefined) &&
          (dirEntries.activeGamesDir !== undefined)) {
         SetFileSystemReady(true);
      }
   }


   function DirectoryCreated(entry) {
      SetRootDirEntry(entry);

      if ((dirEntries.gamesDefsDir !== undefined) &&
          (dirEntries.deckDefsDir !== undefined) &&
          (dirEntries.activeGamesDir !== undefined)) {
         SetFileSystemReady(true);
      }
   }


   function SetFileSystemReady(status) {
      fileSystemGo = status;

      if (typeof onReadyCallback === "function") {
         onReadyCallback(true);
      }
   }


   /*******************************************************************************
    * File Entity Methods
    ******************************************************************************/
   function OpenFileEntity(entity, dirEntry) {
      // If the file entry is undefined, then we need to get the file
      if (entity.entry === undefined) {
         if (dirEntry !== undefined) {
            dirEntry.getFile(entity.name,
                {create: true, exclusive: false},
                function (entry) {
                   entity.entry = entry;
                   FileEntityCreateWriter(entity);
                },
                function (error) {
                   FSError(error, 'Open file ' + entity.name);
                }
            );
         }
      }
      else {
         if (entity.writer === undefined) {
            FileEntityCreateWriter(entity);
         }
         else {
            entity.writer.onwriteend = entity.onWriteEnd;
            FileEntityReady(entity, true);
         }
      }
   }


   function FileEntityCreateWriter(entity) {
      if ((entity !== undefined) && (entity.entry !== undefined)) {
         entity.entry.createWriter(function (writer) {
                FileEntitySetWriter(entity, writer);
             },
             function (error) {
                FSError(error, "CreateFileWriter");
             }
         );
      }
   }


   function FileEntitySetWriter(entity, writer) {
      if (entity !== undefined) {
         entity.writer = writer;
         entity.writer.onerror = function (error) {
            FSError(error, "Write file " + entity.name);
         };

         if (entity.truncate) {
            entity.writer.onwriteend = function () {
               FileEntityTruncateAfterWrite(entity)
            };
         }
         else {
            entity.writer.onwriteend = entity.onWriteEnd;
         }

         if (entity.data !== undefined) {
            FileEntityWriteData(entity);
         }
         else {
            FileEntityReady(entity, true);
         }
      }
   }


   function FileEntityWriteData(entity) {
      if ((entity !== undefined) && (entity.writer !== undefined)) {
         entity.writer.seek(0);
         entity.writer.write(entity.data);
         entity.data = undefined;
      }
   }


   function FileEntityTruncateAfterWrite(entity) {
      if (typeof entity.onWriteEnd === "function") {
         entity.writer.onwriteend = entity.onWriteEnd;
      }

      entity.writer.truncate(entity.writer.position);
   }


   function FileEntityReady(entity, ready) {
      if ((entity.entry !== undefined) &&
          (typeof entity.onReady === "function")) {
         entity.onReady(ready);
      }
   }


   function FileEntityRead(entity) {
      if ((entity !== undefined) && (entity.entry !== undefined)) {
         entity.entry.file(function (file) {
                FileEntityReader(entity, file);
             },
             function (error) {
                FSError(error, "FileEntityRead");
             }
         );
      }
   }


   function FileEntityReader(entity, file) {
      var reader = new FileReader();

      reader.onloadend = function (e) {
         if (entity.type == "JSON") {
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
      if ((entity.entry !== undefined) &&
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
      if (fileEntries.log === undefined) {
         fileEntries.log = new FileEntity(LOG_FILE_NAME, onReady, onWriteEnd, undefined);
      }
      else {
         // Just update the onReady and onWriteEnd methods
         fileEntries.log.onReady = onReady;
         fileEntries.log.onWriteEnd = onWriteEnd;

         if (fileEntries.log.writer !== undefined) {
            fileEntries.log.writer.onwriteend = onWriteEnd;
         }
      }

      OpenFileEntity(fileEntries.log, dirEntries.appStorageDir);
   }


   function ClearLogFile() {
      if ((fileEntries.log !== undefined) && (fileEntries.log.writer !== undefined)) {
         fileEntries.log.writer.truncate(0);
      }
   }


   function WriteLogFile(append, data) {
      if ((fileEntries.log !== undefined) && (fileEntries.log.writer !== undefined)) {
         fileEntries.log.writer.seek(fileEntries.log.writer.length);
         fileEntries.log.writer.write(data);
      }
   }


   function ReadLogFile(onReadEnd) {
      if (fileEntries.log !== undefined) {
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
      if (fileEntries.deckDefs[specName] === undefined) {
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

      if (fileEntries.deckDefs[specName] === undefined) {
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
      if (fileEntries.gameDefs[specName] === undefined) {
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

      if (fileEntries.gameDefs[specName] === undefined) {
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

      switch (error.code) {
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

      if (typeof onErrorCallback === "function") {
         onErrorCallback(error.code, errorStr);
      }
   }


   fileSystem = {
      // Initialization methods
      InitFileSystem: InitFileSystem,
      SetErrorCallback: SetErrorCallback,
      // Log file methods
      OpenLogFile: OpenLogFile,
      WriteLogFile: WriteLogFile,
      ClearLogFile: ClearLogFile,
      ReadLogFile: ReadLogFile,
      // Deck Spec methods
      WriteDeckSpec: WriteDeckSpec,
      ReadDeckSpec: ReadDeckSpec,
      // Game Spec methods
      WriteGameSpec: WriteGameSpec,
      ReadGameSpec: ReadGameSpec,
      // Status methods
      GetStatus: GetStatus,
      GetError: GetError,
      // Data export (for testing)
      dirEntries: dirEntries,
      fileEntries: fileEntries
   };

   return fileSystem;
});

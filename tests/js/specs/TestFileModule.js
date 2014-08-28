
// Pull in the module we're testing.
var fileSystem = require("../../../src/js/utils/FileSystem.js");
var dataDeckSpec = require("./Data-DeckSpec.js");


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

   xit("writes a game specification file", function() {
   });

   xit("reads a game specification file", function() {
   });

   xit("writes a game file for a given user", function() {
   });

   xit("reads a game file for a given user", function() {
   });
});


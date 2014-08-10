
// Pull in the module we're testing.
var fileSystem = require("../../../src/js/utils/FileSystem.js");


describe( "FileModule", function() {
   var fsStatus = false;
   var fsError = null;

   beforeEach(function() {
      fsStatus = false;
      fsError = null;
   });

   var Expectations = function(doneCallback) {
      expect(fsError).toBeNull();
      expect(fsStatus).toBeTruthy();
      doneCallback();
   };

   it("initializes the file system", function(done) {
      var OnReady = function(status) {
         fsStatus = status;
         Expectations(done);
      };

      var Failure = function(errorCode, errorStr) {
         fsError = errorStr;
         Expectations(done);
      };

      fileSystem.InitFileSystem(OnReady, Failure);
   });

   xit("opens a log file", function() {
   });

   xit("writes a log file", function() {
   });

   xit("appends a log file", function() {
   });

   xit("reads a log file", function() {
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


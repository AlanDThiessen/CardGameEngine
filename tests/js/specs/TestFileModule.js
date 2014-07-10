
// Pull in the module we're testing.
var fileSystem = require("../../../src/js/utils/FileSystem.js");

//var fileSystem = undefined;


describe( "FileModule", function() {
   var fileStatus = false;

   it("initializes the file system", function(done) {
      var OnReady = function(status) {
         fileStatus = status;
         done();
      };

      var Failure = function(errorCode, errorStr) {
         alert(errorStr);
         done();
      };

      fileSystem.InitFileSystem(OnReady, Failure);

      expect(fileStatus).toBeTruthy();
      done();
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



// Pull in the module we're testing.
var fileSystem = require("../../../src/js/utils/FileSystem.js");

//var fileSystem = undefined;


describe( "FileModule", function() {

   var whichTest = "init";
   var testSuccess = false;

   beforeEach(function(done) {
      setTimeout(function() {
         done();
      }, jasmine.DEFAULT_TIMEOUT_INTERVAL);
   });

   it("initializes the file system", function(done) {
      fileSystem.InitFileSystem(function(status) {
         expect(status).toBeTruthy();
         done();
      });
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


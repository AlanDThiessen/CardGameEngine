
// Pull in the module we're testing.
var server = require("../../../src/js/utils/ServerInterface.js");


describe( "ServerInterface", function() {
   // Terminology:
   //    "Indicate" - The status is returned when queried.
   //    "Report" - The module calls a call-back method.

   // The authentication token indicates a user is logged-in.  With no auth
   // token, certain functionality is not allowed.
   describe("-with no authentication token,", function() {

      xit("retrieves game types", function(done) {
      });

      xit("retrieves a deck specification", function(done) {
      });

      xit("registers a user", function(done) {
      });

      xit("logs-in a user", function(done) {
      });

      xit("indicates not-connected when requested to retrieve game types", function(done) {
      });

      xit("indicates not-connected when requested to retrieve a deck specification", function(done) {
      });

      xit("indicates not-connected when requested to retrieve user's games", function(done) {
      });

      xit("indicates not-connected when requested to retrieve joinable games for user", function(done) {
      });

      xit("indicates not-connected when requested to join a game", function(done) {
      });

      xit("indicates not-connected when requested to start a game", function(done) {
      });

      xit("indicates not-connected when requested to record a transaction", function(done) {
      });

      xit("indicates not-connected when requested to pause a game", function(done) {
      });

      xit("indicates not-connected when requested to resume a game", function(done) {
      });

      xit("indicates not-connected when requested to end a game", function(done) {
      });

   });

   describe("-with authentication token,", function() {

      xit("retrieves game types", function(done) {
      });

      xit("retrieves a deck specification", function(done) {
      });

      xit("retrieves user's games", function(done) {
      });

      xit("retrieves joinable games for user", function(done) {
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

   });

   // Not sure why this is necessary... ???
   xit("retrieves number of players in a game", function(done) {
   });

} );


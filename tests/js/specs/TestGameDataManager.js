
// Pull in the module we're testing.
var gameData = require("../../../src/js/utils/GameDataManager.js");


describe("GameDataManager", function() {

   xit("registers callbacks with the server", function() {
      // spy on the game data to ensure it registers all callbacks with the 
      // server comms when it is initialized.
   });

   describe("when no data exists", function() {
      
      xit("retrieves game types from the server", function(done) {
         // Verify game types are retrieved from the server and stored in a file.
      });

      xit("retrieves a deck specification", function(done) {
         // Verify deck specifications are retrieved from the server and stored
         // in files.
      });

      xit("retrieves user's games from the server", function(done) {
         // Verify user's games are retrieved from the server and stroed in files.
      });

      xit("retrieves user's joinable games from the server", function(done) {
         // These are not stored in a file.
      });

      // Not sure why this is necessary... ???
      xit("retrieves number of players in a game from the server", function(done) {
      });

   });

   describe("when data exists in files", function() {

      xit("populates game types from the file", function(done) {
      });

      xit("populates deck specifications from files", function(done) {
      });

      xit("populates user's games from files", function(done) {
      });

      xit("syncs game types with the server", function(done) {
      });

      xit("syncs deck specifications with the server", function(done) {
      });

      xit("syncs user's games with the server", function(done) {
      });
   });

} );


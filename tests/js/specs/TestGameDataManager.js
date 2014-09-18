
// Pull in the module we're testing.
gameData = require("../../../src/js/utils/GameDataManager.js");
server = require("../../../src/js/utils/ServerInterface.js");
mock = require("./Data-MockServerInterface.js");


describe("GameDataManager", function() {
   var gameDataMgr = undefined;

   it("instantiates the singleton upon initialization", function() {
      // spy on the game data to ensure it registers all callbacks with the 
      // server comms when it is initialized.
      spyOn(server, "AddCallback");

      gameDataMgr = gameData.GetGameDataManager();
      expect(gameDataMgr).toBeDefined();
      expect(server.AddCallback).toHaveBeenCalledWith(server.events.SI_LOGIN,
                                                      gameDataMgr.ServerLoginHandler);
      expect(server.AddCallback).toHaveBeenCalledWith(server.events.SI_GAME_TYPES_RETRIEVED,
                                                      gameDataMgr.ServerGameTypesHandler);
      expect(server.AddCallback).toHaveBeenCalledWith(server.events.SI_USER_GAMES_RETRIEVED,
                                                      gameDataMgr.ServerMyGamesHandler);
      expect(server.AddCallback).toHaveBeenCalledWith(server.events.SI_DECK_SPEC_RETRIEVED,
                                                      gameDataMgr.ServerDeckSpecHandler);
   });

   it("additional calls to singleton return the same object", function() {
      var gameDataMgr2 = gameData.GetGameDataManager();
      expect(gameDataMgr2).toBeDefined();
      expect(gameDataMgr2).toEqual(gameDataMgr);
   });
   
   describe("-upon succesfull server login,", function() {

      beforeEach(function() {
         jasmine.Ajax.install();
      });

      afterEach(function() {
         jasmine.Ajax.uninstall();
      });

      xit("retrieves game types and user games from the server", function(done) {
         // Verify game types are retrieved from the server and stored in a file.
         spyOn(server, "GetGameTypes");
         spyOn(server, "GetUserGames");
      });

   });

   describe("-need a category for these", function() {

      xit("retrieves a deck specification from the server", function(done) {
         // Verify deck specifications are retrieved from the server and stored
         // in files.
         spyOn(server, "LoadDeckSpec");
      });

      xit("retrieves user's joinable games from the server", function(done) {
         // These are not stored in a file.
      });

      // Not sure why this is necessary... ???
      xit("retrieves number of players in a game from the server", function(done) {
      });

   });

   describe("-when data exists in files,", function() {

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


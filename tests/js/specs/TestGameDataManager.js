
// Pull in the module we're testing.
gameData = require("../../../src/js/utils/GameDataManager.js");
server = require("../../../src/js/utils/ServerInterface.js");
auth = require("../../../src/js/utils/Authenticator.js");
mock = require("./Data-MockServerInterface.js");


describe("GameDataManager", function() {
   var gameDataMgr = undefined;
   var userName = 'TestUser';
   var testPassword = 'testPassword';

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

   // NOTE: These tests assume the Authenticator has already been initialized
   describe("-upon succesfull server login,", function() {

      beforeEach(function() {
         jasmine.Ajax.install();
      });

      afterEach(function() {
         jasmine.Ajax.uninstall();
         auth.LogoutUser();
      });

      it("retrieves game types from the server", function(done) {
         // Verify game types are retrieved from the server and stored in a file.
         spyOn(server, "GetGameTypes").and.callThrough();
         
         // Mock server ajax registration success
         auth.LoginUser(userName, testPassword);
         jasmine.Ajax.requests.mostRecent().response(mock.UserResponse('001', 'TestUser', "Test User 1", "testuser1@chamrock.net"));

         // Verify spies
         expect(server.GetGameTypes).toHaveBeenCalled();

         // Mock server ajax game types and user games from server
         jasmine.Ajax.requests.mostRecent().response(mock.GameTypes());

         expect(gameDataMgr.GetGameTypes()).toEqual(mock.GameTypes());
      });

      it("retrieves user's games from the server", function(done) {
         // Verify game types are retrieved from the server and stored in a file.
         spyOn(server, "GetUserGames").and.callThrough();

         // Mock server ajax registration success
         auth.LoginUser(userName, testPassword);
         jasmine.Ajax.requests.mostRecent().response(mock.UserResponse('001', 'TestUser', "Test User 1", "testuser1@chamrock.net"));

         // Verify spies
         expect(server.GetUserGames).toHaveBeenCalled();
         
         // Mock server ajax game types and user games from server
         jasmine.Ajax.requests.mostRecent().response(mock.UserGames());

         expect(gameDataMgr.GetUserGames()).toEqual(mock.UserGames());
      });

   });

   describe("-need a category for these", function() {

      xit("retrieves a deck specification from the server", function(done) {
         // Verify deck specifications are retrieved from the server and stored
         // in files.
         spyOn(server, "LoadDeckSpec");
      });

      // Not sure why this is necessary... ???
      xit("retrieves number of players in a game from the server", function(done) {
      });

   });

   describe("-when data exists in files,", function() {
   /* TODO: Future
      Game Data File Storage has been postponed for a future release
   */

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


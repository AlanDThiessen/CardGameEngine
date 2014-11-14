
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
      spyOn(server, "AddCallback").and.callThrough();

      gameDataMgr = gameData.GetGameDataManager();
      expect(gameDataMgr).toBeDefined();
      expect(server.AddCallback.calls.count()).toEqual(4);
   });

   it("additional calls to singleton return the same object", function() {
      var gameDataMgr2 = gameData.GetGameDataManager();
      expect(gameDataMgr2).toBeDefined();
      expect(gameDataMgr2).toEqual(gameDataMgr);
   });

   // NOTE: These tests assume the Authenticator has already been initialized
   describe("-upon successful server login,", function() {

      beforeEach(function() {
         jasmine.Ajax.install();
      });

      afterEach(function() {
         jasmine.Ajax.uninstall();
         auth.LogoutUser();
      });

      it("retrieves game types and user's games from the server", function() {
         var gameTypes = mock.GameTypes();
         var userGames = mock.UserGames();

         // Verify game types are retrieved from the server and stored in a file.
         spyOn(server, "GetGameTypes").and.callThrough();
         spyOn(server, "GetUserGames").and.callThrough();

         // Mock server ajax registration success
         auth.LoginUser(userName, testPassword);
         jasmine.Ajax.requests.at(0).response(mock.UserResponse('001', 'TestUser', "Test User 1", "testuser1@chamrock.net"));

         // Verify spies
         expect(server.GetGameTypes).toHaveBeenCalled();
         expect(server.GetUserGames).toHaveBeenCalled();

         // Mock server ajax game types and user games from server
         jasmine.Ajax.requests.at(1).response(gameTypes);
         jasmine.Ajax.requests.at(2).response(userGames);

         expect(gameDataMgr.GetGameTypes()).toEqual(JSON.parse(gameTypes.responseText));
         expect(gameDataMgr.GetUserGames()).toEqual(JSON.parse(userGames.responseText));
      });

   });

   describe("-need a category for these", function() {

      xit("retrieves a deck specification from the server", function() {
         // Verify deck specifications are retrieved from the server and stored
         // in files.
         spyOn(server, "LoadDeckSpec");
      });

      // Not sure why this is necessary... ???
      xit("retrieves number of players in a game from the server", function() {
      });

   });

   describe("-when data exists in files,", function() {
   /* TODO: Future
      Game Data File Storage has been postponed for a future release
   */

      xit("populates game types from the file", function() {
      });

      xit("populates deck specifications from files", function() {
      });

      xit("populates user's games from files", function() {
      });

      xit("syncs game types with the server", function() {
      });

      xit("syncs deck specifications with the server", function() {
      });

      xit("syncs user's games with the server", function() {
      });
   });

} );


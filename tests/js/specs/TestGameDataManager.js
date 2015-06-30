

angular.module('TestGameDataManager', []);


describe("GameDataManager", function() {
   var userName = 'TestUser';
   var testPassword = 'testPassword';

   beforeEach(function() {
      module('cge.server');
      module('test.data.mockserver');

      inject(function($injector) {
         mock = $injector.get('test.data.mockServer');
      });

      inject(function($injector) {
         server = $injector.get('cge.server.Interface');
      });

      inject(function($injector) {
         auth = $injector.get('cge.server.Authenticator');
         auth.Init();
         auth.InitToken();
      });

      inject(function($injector) {
         gameDataMgr = $injector.get('cge.server.GameDataManager');
      });
   });

   describe("-upon successful server login,", function() {

      beforeEach(function() {
         jasmine.Ajax.install();
      });

      afterEach(function() {
         jasmine.Ajax.uninstall();
         auth.LogoutUser();
      });

      it("retrieves game types and user's games from the server", function() {
         var gameTypes    = mock.GameTypes();
         var userGames    = mock.UserGames();

         // Verify game types are retrieved from the server and stored in a file.
         spyOn(server, "GetGameTypes").and.callThrough();
         spyOn(server, "GetUserGames").and.callThrough();

         // Mock server ajax registration success
         auth.LoginUser(userName, testPassword);
         jasmine.Ajax.requests.at(0).response(mock.UserResponse('001', 'TestUser', "Test User 1", "testuser1@chamrock.net"));
         // Mock server ajax game types and user games from server
         jasmine.Ajax.requests.at(1).response(gameTypes);
         jasmine.Ajax.requests.at(2).response(userGames);

         // Verify spies
         expect(server.GetGameTypes).toHaveBeenCalled();
         expect(server.GetUserGames).toHaveBeenCalled();
         expect(gameDataMgr.GetGameTypes()).toEqual(JSON.parse(gameTypes.responseText));
         expect(gameDataMgr.GetUserGames()).toEqual(JSON.parse(userGames.responseText));
      });
   });

   describe("-when requested", function() {
      /* TODO: When should it retrieve a deck spec?  When a game is started? */
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


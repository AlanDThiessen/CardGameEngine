
angular.module('cge.server').factory('cge.server.GameDataManager', ['cge.server.Interface', function(server) {

   gameDataMgr = {};

   /******************************************************************************
    * Server Status/Error Values
    ******************************************************************************/
   gameDataMgr.status = {
      GD_SUCCESS: 0
   };

   /*******************************************************************************
    * Game Data
    ******************************************************************************/
   var gameTypes = [];
   var deckSpecs = [];
   var userGames = [];
   var joinableGames = [];

   /******************************************************************************
    * Data Access Methods
    ******************************************************************************/
   function SetGameTypes(data) {
      gameTypes = data;
   }


   gameDataMgr.GetGameTypes = function () {
      return gameTypes;
   };


   gameDataMgr.GetGameTypeById = function (id) {
      var cntr;
      var gameType;

      for (cntr = 0; cntr < gameTypes.length; cntr++) {
         if (gameTypes[cntr].id === id) {
             gameType = gameTypes[cntr];
             break;
         }
      }

      return gameType;
   };


   gameDataMgr.GetDeckSpecs = function () {
   };


   gameDataMgr.GetDeckSpecById = function (id) {
   };


   function SetUserGames(data) {
      userGames = data;
   }


   gameDataMgr.GetUserGames = function () {
      return userGames;
   };


   gameDataMgr.GetUserGameById = function (id) {
      var cntr;
      var userGame;

      for (cntr = 0; cntr < userGames.length; cntr++) {
         if (userGames[cntr].id === id) {
            userGame = userGames[cntr];
            break;
         }
      }

      return userGame;
   };


   ClearUserData = function () {
      gameDataMgr.userGames = [];
   };


   /*******************************************************************************
    *
    * GameDataManager Singleton
    *
    ******************************************************************************/
   var TheGameDataManager;

   function GetGameDataManager() {
      if (TheGameDataManager === undefined) {
          TheGameDataManager = Object.create(GameDataManager);
          RegisterServerCallbacks();
      }

      return TheGameDataManager;
   }

   /******************************************************************************
    * Server Interface Callbacks
    ******************************************************************************/
   var ServerLoginHandler = function(status, data) {
      if (status == server.status.SI_SUCCESS) {
         server.GetGameTypes();
         server.GetUserGames();
      }
   };


   var ServerGameTypesHandler = function(status, data) {
      if (status == server.status.SI_SUCCESS) {
          SetGameTypes(data);
      }
   };


   var ServerMyGamesHandler = function(status, data) {
      if (status == server.status.SI_SUCCESS) {
         SetUserGames(data);
      }
   };


   var ServerDeckSpecHandler = function(status, data) {

   };

   function RegisterServerCallbacks() {
      server.AddCallback(server.events.SI_TOKEN_SET, ServerLoginHandler);
      server.AddCallback(server.events.SI_GAME_TYPES_RETRIEVED, ServerGameTypesHandler);
      server.AddCallback(server.events.SI_USER_GAMES_RETRIEVED, ServerMyGamesHandler);
      server.AddCallback(server.events.SI_DECK_SPEC_RETRIEVED, ServerDeckSpecHandler);
   }


   RegisterServerCallbacks();

   return gameDataMgr;
}]);

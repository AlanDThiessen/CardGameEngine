
angular.module('cge.server').factory('cge.server.GameDataManager', ['cge.server.Interface', function(server) {

   /******************************************************************************
    * Server Status/Error Values
    ******************************************************************************/
   var gdStatus = {
      GD_SUCCESS: 0
   };

   /*******************************************************************************
    * GameDataManager Class Constructor
    ******************************************************************************/
   var GameDataManager = {
      gameTypes:        [],
      deckSpecs:        [],
      userGames:        [],
      joinableGames:    [],

      /******************************************************************************
       * Data Access Methods
       ******************************************************************************/
      GetGameTypes: function () {
         return this.gameTypes;
      },


      GetGameTypeById: function (id) {
         var cntr;
         var gameType;

         for (cntr = 0; cntr < this.gameTypes.length; cntr++) {
            if (this.gameTypes[cntr].id === id) {
                gameType = this.gameTypes[cntr];
                break;
            }
         }

         return gameType;
      },


      SetGameTypes: function(gameTypes) {
         this.gameTypes = gameTypes;
      },


      GetDeckSpecs: function () {
      },


      GetDeckSpecById: function (id) {
      },


      GetUserGames: function () {
         return this.userGames;
      },


      GetUserGameById: function (id) {
         var cntr;
         var userGame;

         for (cntr = 0; cntr < this.userGames.length; cntr++) {
            if (this.userGames[cntr].id === id) {
               userGame = this.userGames[cntr];
               break;
            }
         }

         return userGame;
      },


      SetUserGames: function(userGames) {
         this.userGames = userGames;
      },


      ClearUserData: function () {
         gameDataMgr.userGames = [];
      },
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
       if ((status == server.status.SI_SUCCESS) && (TheGameDataManager !== undefined)) {
           TheGameDataManager.SetGameTypes(data);
       }
    };


    var ServerMyGamesHandler = function(status, data) {
       if ((status == server.status.SI_SUCCESS) && (TheGameDataManager !== undefined)) {
          TheGameDataManager.SetUserGames(data);
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

   return {
      status: gdStatus,
      gameDataMgr: TheGameDataManager,
      GetGameDataManager: GetGameDataManager
   };

}]);

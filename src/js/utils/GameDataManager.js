
angular.module('cge.server').factory('cge.server.GameDataManager', ['cge.server.Interface', function(server) {

   /******************************************************************************
    * Server Status/Error Values
    ******************************************************************************/
   var gdStatus = {
      GD_SUCCESS: 0
   };


   /*******************************************************************************
    *
    * GameDataManager Class Constructor
    *
    ******************************************************************************/
   function GameDataManager() {
      this.gameTypes = [];
      this.deckSpecs = [];
      this.userGames = [];
      this.joinableGames = [];

      this.RegisterServerCallbacks();
   }


   /******************************************************************************
    *
    * Public Methods
    *
    ******************************************************************************/

   /******************************************************************************
    * Data Access Methods
    ******************************************************************************/
   GameDataManager.prototype.GetGameTypes = function () {
      return this.gameTypes;
   };


   GameDataManager.prototype.GetGameTypeById = function (id) {
      var cntr;
      var gameType = undefined;

      for (cntr = 0; cntr < this.gameTypes.length; cntr++) {
         if (this.gameTypes[cntr].id === id) {
            gameType = this.gameTypes[cntr];
            break;
         }
      }

      return gameType;
   };


   GameDataManager.prototype.GetDeckSpecs = function () {
   };


   GameDataManager.prototype.GetDeckSpecById = function (id) {
   };


   GameDataManager.prototype.GetUserGames = function () {
      return this.userGames;
   };


   GameDataManager.prototype.GetUserGameById = function (id) {
      var cntr;
      var userGame = undefined;

      for (cntr = 0; cntr < this.userGames.length; cntr++) {
         if (this.userGames[cntr].id === id) {
            userGame = this.userGames[cntr];
            break;
         }
      }

      return userGame;
   };


   GameDataManager.prototype.ClearUserData = function () {
      this.userGames = [];
   };


   /******************************************************************************
    *
    * Server Interface Callback Methods
    *
    ******************************************************************************/
   GameDataManager.prototype.RegisterServerCallbacks = function () {
      server.AddCallback(server.events.SI_LOGIN, this.ServerLoginHandler);
      server.AddCallback(server.events.SI_GAME_TYPES_RETRIEVED, this.ServerGameTypesHandler.bind(this));
      server.AddCallback(server.events.SI_USER_GAMES_RETRIEVED, this.ServerMyGamesHandler.bind(this));
      server.AddCallback(server.events.SI_DECK_SPEC_RETRIEVED, this.ServerDeckSpecHandler.bind(this));
   };


   GameDataManager.prototype.ServerLoginHandler = function (status, data) {
      if (status == server.status.SI_SUCCESS) {
         server.GetGameTypes();
         server.GetUserGames();
      }
   };


   GameDataManager.prototype.ServerGameTypesHandler = function (status, data) {
      if (status == server.status.SI_SUCCESS) {
         this.gameTypes = data;
      }
   };


   GameDataManager.prototype.ServerMyGamesHandler = function (status, data) {
      if (status == server.status.SI_SUCCESS) {
         this.userGames = data;
      }
   };


   GameDataManager.prototype.ServerDeckSpecHandler = function (status, data) {

   };


   /*******************************************************************************
    *
    * GameDataManager Singleton
    *
    ******************************************************************************/
   var gameDataMgr = undefined;

   function GetGameDataManager() {

      if (gameDataMgr === undefined) {
         gameDataMgr = new GameDataManager();
      }

      return gameDataMgr;
   }


   return {
      status: gdStatus,
      gameDataMgr: gameDataMgr,
      GetGameDataManager: GetGameDataManager
   };

}]);

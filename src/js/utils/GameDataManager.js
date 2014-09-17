
var server = require("./ServerInterface.js");

/******************************************************************************
 * Server Status/Error Values
 ******************************************************************************/
gdStatus = {
   GD_SUCCESS:                           0
};


/*******************************************************************************
 * 
 * GameDataManager Class Constructor
 * 
 ******************************************************************************/
function GameDataManager() {
   this.gameTypes = [];
   this.games = [];
   this.deckSpecs = [];

   this.RegisterServerCallbacks();
}


/******************************************************************************
 * Server Interface Callback Methods
 ******************************************************************************/
GameDataManager.prototype.RegisterServerCallbacks = function() {
   server.AddCallback(server.events.SI_LOGIN, this.ServerLoginHandler);
   server.AddCallback(server.events.SI_GAME_TYPES_RETRIEVED, this.ServerGameTypesHandler);
   server.AddCallback(server.events.SI_USER_GAMES_RETRIEVED, this.ServerMyGamesHandler);
   server.AddCallback(server.events.SI_DECK_SPEC_RETRIEVED, this.ServerDeckSpecsHandler);
};


GameDataManager.prototype.ServerLoginHandler = function(status, data) {

};


GameDataManager.prototype.ServerGameTypesHandler = function(status, data) {

};


GameDataManager.prototype.ServerMyGamesHandler = function(status, data) {

};


GameDataManager.prototype.ServerDeckSpecsHandler = function(status, data) {

};


/*******************************************************************************
 * 
 * GameDataManager Singleton
 * 
 ******************************************************************************/
var gameDataMgr = undefined;

function GetGameDataManager() {

   if(gameDataMgr === undefined) {
      gameDataMgr = new GameDataManager();
   }

   return gameDataMgr;
}


module.exports = {
   status:              gdStatus,
   gameDataMgr:         gameDataMgr,
   GetGameDataManager:  GetGameDataManager
};


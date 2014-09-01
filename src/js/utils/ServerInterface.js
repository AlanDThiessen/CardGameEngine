
ajax = require("./Ajax.js");
log = require("./Logger.js");

server = {};

server.eventTypes = {
   /***************************************************************************
    * Server Events
    ***************************************************************************/
   SI_REQUEST_GENERATED:                 0,
   SI_LOGIN_SUCCESS:                     1,
   SI_GAME_TYPES_RETRIEVED:              2,
   SI_DECK_SPEC_RETRIEVED:               3,
   SI_USER_GAMES_RETRIEVED:              4,
   SI_USER_JOINABLE_GAMES_RETRIEVED:     5,
   SI_JOINED_GAME:                       6,
   SI_GAME_STARTED:                      7,
   SI_GAME_PAUSED:                       8,
   SI_GAME_RESUMED:                      9,
   SI_GAME_ENDED:                       10,

   /***************************************************************************
    * Error Events
    ***************************************************************************/
   SI_ERROR_TOKEN_INVALID:              -1,
   SI_ERROR_SERVER_TIMEOUT:             -2,
   SI_ERROR_LOGIN_INVALID:              -3,
   SI_ERROR_REGISTER_NAME_EXISTS:       -4
};

server.callBacks = {

};

server.token = {
   valid:      false,
   userId:     0
};


/******************************************************************************
 * Token Methods
 ******************************************************************************/
server.SetTokenUser = function(userId) {
   server.token.userId = userId;
   server.token.valid  = true;
};


server.ClearToken = function() {
   server.token.valid  = false;
   server.token.userId = 0;
}


/******************************************************************************
 * Register User
 ******************************************************************************/
server.RegisterUser = function(username, password) {
   var postData = {
      'action': 'cge_register_user',
      'username': username,
      'password': password,
      'display_name': displayName,
      'email': email
   };

   ajax.ServerPost(postData, server.LoginUserSuccess, server.RegisterUserFailure);
};


server.RegisterUserFailure = function(status) {
   server.failure(status, "RegisterUser");
};

   
/******************************************************************************
 * Login User
 ******************************************************************************/
server.LoginUser = function(username, password) {
   var postData = {
      'action': 'cge_login_user',
      'username': username,
      'password': password
   };

   ajax.ServerPost(postData, server.LoginUserSuccess, server.LoginUserFailure);

   return SI_REQUEST_GENERATED;
};


server.LoginUserSuccess = function(user) {
};


server.LoginUserFailure = function(status) {
   server.failure(status, "LoginUser");
};


/******************************************************************************
 * Get Game Types
 ******************************************************************************/ 
server.GetGameTypes = function() {
   var postData = {
      'action': 'cge_get_game_types'
   };
   
   ajax.ServerPost(postData, server.GetGameTypesSuccess, server.GetGameTypesFailure);
   
   return SI_REQUEST_GENERATED;
};


server.GetGameTypesSuccess = function(gameTypes) {
};


server.GetGameTypesFailure = function(status) {
   server.failure(status, "GetGameTypes");
};


/******************************************************************************
 * Load Deck Spec
 ******************************************************************************/ 
server.LoadDeckSpec = function(deckTypeId) {
   var postData = {
      'action': 'cge_load_deck_spec',
      'deck_type_id': deckTypeId
   };
   
   ajax.ServerPost(postData, server.LoadDeckSpecSuccess, server.LoadDeckSpecFailure);
   
   return SI_REQUEST_GENERATED;
};


server.LoadDeckSpecSuccess = function(game) {
};


server.LoadDeckSpecFailure = function(status) {
   server.failure(status, "LoadDeckSpec");
};


/******************************************************************************
 * Get User Games
 ******************************************************************************/
server.GetUserGames = function() {
   if((server.token.valid == true) && (server.token.userId != 0)) {
      var postData = {
         'action': 'cge_get_my_games',
         'user_id': server.token.userId
      };

      ajax.ServerPost(postData, server.GetUserGamesSuccess, server.GetUserGamesFailure);

      return SI_REQUEST_GENERATED;
   }
   else {
      return SI_ERROR_TOKEN_INVALID;
   }
};


server.GetUserGamesSuccess = function(games) {
   var cntr;
   var gameNames = "";

   for(cntr = 0; cntr < games.length; cntr++) {
      gameNames += '"' + games[cntr].game_name + '", ';
   }
};


server.GetUserGamesFailure = function(status) {
   server.failure(status, "GetUserGames");
};


/******************************************************************************
 * Get Joinable Games
 ******************************************************************************/ 
server.GetJoinableGames = function() {
   if((server.token.valid == true) && (server.token.userId != 0)) {
      var postData = {
         'action': 'cge_get_joinable_games',
         'user_id': server.token.userId
      };

      ajax.ServerPost(postData, server.GetJoinableGamesSuccess, server.GetJoinableGamesFailure);
      
      return SI_REQUEST_GENERATED;
   }
   else {
      return SI_ERROR_TOKEN_INVALID;
   }
};


server.GetJoinableGamesSuccess = function(joinableGames) {
};


server.GetJoinableGamesFailure = function(status) {
   server.failure(status, "GetJoinableGames");
};


/******************************************************************************
 * Join Game
 ******************************************************************************/
server.JoinGame = function(gameId) {
   if((server.token.valid == true) && (server.token.userId != 0)) {
      var postData = {
         'action': 'cge_join_game',
         'game_id': gameId,
         'user_id': token.server.userId
      };
      
      ajax.ServerPost(postData, server.JoinGameSuccess, server.JoinGameFailure);

      return SI_REQUEST_GENERATED;
   }
   else {
      return SI_ERROR_TOKEN_INVALID;
   }
};


server.JoinGameSuccess = function(game) {
};


server.JoinGameFailure = function(status) {
   server.failure(status, "JoinGame");
};


/******************************************************************************
 * Start Game
 ******************************************************************************/ 
server.StartGame = function(gameId) {
   if((server.token.valid == true) && (server.token.userId != 0)) {
      var postData = {
         'action': 'cge_start_game',
         'user_id': server.token.userId,
         'game_type_id': gameId
      };

      ajax.ServerPost(postData, server.StartGameSuccess, server.StartGameFailure);

      return SI_REQUEST_GENERATED;
   }
   else {
      return SI_ERROR_TOKEN_INVALID;
   }
};


server.StartGameSuccess = function(game) {
};


server.StartGameFailure = function(status) {
   server.failure(status, "StartGame");
};


/******************************************************************************
 * 
 ******************************************************************************/ 
server.GetNumPlayersInGame = function(gameId) {
   var postData = {
      'action': 'cge_get_num_players',
      'game_id': gameId
   };
   
   ajax.ServerPost(postData, server.GetNumPlayersInGameSuccess, server.GetNumPlayersInGameFailure);
   
   return SI_REQUEST_GENERATED;
};


server.GetNumPlayersInGameSuccess = function(game) {
};


server.GetNumPlayersInGameFailure = function(status) {
   server.failure(status, "GetNumPlayersInGame");
};


/******************************************************************************
 * Record Transaction
 ******************************************************************************/ 
server.RecordTransaction = function(gameId,
                                    fromContainer,
                                    toContainer,
                                    cards) {
   if((server.token.valid == true) && (server.token.userId != 0)) {
      var postData = {
         'action': 'cge_record_transaction',
         'game_id': gameId,
         'user_id': server.token.userId,
         'from_group_id': fromContainer,
         'to_group_id': toContainer,
         'items': cards
      };

      ajax.ServerPost(postData, server.RecordTransactionSuccess, server.RecordTransactionFailure);

      return SI_REQUEST_GENERATED;
   }
   else {
      return SI_ERROR_TOKEN_INVALID;
   }
};


server.RecordTransactionSuccess = function(response) {
};


server.RecordTransactionFailure = function(status) {
   server.failure(status, "RecordTransaction");
};


/******************************************************************************
 * Pause Game
 ******************************************************************************/ 
server.PauseGame = function(gameId) {
   if((server.token.valid == true) && (server.token.userId != 0)) {
      var postData = {
         'action': 'cge_pause_game',
         'game_id': gameId,
         'user_id': server.token.userId
      };
      
      ajax.ServerPost(postData, server.PauseGameSuccess, server.PauseGameFailure);

      return SI_REQUEST_GENERATED;
   }
   else {
      return SI_ERROR_TOKEN_INVALID;
   }
};


server.PauseGameSuccess = function(success) {
};


server.PauseGameFailure = function(status) {
   server.failure(status, "PauseGame");
};


/******************************************************************************
 * Resume Game
 ******************************************************************************/ 
server.ResumeGame = function(gameId) {
   if((server.token.valid == true) && (server.token.userId != 0)) {
      var postData = {
         'action': 'cge_resume_game',
         'game_id': gameId,
         'user_id': server.token.userId
      };

      ajax.ServerPost(postData, server.ResumeGameSuccess, server.ResumeGameFailure);

      return SI_REQUEST_GENERATED;
   }
   else {
      return SI_ERROR_TOKEN_INVALID;
   }
};


server.ResumeGameSuccess = function(success) {
};


server.ResumeGameFailure = function(status) {
   server.failure(status, "ResumeGame");
};


/******************************************************************************
 * End Game
 ******************************************************************************/ 
server.EndGame = function(gameId) {
   if((server.token.valid == true) && (server.token.userId != 0)) {
      var postData = {
         'action': 'cge_end_game',
         'game_id': gameId,
         'user_id': server.token.userId
      };

      ajax.ServerPost(postData, server.EndGameSuccess, server.EndGameFailure);

      return SI_REQUEST_GENERATED;
   }
   else {
      return SI_ERROR_TOKEN_INVALID;
   }
};


server.EndGameSuccess = function(success) {
};


server.EndGameFailure = function(status) {
   server.failure(status, "EndGame");
};

   
/******************************************************************************
 * Ack Event
 ******************************************************************************/ 
server.AckEvent = function(userId, gameId, notificationId) {
   var postData = {
      'action': 'cge_ack_event',
      'game_id': gameId,
      'user_id': userId,
      'notif_id': notificationId
   };
   
   ajax.ServerPost(postData, server.AckEventSuccess, server.AckEventFailure);
   
   return SI_REQUEST_GENERATED;
};


server.AckEventSuccess = function(game) {
};


server.AckEventFailure = function(status) {
   server.failure(status, "AckEvent");
};


/******************************************************************************
 * Failure to Send - TODO: Needs some thought
 ******************************************************************************/ 
server.Failure = function(status, name) {
   log.warn("ServerInterface Error: " + status + " in " + name);
};



module.exports = server;

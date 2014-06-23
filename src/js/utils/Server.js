
ajax = require("./Ajax.js");
log = require("./Logger.js");

server = {};


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

   ajax.ServerPost(postData, server.LoginUserSuccess, server.Failure);
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

   ajax.ServerPost(postData, server.LoginUserSuccess, server.Failure);
};


server.LoginUserSuccess = function(user) {
   alert("Logged in as: " + user.display_name);
   log.info("Logged in as: " + user.display_name);
   
   // Now, get the user's games.
   server.GetUserGames(user.id);
};


/******************************************************************************
 * Get User Games
 ******************************************************************************/
server.GetUserGames = function(userId) {
   var postData = {
      'action': 'cge_get_my_games',
      'user_id': userId
   };
   
   ajax.ServerPost(postData, server.GetUserGamesSuccess, server.Failure);
};


server.GetUserGamesSuccess = function(games) {
   var cntr;
   var gameNames = "";
   
   for(cntr = 0; cntr < games.length; cntr++) {
      gameNames += '"' + games[cntr].game_name + '", ';
   }
   
   alert("There are " + games.length + " games: " + gameNames);
   log.info("There are " + games.length + " games: " + gameNames);
};

/******************************************************************************
 * Get Game Types
 ******************************************************************************/ 
server.GetGameTypes = function() {
   var postData = {
      'action': 'cge_get_game_types'
   };
   
   ajax.ServerPost(postData, server.GetGameTypesSuccess, server.Failure);
};


server.GetGameTypesSuccess = function(gameTypes) {
};


/******************************************************************************
 * Get Joinable Games
 ******************************************************************************/ 
server.GetJoinableGames = function(userId) {
   var postData = {
      'action': 'cge_get_joinable_games',
      'user_id': userId
   };
   
   ajax.ServerPost(postData, server.GetJoinableGamesSuccess, server.Failure);
};


server.GetJoinableGamesSuccess = function(joinableGames) {
};

   
/******************************************************************************
 * Join Game
 ******************************************************************************/
server.JoinGame = function(userId, gameId) {
   var postData = {
      'action': 'cge_join_game',
      'game_id': gameId,
      'user_id': userId
   };
   
   ajax.ServerPost(postData, server.JoinGameSuccess, server.Failure);
};


server.JoinGameSuccess = function(game) {
};


/******************************************************************************
 * Start Game
 ******************************************************************************/ 
server.StartGame = function(userId, gameId) {
   var postData = {
      'action': 'cge_start_game',
      'user_id': userId,
      'game_type_id': gameId
   };
   
   ajax.ServerPost(postData, server.StartGameSuccess, server.Failure);
};


server.StartGameSuccess = function(game) {
};


/******************************************************************************
 * Load Deck Spec
 ******************************************************************************/ 
server.LoadDeckSpec = function(deckTypeId) {
   var postData = {
      'action': 'cge_load_deck_spec',
      'deck_type_id': deckTypeId
   };
   
   ajax.ServerPost(postData, server.LoadDeckSpecSuccess, server.Failure);
};


server.LoadDeckSpecSuccess = function(game) {
};


/******************************************************************************
 * 
 ******************************************************************************/ 
server.GetNumPlayersInGame = function(gameId) {
   var postData = {
      'action': 'cge_get_num_players',
      'game_id': gameId
   };
   
   ajax.ServerPost(postData, server.GetNumPlayersInGameSuccess, server.Failure);
};


server.GetNumPlayersInGameSuccess = function(game) {
};


/******************************************************************************
 * Record Transaction
 ******************************************************************************/ 
server.RecordTransaction = function(userId,
                                    gameId,
                                    fromContainer,
                                    toContainer,
                                    cards) {
   var postData = {
      'action': 'cge_record_transaction',
      'game_id': gameId,
      'user_id': userId,
      'from_group_id': fromContainer,
      'to_group_id': toContainer,
      'items': cards
   };
   
   ajax.ServerPost(postData, server.RecordTransactionSuccess, server.Failure);
};


server.RecordTransactionSuccess = function(response) {
};


/******************************************************************************
 * Pause Game
 ******************************************************************************/ 
server.PauseGame = function(userId, gameId) {
   var postData = {
      'action': 'cge_pause_game',
      'game_id': gameId,
      'user_id': userId
   };
   
   ajax.ServerPost(postData, server.PauseGameSuccess, server.Failure);
};


server.PauseGameSuccess = function(success) {
};


/******************************************************************************
 * Resume Game
 ******************************************************************************/ 
server.ResumeGame = function(userId, gameId) {
   var postData = {
      'action': 'cge_resume_game',
      'game_id': gameId,
      'user_id': userId
   };
   
   ajax.ServerPost(postData, server.ResumeGameSuccess, server.Failure);
};


server.ResumeGameSuccess = function(success) {
};


/******************************************************************************
 * End Game
 ******************************************************************************/ 
server.EndGame = function(userId, gameId) {
   var postData = {
      'action': 'cge_end_game',
      'game_id': gameId,
      'user_id': userId
   };
   
   ajax.ServerPost(postData, server.EndGameSuccess, server.Failure);
};


server.EndGameSuccess = function(success) {
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
   
   ajax.ServerPost(postData, server.AckEventSuccess, server.Failure);
};


server.AckEventSuccess = function(game) {
};


/******************************************************************************
 * Failure to Send - TODO: Needs some thought
 ******************************************************************************/ 
server.Failure = function() {
   log.warn("Ajax Request Failed");
//   alert("Ajax Request Failed");
};



module.exports = server;

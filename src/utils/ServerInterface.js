
angular.module('cge.server').factory('cge.server.Interface', ['cge.server.Ajax', 'cge.utils.Logger', function(ajax, log) {

   server = {};

   /******************************************************************************
    * Server Events
    ******************************************************************************/
   server.events = {
      SI_LOGIN: 1,
      SI_TOKEN_SET: 2,
      SI_GAME_TYPES_RETRIEVED: 3,
      SI_DECK_SPEC_RETRIEVED: 4,
      SI_USER_GAMES_RETRIEVED: 5,
      SI_USER_JOINABLE_GAMES_RETRIEVED: 6,
      SI_JOINED_GAME: 7,
      SI_GAME_STARTED: 8,
      SI_GAME_PAUSED: 9,
      SI_GAME_RESUMED: 10,
      SI_GAME_ENDED: 11,
      SI_SERVER_ERROR: 12,  // All server errors call this event
      SI_MAX_EVENT: 13   // For validation: should always be
                         // one more than the last event.
   };


   /******************************************************************************
    * Server Status/Error Values
    ******************************************************************************/
   server.status = {
      SI_SUCCESS: 0,
      SI_FAILURE: -1,  // The specific error is unknown
      SI_ERROR_INVALID_EVENT: -2,
      SI_ERROR_INVALID_CALLBACK: -3,
      SI_ERROR_CALLBACK_ALREADY_EXISTS: -4,
      SI_ERROR_NOT_FOUND: -5,
      SI_ERROR_TOKEN_INVALID: -6,
      SI_ERROR_SERVER_TIMEOUT: -7,
      SI_ERROR_SERVER_DATABASE: -8,
      SI_ERROR_SERVER_ERROR_NOT_FOUND: -9,
      SI_ERROR_LOGIN_INVALID: -10,
      SI_ERROR_REGISTER_NAME_EXISTS: -11
   };


   /******************************************************************************
    * Server CGEServer Error Codes
    ******************************************************************************/
   server.cgeError = {
      SI_CGE_ERROR_USER_EXISTS: 1,
      SI_CGE_ERROR_DB_ERROR: 2,
      SI_CGE_ERROR_NOT_FOUND: 3
   };

   /******************************************************************************
    * Server Callbacks
    ******************************************************************************/
   server.callBacks = {};

   server.AddCallback = function (event, callback) {
      var status = server.status.SI_SUCCESS;

      if ((event <= 0) || (event >= server.events.SI_MAX_EVENT)) {
         status = server.status.SI_ERROR_INVALID_EVENT;
      }
      else if (typeof(callback) !== "function") {
         status = server.status.SI_ERROR_INVALID_CALLBACK;
      }
      else {
         if (server.callBacks[event] === undefined) {
            server.callBacks[event] = [];
         }

         if (server.callBacks[event].indexOf(callback) != -1) {
            status = server.status.SI_ERROR_CALLBACK_ALREADY_EXISTS;
         }
         else {
            server.callBacks[event].push(callback);
         }
      }

      return status;
   };


   server.RemoveCallback = function (event, callback) {
      var status = server.status.SI_SUCCESS;

      if ((event <= 0) || (event >= server.events.SI_MAX_EVENT)) {
         status = server.status.SI_ERROR_INVALID_EVENT;
      }
      else if (server.callBacks[event] === undefined) {
         status = server.status.SI_ERROR_NOT_FOUND;
      }
      else if (typeof(callback) !== "function") {
         status = server.status.SI_ERROR_INVALID_CALLBACK;
      }
      else {
         var index = server.callBacks[event].indexOf(callback);

         if (index > -1) {
            server.callBacks[event].splice(index, 1);
         }
         else {
            status = server.status.SI_ERROR_NOT_FOUND;
         }
      }

      return status;
   };


   // More for testing purposes.
   server.ResetCallbacks = function () {
      server.callBacks = {};
   };


   server.CallBack = function (event, callStatus, data) {
      var status = server.status.SI_SUCCESS;

      if ((event <= 0) || (event >= server.events.SI_MAX_EVENT)) {
         status = server.status.SI_ERROR_INVALID_EVENT;
      }
      else if (server.callBacks[event] === undefined) {
         status = server.status.SI_ERROR_NOT_FOUND;
      }
      else {
         for (var cntr = 0; cntr < server.callBacks[event].length; cntr++) {
            if (typeof(server.callBacks[event][cntr]) == "function") {
               (server.callBacks[event][cntr])(callStatus, data);
            }
         }
      }

      return status;
   };


   /******************************************************************************
    * Server Authentication Token
    ******************************************************************************/
   server.token = {
      valid: false,
      userId: 0
   };

   server.SetTokenUser = function (userId) {
      server.token.userId = userId;
      server.token.valid = true;
      server.CallBack(server.events.SI_TOKEN_SET, server.status.SI_SUCCESS, null);
   };


   server.ClearToken = function () {
      server.token.valid = false;
      server.token.userId = 0;
   };


   /******************************************************************************
    * Register User
    ******************************************************************************/
   server.RegisterUser = function (username, password, displayName, email) {
      var postData = {
         'action': 'cge_register_user',
         'username': username,
         'password': password,
         'display_name': displayName,
         'email': email
      };

      ajax.ServerPost(postData, server.RegisterUserSuccess, server.RegisterUserFailure);

      return server.status.SI_SUCCESS;
   };


   server.RegisterUserSuccess = function (response) {
      var status = server.status.SI_SUCCESS;

      if (response.cge_error_id !== undefined) {
         if (response.cge_error_id == server.cgeError.SI_CGE_ERROR_USER_EXISTS) {
            status = server.status.SI_ERROR_REGISTER_NAME_EXISTS;
         }
         else if (response.cge_error_id == server.cgeError.SI_CGE_ERROR_DB_ERROR) {
            status = server.status.SI_ERROR_SERVER_DATABASE;
         }
         else {
            status = server.status.SI_FAILURE;
         }
      }

      server.CallBack(server.events.SI_LOGIN, status, response);
   };


   server.RegisterUserFailure = function (callStatus) {
      server.Failure(status, "RegisterUser");
      server.HandleAjaxFailure(server.events.SI_LOGIN, callStatus);
   };


   /******************************************************************************
    * Login User
    ******************************************************************************/
   server.LoginUser = function (username, password) {
      var postData = {
         'action': 'cge_login_user',
         'username': username,
         'password': password
      };

      ajax.ServerPost(postData, server.LoginUserSuccess, server.LoginUserFailure);

      return server.status.SI_SUCCESS;
   };


   server.LoginUserSuccess = function (response) {
      var status = server.status.SI_SUCCESS;

      if (response.cge_error_id !== undefined) {
         if (response.cge_error_id == server.cgeError.SI_CGE_ERROR_DB_ERROR) {
            status = server.status.SI_ERROR_LOGIN_INVALID;
         }
         else {
            status = server.status.SI_FAILURE;
         }
      }

      server.CallBack(server.events.SI_LOGIN, status, response);
   };


   server.LoginUserFailure = function (callStatus) {
      server.Failure(status, "LoginUser");
      server.HandleAjaxFailure(server.events.SI_LOGIN, callStatus);
   };


   /******************************************************************************
    * Get Game Types
    ******************************************************************************/
   server.GetGameTypes = function () {
      var postData = {
         'action': 'cge_get_game_types'
      };

      ajax.ServerPost(postData, server.GetGameTypesSuccess, server.GetGameTypesFailure);

      return server.status.SI_SUCCESS;
   };


   server.GetGameTypesSuccess = function (response) {
      var status = server.status.SI_SUCCESS;
      server.CallBack(server.events.SI_GAME_TYPES_RETRIEVED, status, response);
   };


   server.GetGameTypesFailure = function (callStatus) {
      server.Failure(status, "GetGameTypes");
      server.HandleAjaxFailure(server.events.SI_GAME_TYPES_RETRIEVED, callStatus);
   };


   /******************************************************************************
    * Load Deck Spec
    ******************************************************************************/
   server.LoadDeckSpec = function (deckTypeId) {
      var postData = {
         'action': 'cge_load_deck_spec',
         'deck_type': deckTypeId
      };

      ajax.ServerPost(postData, server.LoadDeckSpecSuccess, server.LoadDeckSpecFailure);

      return server.status.SI_SUCCESS;
   };


   server.LoadDeckSpecSuccess = function (response) {
      var status = server.status.SI_SUCCESS;

      if (response.cge_error_id !== undefined) {
         if (response.cge_error_id == server.cgeError.SI_CGE_ERROR_NOT_FOUND) {
            status = server.status.SI_ERROR_SERVER_ERROR_NOT_FOUND;
         }
         else {
            status = server.status.SI_FAILURE;
         }
      }

      server.CallBack(server.events.SI_DECK_SPEC_RETRIEVED, status, response);
   };


   server.LoadDeckSpecFailure = function (callStatus) {
      server.Failure(status, "LoadDeckSpec");
      server.HandleAjaxFailure(server.events.SI_DECK_SPEC_RETRIEVED, callStatus);
   };


   /******************************************************************************
    * Get User Games
    ******************************************************************************/
   server.GetUserGames = function () {
      if ((server.token.valid == true) && (server.token.userId != 0)) {
         var postData = {
            'action': 'cge_get_my_games',
            'user_id': server.token.userId
         };

         ajax.ServerPost(postData, server.GetUserGamesSuccess, server.GetUserGamesFailure);

         return server.status.SI_SUCCESS;
      }
      else {
         return server.status.SI_ERROR_TOKEN_INVALID;
      }
   };


   server.GetUserGamesSuccess = function (response) {
      var status = server.status.SI_SUCCESS;
      server.CallBack(server.events.SI_USER_GAMES_RETRIEVED, status, response);
   };


   server.GetUserGamesFailure = function (status) {
      server.Failure(status, "GetUserGames");
      server.HandleAjaxFailure(server.events.SI_DECK_SPEC_RETRIEVED, status);
   };


   /******************************************************************************
    * Get Join-able Games
    ******************************************************************************/
   server.GetJoinableGames = function () {
      if ((server.token.valid == true) && (server.token.userId != 0)) {
         var postData = {
            'action': 'cge_get_joinable_games',
            'user_id': server.token.userId
         };

         ajax.ServerPost(postData, server.GetJoinableGamesSuccess, server.GetJoinableGamesFailure);

         return server.status.SI_SUCCESS;
      }
      else {
         return server.status.SI_ERROR_TOKEN_INVALID;
      }
   };


   server.GetJoinableGamesSuccess = function (response) {
      var status = server.status.SI_SUCCESS;
      server.CallBack(server.events.SI_USER_JOINABLE_GAMES_RETRIEVED, status, response);
   };


   server.GetJoinableGamesFailure = function (status) {
      server.Failure(status, "GetJoinableGames");
   };


   /******************************************************************************
    * Join Game
    ******************************************************************************/
   server.JoinGame = function (gameId) {
      if ((server.token.valid == true) && (server.token.userId != 0)) {
         var postData = {
            'action': 'cge_join_game',
            'game_id': gameId,
            'user_id': token.server.userId
         };

         ajax.ServerPost(postData, server.JoinGameSuccess, server.JoinGameFailure);

         return server.status.SI_SUCCESS;
      }
      else {
         return server.status.SI_ERROR_TOKEN_INVALID;
      }
   };


   server.JoinGameSuccess = function (game) {
   };


   server.JoinGameFailure = function (status) {
      server.Failure(status, "JoinGame");
   };


   /******************************************************************************
    * Start Game
    ******************************************************************************/
   server.StartGame = function (gameId) {
      if ((server.token.valid == true) && (server.token.userId != 0)) {
         var postData = {
            'action': 'cge_start_game',
            'user_id': server.token.userId,
            'game_type_id': gameId
         };

         ajax.ServerPost(postData, server.StartGameSuccess, server.StartGameFailure);

         return server.status.SI_SUCCESS;
      }
      else {
         return server.status.SI_ERROR_TOKEN_INVALID;
      }
   };


   server.StartGameSuccess = function (game) {
   };


   server.StartGameFailure = function (status) {
      server.Failure(status, "StartGame");
   };


   /******************************************************************************
    *
    ******************************************************************************/
   server.GetNumPlayersInGame = function (gameId) {
      var postData = {
         'action': 'cge_get_num_players',
         'game_id': gameId
      };

      ajax.ServerPost(postData, server.GetNumPlayersInGameSuccess, server.GetNumPlayersInGameFailure);

      return server.status.SI_SUCCESS;
   };


   server.GetNumPlayersInGameSuccess = function (game) {
   };


   server.GetNumPlayersInGameFailure = function (status) {
      server.Failure(status, "GetNumPlayersInGame");
   };


   /******************************************************************************
    * Record Transaction
    ******************************************************************************/
   server.RecordTransaction = function (gameId,
                                        fromContainer,
                                        toContainer,
                                        cards) {
      if ((server.token.valid == true) && (server.token.userId != 0)) {
         var postData = {
            'action': 'cge_record_transaction',
            'game_id': gameId,
            'user_id': server.token.userId,
            'from_group_id': fromContainer,
            'to_group_id': toContainer,
            'items': cards
         };

         ajax.ServerPost(postData, server.RecordTransactionSuccess, server.RecordTransactionFailure);

         return server.status.SI_SUCCESS;
      }
      else {
         return server.status.SI_ERROR_TOKEN_INVALID;
      }
   };


   server.RecordTransactionSuccess = function (response) {
   };


   server.RecordTransactionFailure = function (status) {
      server.Failure(status, "RecordTransaction");
   };


   /******************************************************************************
    * Pause Game
    ******************************************************************************/
   server.PauseGame = function (gameId) {
      if ((server.token.valid == true) && (server.token.userId != 0)) {
         var postData = {
            'action': 'cge_pause_game',
            'game_id': gameId,
            'user_id': server.token.userId
         };

         ajax.ServerPost(postData, server.PauseGameSuccess, server.PauseGameFailure);

         return server.status.SI_SUCCESS;
      }
      else {
         return server.status.SI_ERROR_TOKEN_INVALID;
      }
   };


   server.PauseGameSuccess = function (success) {
   };


   server.PauseGameFailure = function (status) {
      server.Failure(status, "PauseGame");
   };


   /******************************************************************************
    * Resume Game
    ******************************************************************************/
   server.ResumeGame = function (gameId) {
      if ((server.token.valid == true) && (server.token.userId != 0)) {
         var postData = {
            'action': 'cge_resume_game',
            'game_id': gameId,
            'user_id': server.token.userId
         };

         ajax.ServerPost(postData, server.ResumeGameSuccess, server.ResumeGameFailure);

         return server.status.SI_SUCCESS;
      }
      else {
         return server.status.SI_ERROR_TOKEN_INVALID;
      }
   };


   server.ResumeGameSuccess = function (success) {
   };


   server.ResumeGameFailure = function (status) {
      server.Failure(status, "ResumeGame");
   };


   /******************************************************************************
    * End Game
    ******************************************************************************/
   server.EndGame = function (gameId) {
      if ((server.token.valid == true) && (server.token.userId != 0)) {
         var postData = {
            'action': 'cge_end_game',
            'game_id': gameId,
            'user_id': server.token.userId
         };

         ajax.ServerPost(postData, server.EndGameSuccess, server.EndGameFailure);

         return server.status.SI_SUCCESS;
      }
      else {
         return server.status.SI_ERROR_TOKEN_INVALID;
      }
   };


   server.EndGameSuccess = function (success) {
   };


   server.EndGameFailure = function (status) {
      server.Failure(status, "EndGame");
   };


   /******************************************************************************
    * Ack Event
    ******************************************************************************/
   server.AckEvent = function (userId, gameId, notificationId) {
      var postData = {
         'action': 'cge_ack_event',
         'game_id': gameId,
         'user_id': userId,
         'notif_id': notificationId
      };

      ajax.ServerPost(postData, server.AckEventSuccess, server.AckEventFailure);

      return server.status.SI_SUCCESS;
   };


   server.AckEventSuccess = function (game) {
   };


   server.AckEventFailure = function (status) {
      server.Failure(status, "AckEvent");
   };


   /******************************************************************************
    * Handle Ajax Failure
    ******************************************************************************/
   server.HandleAjaxFailure = function (event, callStatus) {
      var status = server.status.SI_FAILURE;

      if ((callStatus >= 400) && (callStatus < 500)) {
         switch (callStatus) {
            case 408:
               status = server.status.SI_ERROR_SERVER_TIMEOUT;
               break;
         }
      }

      server.CallBack(event, status, undefined);
   };


   /******************************************************************************
    * Failure to Send - TODO: Needs some thought
    ******************************************************************************/
   server.Failure = function (status, name) {
      log.warn("ServerInterface Error: " + status + " in " + name);
   };

   return server;
}]);

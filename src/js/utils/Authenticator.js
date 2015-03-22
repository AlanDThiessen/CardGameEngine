
angular.module('cge.server').
    factory('cge.server.Authenticator', ['cge.server.Interface', function(server) {

   authenticator = {};

   /******************************************************************************
    * Authenticator Events
    ******************************************************************************/
   authenticator.events = {
      AUTH_USER_REGISTER: 1,
      AUTH_USER_LOG_IN: 2,
      AUTH_USER_LOG_OUT: 3,

      // For validation: should always be one more than the last event.
      AUTH_MAX_EVENT: 4
   };


   /******************************************************************************
    * Authenticator Status/Error Values
    ******************************************************************************/
   authenticator.status = {
      // Successfull status
      AUTH_SUCCESS: 0,
      AUTH_PENDING_REGISTRATION: 1,
      AUTH_PENDING_LOGIN: 2,
      AUTH_USER_AUTHENTICATED: 3,
      AUTH_USER_NOT_AUTHENTICATED: 4,

      // Error codes
      AUTH_FAILURE: -1,  // The specific error is unknown
      AUTH_USERNAME_EXISTS: -2,
      AUTH_SERVER_ERROR: -3,  // The server timed-out or returned an error
      AUTH_AUTHENTICATION_ERROR: -4
   };


   /******************************************************************************
    * Authenticator Callbacks
    ******************************************************************************/
   authenticator.callBacks = [];


   authenticator.AddCallback = function (callback) {
      var status = false;

      if (typeof(callback) === "function") {
         if (authenticator.callBacks.indexOf(callback) == -1) {
            authenticator.callBacks.push(callback);
            status = true;
         }
      }

      return status;
   };


   authenticator.RemoveCallback = function (callback) {
      var status = false;

      if (typeof(callback) === "function") {
         var index = authenticator.callBacks.indexOf(callback);

         if (index > -1) {
            authenticator.callBacks.splice(index, 1);
            status = true;
         }
      }

      return status;
   }


// More for testing purposes.
   authenticator.ResetCallbacks = function () {
      authenticator.callBacks = [];
   };


   authenticator.CallBack = function (event, callStatus) {
      var status = false;

      if ((event > 0) && (event < authenticator.events.AUTH_MAX_EVENT)) {
         for (var cntr = 0; cntr < authenticator.callBacks.length; cntr++) {
            if (typeof(authenticator.callBacks[cntr]) === "function") {
               (authenticator.callBacks[cntr])(event, callStatus);
            }
         }

         status = true;
      }

      return status;
   };


   /******************************************************************************
    * Authenticator Token
    ******************************************************************************/
   authenticator.token = {
      status: authenticator.status.AUTH_USER_NOT_AUTHENTICATED,
      userId: undefined,
      userName: undefined,
      displayName: undefined,
      email: undefined
   };


   authenticator.InitToken = function () {
      authenticator.token.status = authenticator.status.AUTH_USER_NOT_AUTHENTICATED;
      authenticator.token.userId = undefined;
      authenticator.token.userName = undefined;
      authenticator.token.displayName = undefined;
      authenticator.token.email = undefined;

      server.ClearToken();
   };


   authenticator.SetToken = function (data) {
      authenticator.token.status = authenticator.status.AUTH_USER_AUTHENTICATED;
      authenticator.token.userId = data.id;
      authenticator.token.userName = data.username;
      authenticator.token.displayName = data.display_name;
      authenticator.token.email = data.email;

      server.SetTokenUser(authenticator.token.userId);
   };


   authenticator.GetUserStatus = function () {
      return authenticator.token.status;
   };


   authenticator.GetUserId = function () {
      return authenticator.token.userId;
   };


   authenticator.GetUserName = function () {
      return authenticator.token.userName;
   };


   authenticator.GetUserDisplayName = function () {
      return authenticator.token.displayName;
   };


   authenticator.GetUserEmail = function () {
      return authenticator.token.email;
   };


   /******************************************************************************
    * Server Event Handlers
    ******************************************************************************/
   authenticator.ServerLoginCallback = function (status, data) {
      var authEvent;

      if (authenticator.token.status == authenticator.status.AUTH_PENDING_REGISTRATION) {
         authEvent = authenticator.events.AUTH_USER_REGISTER;
      }
      else if (authenticator.token.status == authenticator.status.AUTH_PENDING_LOGIN) {
         authEvent = authenticator.events.AUTH_USER_LOG_IN;
      }

      switch (status) {
         case server.status.SI_SUCCESS:
            authenticator.SetToken(data);
            authenticator.CallBack(authEvent,
                authenticator.status.AUTH_USER_AUTHENTICATED);
            break;

         case server.status.SI_ERROR_REGISTER_NAME_EXISTS:
            authenticator.InitToken();
            authenticator.CallBack(authEvent,
                authenticator.status.AUTH_USERNAME_EXISTS);
            break;

         case server.status.SI_ERROR_SERVER_DATABASE:
            authenticator.InitToken();
            authenticator.CallBack(authEvent,
                authenticator.status.AUTH_SERVER_ERROR);
            break;

         case server.status.SI_ERROR_LOGIN_INVALID:
            authenticator.InitToken();
            authenticator.CallBack(authEvent,
                authenticator.status.AUTH_AUTHENTICATION_ERROR);
            break;

         case server.status.SI_FAILURE:
            authenticator.InitToken();
            authenticator.CallBack(authEvent,
                authenticator.status.AUTH_FAILURE);
            break;
      }
   };


   authenticator.ServerErrorCallback = function (callStatus, data) {
      authenticator.InitToken();
      authenticator.CallBack(authenticator.events.AUTH_USER_LOG_OUT,
          authenticator.status.AUTH_SERVER_ERROR);
   };


   /******************************************************************************
    * Authenticator Interface Methods
    ******************************************************************************/
   authenticator.Init = function () {
      server.AddCallback(server.events.SI_LOGIN, authenticator.ServerLoginCallback);
      server.AddCallback(server.events.SI_SERVER_ERROR, authenticator.ServerErrorCallback);
   };

   authenticator.RegisterUser = function (userName, password, displayName, email) {
      var status = server.RegisterUser(userName, password, displayName, email);

      if (status == server.status.SI_SUCCESS) {
         authenticator.token.status = authenticator.status.AUTH_PENDING_REGISTRATION;
      }
   };


   authenticator.LoginUser = function (userName, password) {
      var status = server.LoginUser(userName, password);

      if (status == server.status.SI_SUCCESS) {
         authenticator.token.status = authenticator.status.AUTH_PENDING_LOGIN;
      }
   };


   authenticator.LogoutUser = function () {
      authenticator.InitToken();
      authenticator.CallBack(authenticator.events.AUTH_USER_LOG_OUT,
          authenticator.status.AUTH_USER_NOT_AUTHENTICATED);
   };


   return authenticator;
}]);


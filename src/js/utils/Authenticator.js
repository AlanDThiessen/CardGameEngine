
server = require("./ServerInterface.js");

authenticator = {};


/******************************************************************************
 * Authenticator Events
 ******************************************************************************/
authenticator.events = {
   AUTH_REGISTRATION:                    1,
   AUTH_USER_LOGGED_IN:                  2,
   AUTH_USER_LOGGED_OUT:                 3,
   AUTH_MAX_EVENT:                       4   // For validation: should always be
                                             // one more than the last event.
};


/******************************************************************************
 * Authenticator Status/Error Values
 ******************************************************************************/
authenticator.status = {
   // Successfull status
   AUTH_SUCCESS:                         0,
   AUTH_REQUESTED:                       1,
   AUTH_USER_AUTHENTICATED:              2,
   AUTH_USER_NOT_AUTHENTICATED:          3,

   // Error codes   
   AUTH_FAILURE:                        -1,  // The specific error is unknown
   AUTH_USERNAME_EXISTS:                -2,
   AUTH_SERVER_ERROR:                   -3,
   AUTH_AUTHENTICATION_ERROR:           -4
};


/******************************************************************************
 * Authenticator Callbacks
 ******************************************************************************/
authenticator.callBacks = [
];


authenticator.AddCallback = function(callback) {
   var status = false;

   if(typeof(callback) === "function") {
      if(authenticator.callBacks.indexOf(callback) == -1) {
         authenticator.callBacks.push(callback);
         status = true;
      }
   }

   return status;
};


authenticator.RemoveCallback = function(callback) {
   var status = false;

   if(typeof(callback) === "function" ) {
      var index = authenticator.callBacks.indexOf(callback);

      if(index > -1) {
         authenticator.callBacks.splice(index, 1);
         status = true;
      }
   }

   return status;
}


// More for testing purposes.
authenticator.ResetCallbacks = function() {
   authenticator.callBacks = [];
};


authenticator.CallBack = function(event, callStatus, data) {
   var status = false;

   if((event > 0) && (event < authenticator.events.AUTH_MAX_EVENT)) {
      for(var cntr = 0; cntr < authenticator.callBacks.length; cntr++) {
         if(typeof(authenticator.callBacks[cntr]) === "function") {
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
   status:        authenticator.status.AUTH_USER_NOT_AUTHENTICATED,
   userId:        undefined,
   userName:      undefined,
   displayName:   undefined,
   email:         undefined
};

authenticator.GetUserStatus = function() {
   return authenticator.token.status;
};

authenticator.GetUserId = function() {
   return authenticator.token.userId;
};

authenticator.GetUserName = function() {
   return authenticator.token.userName;
};

authenticator.GetUserDisplayName = function() {
   return authenticator.token.displayName;
};

authenticator.GetUserEmail = function() {
   return authenticator.token.email;
};


/******************************************************************************
 * Server Event Handlers
 ******************************************************************************/
authenticator.ServerLoginCallback = function(status, data) {

};



/******************************************************************************
 * Authenticator Interface Methods
 ******************************************************************************/
authenticator.Init = function() {
   authenticator.token.status       = authenticator.status.AUTH_USER_NOT_AUTHENTICATED;
   authenticator.token.userId       = undefined;
   authenticator.token.userName     = undefined;
   authenticator.token.displayName  = undefined;
   authenticator.token.email        = undefined;

   server.AddCallback(server.events.SI_LOGIN, authenticator.ServerLoginCallback);
};


authenticator.RegisterUser = function(userName, password, displayName, email) {
   var status = server.RegisterUser(userName, password, displayName, email);

   if(status == server.status.SI_SUCCESS) {
      authenticator.token.status = authenticator.status.AUTH_REQUESTED;
   }
};


authenticator.LoginUser = function(userName, password) {

};


authenticator.LogoutUser = function() {

};


module.exports = authenticator;


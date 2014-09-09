
server = require("./ServerInterface.js");

authenticator = {};

/******************************************************************************
 * Authenticator Events
 ******************************************************************************/
authenticator.events = {
   AUTH_REGISTRATION:                    1,
   AUTH_USER_AUTHENTICATED:              2,
   AUTH_USER_NOT_AUTHENTICATED:          3,
   AUTH_MAX_EVENT:                       4   // For validation: should always be
                                             // one more than the last event.
};


/******************************************************************************
 * Authenticator Status/Error Values
 ******************************************************************************/
authenticator.status = {
   // Successfull status
   AUTH_SUCCESS:                         0,
   AUTH_USER_AUTHENTICATED:              1,
   AUTH_USER_NOT_AUTHENTICATED:          2,

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



module.exports = authenticator;


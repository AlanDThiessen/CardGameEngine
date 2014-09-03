
// Pull in the module we're testing.
var server = require("../../../src/js/utils/ServerInterface.js");


describe( "ServerInterface", function() {
   // Terminology:
   //    "Indicate" - The status is returned when queried.
   //    "Report" - The module calls a call-back method.

   describe("-when adding a callback method,", function() {

      beforeEach(function() {
         server.ResetCallbacks();
      });

      it("adds a valid callback method for the lowest event", function() {
         var TestCallBackAdd = function() {
            // Nothing needs to be done in this function
         };

         // Validate the lowest event
         var minStatus = server.AddCallback(1, TestCallBackAdd);
         expect(minStatus).toEqual(server.status.SI_SUCCESS);
         expect(server.callBacks[1]).toBeDefined();
         expect(server.callBacks[1]).toContain(TestCallBackAdd);
      });

      it("adds a valid callback method for the highest event", function() {
         var TestCallBackAdd = function() {
            // Nothing needs to be done in this function
         };

         // Validate the highest event
         var maxStatus = server.AddCallback((server.events.SI_MAX_EVENT - 1), TestCallBackAdd);
         expect(maxStatus).toEqual(server.status.SI_SUCCESS);
         expect(server.callBacks[(server.events.SI_MAX_EVENT - 1)]).toBeDefined();
         expect(server.callBacks[(server.events.SI_MAX_EVENT - 1)]).toContain(TestCallBackAdd);
      });

      it("indicates an error for too low of an event", function() {
         var TestCallBackAdd = function() {
            // Nothing needs to be done in this function
         };

         // Validate 0 is an invalid number
         var minStatus = server.AddCallback(0, TestCallBackAdd);
         expect(minStatus).toEqual(server.status.SI_ERROR_INVALID_EVENT);
         expect(server.callBacks[0]).toBeUndefined();
      });

      it("indicates an error for too high of an event", function() {
         var TestCallBackAdd = function() {
            // Nothing needs to be done in this function
         };

         // Validate the maximum number is invalid
         var maxStatus = server.AddCallback(server.events.SI_MAX_EVENT, TestCallBackAdd);
         expect(maxStatus).toEqual(server.status.SI_ERROR_INVALID_EVENT);
         expect(server.callBacks[server.status.SI_MAX_EVENT]).toBeUndefined();
      });

      it("indicates an error for invalid callback method", function() {
         var TestCallBackAdd = "Just Testing";     // Oops! It's not a funciton!

         var status = server.AddCallback(1, TestCallBackAdd);
         expect(status).toEqual(server.status.SI_ERROR_INVALID_CALLBACK);
         expect(server.callBacks[1]).toBeUndefined();
      });

   });

   describe("-when removing a callback method,", function() {
      var CallBackMin = function() {};
      var CallBackMax = function() {};

      beforeEach(function() {
         server.ResetCallbacks();

         server.AddCallback(1, CallBackMin);
         server.AddCallback((server.events.SI_MAX_EVENT - 1), CallBackMax);
      });

      it("removes a callback method from the minimum event", function() {
         var status = server.RemoveCallback(1, CallBackMin);
         expect(status).toEqual(server.status.SI_SUCCESS);
         expect(server.callBacks[1]).not.toContain(CallBackMin);
      });

      it("removes a callback method from the maximum event", function() {
         var status = server.RemoveCallback((server.events.SI_MAX_EVENT - 1), CallBackMax);
         expect(status).toEqual(server.status.SI_SUCCESS);
         expect(server.callBacks[(server.events.SI_MAX_EVENT - 1)]).not.toContain(CallBackMax);
      });

      it("indicates an error for too low of an event", function() {
         var status = server.RemoveCallback(0, CallBackMax);
         expect(status).toEqual(server.status.SI_ERROR_INVALID_EVENT);
      });

      it("indicates an error for too high of an event", function() {
         var status = server.RemoveCallback(server.events.SI_MAX_EVENT, CallBackMax);
         expect(status).toEqual(server.status.SI_ERROR_INVALID_EVENT);
      });

      it("indicates an error for invalid callback method", function() {
         var TestCallBackAdd = "Just Testing";     // Oops! It's not a funciton!

         var status = server.RemoveCallback(1, TestCallBackAdd);
         expect(status).toEqual(server.status.SI_ERROR_INVALID_CALLBACK);
         expect(server.callBacks[1]).toContain(CallBackMin);
      });

      it("indicates if the event is not found", function() {
         var status = server.RemoveCallback(2, CallBackMax);
         expect(status).toEqual(server.status.SI_ERROR_NOT_FOUND);
      });

      it("indicates if the method is not found", function() {
         var status = server.RemoveCallback(1, CallBackMax);
         expect(status).toEqual(server.status.SI_ERROR_NOT_FOUND);
         expect(server.callBacks[1]).toContain(CallBackMin);
      });
      
   });

   // The authentication token indicates a user is logged-in.  With no auth
   // token, certain functionality is not allowed.
   describe("-with no authentication token,", function() {

      xit("registers a user", function(done) {
      });

      xit("logs-in a user", function(done) {
      });

      xit("retrieves game types", function(done) {
      });

      xit("retrieves a deck specification", function(done) {
      });

      xit("indicates not-connected when requested to retrieve user's games", function(done) {
      });

      xit("indicates not-connected when requested to retrieve joinable games for user", function(done) {
      });

      xit("indicates not-connected when requested to join a game", function(done) {
      });

      xit("indicates not-connected when requested to start a game", function(done) {
      });

      xit("indicates not-connected when requested to record a transaction", function(done) {
      });

      xit("indicates not-connected when requested to pause a game", function(done) {
      });

      xit("indicates not-connected when requested to resume a game", function(done) {
      });

      xit("indicates not-connected when requested to end a game", function(done) {
      });

   });

   describe("-with authentication token,", function() {

      xit("accepts a token", function() {
      });
      
      xit("clears the token", function() {
      });

      xit("retrieves game types", function(done) {
      });

      xit("retrieves a deck specification", function(done) {
      });

      xit("retrieves user's games", function(done) {
      });

      xit("retrieves joinable games for user", function(done) {
      });

      xit("joins a game", function(done) {
      });

      xit("starts a game", function(done) {
      });

      xit("records a transaction", function(done) {
      });

      xit("pauses a game", function(done) {
      });

      xit("resumes a game", function(done) {
      });

      xit("ends a game", function(done) {
      });

   });

   // Not sure why this is necessary... ???
   xit("retrieves number of players in a game", function(done) {
   });

} );


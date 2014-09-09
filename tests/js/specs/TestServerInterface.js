
// Pull in the module we're testing.
var server = require("../../../src/js/utils/ServerInterface.js");


describe( "ServerInterface", function() {
   // Terminology:
   //    "Indicate" - The status is returned when queried.
   //    "Report" - The module calls a call-back method.

   describe("-when adding a callback method,", function() {

      afterEach(function() {
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
      
      it("indicates an error if the same callback is added twice", function() {
         var TestCallBackAdd = function() {
            // Nothing needs to be done in this function
         };

         // Validate the lowest event
         var minStatus = server.AddCallback(1, TestCallBackAdd);
         expect(minStatus).toEqual(server.status.SI_SUCCESS);
         expect(server.callBacks[1]).toBeDefined();
         expect(server.callBacks[1]).toContain(TestCallBackAdd);
         var newStatus = server.AddCallback(1, TestCallBackAdd);
         expect(newStatus).toEqual(server.status.SI_ERROR_CALLBACK_ALREADY_EXISTS);
         expect(server.callBacks[1].length).toEqual(1);
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

      it("calls back multiple functions with the same event", function() {
         var counter = 0;

         var CallBack1 = function(status, data) {
            if(status) {
               counter += 1;
            }
         };

         var CallBack2 = function(status, data) {
            if(status) {
               counter += 2;
            }
         };

         var status1 = server.AddCallback(server.events.SI_LOGIN, CallBack1);
         var status2 = server.AddCallback(server.events.SI_LOGIN, CallBack2);

         // Normally, this method is not called external of the ServerInterface;
         // However, for testing purposes...
         var status3 = server.CallBack(server.events.SI_LOGIN, true, undefined);

         expect(status1).toEqual(server.status.SI_SUCCESS);
         expect(status2).toEqual(server.status.SI_SUCCESS);
         expect(status3).toEqual(server.status.SI_SUCCESS);
         expect(counter).toEqual(3);
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

      afterEach(function() {
         server.ResetCallbacks();
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
   describe("-when registering a user,", function() {

      beforeEach(function() {
         jasmine.Ajax.install();
      });

      afterEach(function() {
         jasmine.Ajax.uninstall();
         server.ResetCallbacks();
      });

      it("reports error if user exists", function() {
         var status = undefined;

         var RegisterSuccess = function(callStatus, data) {
            status = callStatus;
         };

         var addStatus = server.AddCallback(server.events.SI_LOGIN, RegisterSuccess);
         server.RegisterUser('TestUser', 'TestPassword');

         jasmine.Ajax.requests.mostRecent().response({
            "status": 200,
            "content-type": 'text/JSON',
            "responseText": '{"cge_error_id": "001", "cge_error": "User TestUser already exists."}'
         });

         expect(status).toEqual(server.status.SI_ERROR_REGISTER_NAME_EXISTS);
      });
      
      it("reports an error if the server responds with an error", function() {
         var status = undefined;

         var RegisterSuccess = function(callStatus, data) {
            status = callStatus;
         };

         var addStatus = server.AddCallback(server.events.SI_LOGIN, RegisterSuccess);
         server.RegisterUser('TestUser', 'TestPassword');

         jasmine.Ajax.requests.mostRecent().response({
            "status": 200,
            "content-type": 'text/JSON',
            "responseText": '{"cge_error_id": "002", "cge_error": "Database error."}'
         });

         expect(status).toEqual(server.status.SI_ERROR_SERVER_DATABASE);
      });
      
      it("reports successful user registration", function() {
         var status = undefined;

         var RegisterSuccess = function(callStatus, data) {
            status = callStatus;
         };

         var addStatus = server.AddCallback(server.events.SI_LOGIN, RegisterSuccess);
         server.RegisterUser('TestUser', 'TestPassword', "Test User 1", "testuser1@chamrock.net");

         jasmine.Ajax.requests.mostRecent().response({
            "status": 200,
            "content-type": 'text/JSON',
            "responseText":   '{"id": "0001",'
                            +  ' "username": "TestUser",'
                            +  ' "display_name": "Test User 1",'
                            +  ' "email": "testuser1@chamrock.net"'
                            + '}'
         });

         expect(status).toEqual(server.status.SI_SUCCESS);
      });
   });

   // The authentication token indicates a user is logged-in.  With no auth
   // token, certain functionality is not allowed.
   describe("-with no authentication token,", function() {

      beforeEach(function() {
         jasmine.Ajax.install();
      });

      afterEach(function() {
         jasmine.Ajax.uninstall();
         server.ResetCallbacks();
      });

      it("registers a user", function() {
         // At this point, we don't care about callbacks, just the return status
         var status = server.RegisterUser('TestUser', 'TestPassword', "Test User 1", "testuser1@chamrock.net");
         expect(status).toEqual(server.status.SI_SUCCESS);
      });

      it("logs-in a user", function() {
         // At this point, we don't care about callbacks, just the return status
         var status = server.LoginUser('TestUser', 'TestPassword');
         expect(status).toEqual(server.status.SI_SUCCESS);
      });

      xit("retrieves game types", function() {
      });

      xit("retrieves a deck specification", function() {
      });

      it("indicates not-connected when requested to retrieve user's games", function() {
         // At this point, we don't care about callbacks, just the return status
         var status = server.GetUserGames();
         expect(status).toEqual(server.status.SI_ERROR_TOKEN_INVALID);
      });

      it("indicates not-connected when requested to retrieve joinable games for user", function() {
         // At this point, we don't care about callbacks, just the return status
         var status = server.GetJoinableGames();
         expect(status).toEqual(server.status.SI_ERROR_TOKEN_INVALID);
      });

      it("indicates not-connected when requested to join a game", function() {
         // At this point, we don't care about callbacks, just the return status
         var status = server.JoinGame(1);
         expect(status).toEqual(server.status.SI_ERROR_TOKEN_INVALID);
      });

      it("indicates not-connected when requested to start a game", function() {
         // At this point, we don't care about callbacks, just the return status
         var status = server.StartGame(1);
         expect(status).toEqual(server.status.SI_ERROR_TOKEN_INVALID);
      });

      it("indicates not-connected when requested to record a transaction", function() {
         // At this point, we don't care about callbacks, just the return status
         var status = server.RecordTransaction(1, "from", "to", "{['SA', 'S2', 'S3'}]");
         expect(status).toEqual(server.status.SI_ERROR_TOKEN_INVALID);
      });

      it("indicates not-connected when requested to pause a game", function() {
         // At this point, we don't care about callbacks, just the return status
         var status = server.GetUserGames();
         expect(status).toEqual(server.status.SI_ERROR_TOKEN_INVALID);
      });

      it("indicates not-connected when requested to resume a game", function() {
         // At this point, we don't care about callbacks, just the return status
         var status = server.PauseGame(1);
         expect(status).toEqual(server.status.SI_ERROR_TOKEN_INVALID);
      });

      it("indicates not-connected when requested to end a game", function() {
         // At this point, we don't care about callbacks, just the return status
         var status = server.ResumeGame(1);
         expect(status).toEqual(server.status.SI_ERROR_TOKEN_INVALID);
      });

   });

   describe("-with authentication token,", function() {

      xit("accepts a token", function() {
      });
      
      xit("clears the token", function() {
      });

      xit("retrieves game types", function() {
      });

      xit("retrieves a deck specification", function() {
      });

      xit("retrieves user's games", function() {
      });

      xit("retrieves joinable games for user", function() {
      });

      xit("joins a game", function() {
      });

      xit("starts a game", function() {
      });

      xit("records a transaction", function() {
      });

      xit("pauses a game", function() {
      });

      xit("resumes a game", function() {
      });

      xit("ends a game", function() {
      });

   });

   // Not sure why this is necessary... ???
   xit("retrieves number of players in a game", function(done) {
   });

} );


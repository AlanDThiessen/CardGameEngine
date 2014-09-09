
// Pull in the module we're testing.
var auth = require("../../../src/js/utils/Authenticator.js");

describe("Authenticator", function() {

   // Terminology:
   //    "Indicate" - The status is returned when queried.
   //    "Report" - The module calls a call-back method.
   describe("-when adding a callback method,", function() {

      afterEach(function() {
         auth.ResetCallbacks();
      });

      it("adds a valid callback method", function() {
         var TestCallBackAdd = function() {
            // Nothing needs to be done in this function
         };

         // Validate the lowest event
         var status = auth.AddCallback(TestCallBackAdd);
         expect(status).toEqual(true);
         expect(auth.callBacks).toBeDefined();
         expect(auth.callBacks).toContain(TestCallBackAdd);
      });
      
      it("indicates an error if the same callback is added twice", function() {
         var TestCallBackAdd = function() {
            // Nothing needs to be done in this function
         };

         // Validate the lowest event
         var status = auth.AddCallback(TestCallBackAdd);
         expect(status).toEqual(true);
         expect(auth.callBacks).toBeDefined();
         expect(auth.callBacks).toContain(TestCallBackAdd);
         var newStatus = auth.AddCallback(TestCallBackAdd);
         expect(newStatus).toEqual(false);
         expect(auth.callBacks.length).toEqual(1);
      });

      it("indicates an error for invalid callback method", function() {
         var TestCallBackAdd = "Just Testing";     // Oops! It's not a funciton!

         var status = auth.AddCallback(TestCallBackAdd);
         expect(status).toEqual(false);
         expect(auth.callBacks.length).toEqual(0);
      });

      it("calls back multiple functions", function() {
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

         var status1 = auth.AddCallback(CallBack1);
         var status2 = auth.AddCallback(CallBack2);

         // Normally, this method is not called external of the ServerInterface;
         // However, for testing purposes...
         var status3 = auth.CallBack(auth.events.AUTH_REGISTRATION, auth.status.AUTH_SUCCESS, undefined);

         expect(status1).toEqual(true);
         expect(status2).toEqual(true);
         expect(status3).toEqual(true);
         expect(counter).toEqual(3);
      });

   });

   describe("-when removing a callback method,", function() {
      var CallBack1 = function() {};
      var CallBack2 = function() {};

      beforeEach(function() {
         auth.ResetCallbacks();
         auth.AddCallback(CallBack1);
      });

      afterEach(function() {
         auth.ResetCallbacks();
      });

      it("removes a callback method from the minimum event", function() {
         var status = auth.RemoveCallback(CallBack1);
         expect(status).toEqual(true);
         expect(auth.callBacks).not.toContain(CallBack1);
      });

      it("indicates an error for invalid callback method", function() {
         var TestCallBackAdd = "Just Testing";     // Oops! It's not a funciton!

         var status = auth.RemoveCallback(TestCallBackAdd);
         expect(status).toEqual(false);
         expect(auth.callBacks).toContain(CallBack1);
      });

      it("indicates if the method is not found", function() {
         var status = auth.RemoveCallback(CallBack2);
         expect(status).toEqual(false);
         expect(auth.callBacks).toContain(CallBack1);
      });
      
   });

   xit("indicates user not authenticated upon initialization", function() {
   });

   describe("-when not authenticated,", function() {

      xit("reports username exists error on user registration", function() {
      });

      xit("reports server error upon receiving a database error on user registration", function() {
      });

      xit("reports user authenticated upon successful registration", function() {
      });

      xit("reports authentication error with invalid username on authentication", function() {
      });

      xit("reports authentication error with invalid password on authentication", function() {
      });

      xit("reports user authenticated upon successful authentication", function() {
      });

      // The Authenticator supplies an authentication token to the server interface when
      // the user is authenticated.  The server interface uses that token for various
      // other interactions.
      xit("sends authentication token to server interface upon successful authentication", function() {
      });

   });

   describe("-when authenticated,", function() {

      xit("reports user un-authenticated upon receiving server error", function() {
      });

      xit("reports user un-authenticated upon user logout", function() {
      });

      xit("rescinds authentication token from server interface upon user un-authentication", function() {
      });

   });
});



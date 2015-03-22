
// TODO: It might be nice if we could mock these dependencies
angular.module('TestAuthenticator', []);


describe("Authenticator", function() {

   describe("-when initializing,", function() {
      var auth;

      beforeEach(module('cge.utils'));
      beforeEach(module('cge.server'));
      beforeEach(function() {
         inject(function($injector) {
            auth = $injector.get('cge.server.Authenticator');
         });
      });

      it("indicates user not authenticated upon initialization", function () {
         auth.Init();
         auth.InitToken();
         expect(auth.GetUserStatus()).toEqual(auth.status.AUTH_USER_NOT_AUTHENTICATED);
         expect(auth.GetUserId()).not.toBeDefined();
         expect(auth.GetUserName()).not.toBeDefined();
         expect(auth.GetUserDisplayName()).not.toBeDefined();
         expect(auth.GetUserEmail()).not.toBeDefined();
      });
   });

   // Terminology:
   //    "Indicate" - The status is returned when queried.
   //    "Report" - The module calls a call-back method.
   describe("-when adding a callback method,", function() {
      var auth;

      beforeEach(module('cge.utils'));
      beforeEach(module('cge.server'));
      beforeEach(function() {
         inject(function($injector) {
            auth = $injector.get('cge.server.Authenticator');
            auth.Init();
            auth.InitToken();
         });
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

         // Normally, this method is not called external of the Authenticator;
         // However, for testing purposes...
         var status3 = auth.CallBack(auth.events.AUTH_USER_REGISTER, auth.status.AUTH_SUCCESS);

         expect(status1).toEqual(true);
         expect(status2).toEqual(true);
         expect(status3).toEqual(true);
         expect(counter).toEqual(3);
      });

   });

   describe("-when removing a callback method,", function() {
      var CallBack1 = function() {};
      var CallBack2 = function() {};
      var auth;

      beforeEach(module('cge.utils'));
      beforeEach(module('cge.server'));
      beforeEach(function() {
         inject(function($injector) {
            auth = $injector.get('cge.server.Authenticator');
            auth.AddCallback(CallBack1);
            auth.Init();
            auth.InitToken();
         });
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

   describe("-when not authenticated,", function() {
      var auth;
      var mock;

      beforeEach(module('test.data.mockserver'));
      beforeEach(module('cge.utils'));
      beforeEach(module('cge.server'));
      beforeEach(function() {
         inject(function($injector) {
            mock = $injector.get('test.data.mockServer');
         });

         inject(function($injector) {
            auth = $injector.get('cge.server.Authenticator');
            auth.Init();
            auth.InitToken();
         });

         jasmine.Ajax.install();
      });

      afterEach(function() {
         jasmine.Ajax.uninstall();
         auth.LogoutUser();
      });

      it("reports username exists error on user registration", function() {
         var testEvent = undefined;
         var testStatus = undefined;

         var CallBack = function(event, status) {
            testEvent = event;
            testStatus = status;
         };

         expect(auth.AddCallback(CallBack)).toBeTruthy();
         auth.RegisterUser("TestUser", "testPassword", "Test User 1", "testuser1@chamrock.net");

         expect(auth.GetUserStatus()).toEqual(auth.status.AUTH_PENDING_REGISTRATION);

         jasmine.Ajax.requests.mostRecent().response(mock.UserExists("TestUser"));

         expect(testEvent).toEqual(auth.events.AUTH_USER_REGISTER);
         expect(testStatus).toEqual(auth.status.AUTH_USERNAME_EXISTS);
         expect(auth.GetUserStatus()).toEqual(auth.status.AUTH_USER_NOT_AUTHENTICATED);
      });

      it("reports server error upon receiving a database error on user registration", function() {
         var testEvent = undefined;
         var testStatus = undefined;

         var CallBack = function(event, status) {
            testEvent = event;
            testStatus = status;
         };

         auth.AddCallback(CallBack);
         auth.RegisterUser("TestUser", "testPassword", "Test User 1", "testuser1@chamrock.net");

         expect(auth.GetUserStatus()).toEqual(auth.status.AUTH_PENDING_REGISTRATION);

         jasmine.Ajax.requests.mostRecent().response(mock.DatabaseError());

         expect(testEvent).toEqual(auth.events.AUTH_USER_REGISTER);
         expect(testStatus).toEqual(auth.status.AUTH_SERVER_ERROR);
         expect(auth.GetUserStatus()).toEqual(auth.status.AUTH_USER_NOT_AUTHENTICATED);
      });

      it("reports user authenticated upon successful registration", function() {
         var testEvent = undefined;
         var testStatus = undefined;
         var userId = '0001';
         var userName = 'TestUser';
         var testPassword = 'testPassword';
         var displayName = 'Test User 1';
         var email = 'testuser1@chamrock.net';

         var CallBack = function(event, status) {
            testEvent = event;
            testStatus = status;
         };

         spyOn(server, "SetTokenUser");

         auth.AddCallback(CallBack);
         auth.RegisterUser(userName, testPassword, displayName, email);

         expect(auth.GetUserStatus()).toEqual(auth.status.AUTH_PENDING_REGISTRATION);

         jasmine.Ajax.requests.mostRecent().response(mock.UserResponse(userId,
                                                                       userName,
                                                                       displayName,
                                                                       email));

         expect(testEvent).toEqual(auth.events.AUTH_USER_REGISTER);
         expect(testStatus).toEqual(auth.status.AUTH_USER_AUTHENTICATED);
         expect(server.SetTokenUser).toHaveBeenCalledWith(userId);
         expect(auth.GetUserStatus()).toEqual(auth.status.AUTH_USER_AUTHENTICATED);
         expect(auth.GetUserId()).toEqual(userId);
         expect(auth.GetUserName()).toEqual(userName);
         expect(auth.GetUserDisplayName()).toEqual(displayName);
         expect(auth.GetUserEmail()).toEqual(email);
      });

      it("reports authentication error with invalid username on authentication", function() {
         var testEvent = undefined;
         var testStatus = undefined;
         var userName = 'TestUser';
         var testPassword = 'testPassword';

         var CallBack = function(event, status) {
            testEvent = event;
            testStatus = status;
         };

         spyOn(server, "ClearToken");

         auth.AddCallback(CallBack);
         auth.LoginUser(userName, testPassword);

         expect(auth.GetUserStatus()).toEqual(auth.status.AUTH_PENDING_LOGIN);

         jasmine.Ajax.requests.mostRecent().response(mock.DatabaseError());

         expect(testEvent).toEqual(auth.events.AUTH_USER_LOG_IN);
         expect(testStatus).toEqual(auth.status.AUTH_AUTHENTICATION_ERROR);
         expect(server.ClearToken).toHaveBeenCalledWith();
         expect(auth.GetUserStatus()).toEqual(auth.status.AUTH_USER_NOT_AUTHENTICATED);
         expect(auth.GetUserId()).toBeUndefined();
         expect(auth.GetUserName()).toBeUndefined();
         expect(auth.GetUserDisplayName()).toBeUndefined();
         expect(auth.GetUserEmail()).toBeUndefined();
      });

      it("reports authentication error with invalid password on authentication", function() {
         var testEvent = undefined;
         var testStatus = undefined;
         var userName = 'TestUser';
         var testPassword = 'testPassword';

         var CallBack = function(event, status) {
            testEvent = event;
            testStatus = status;
         };

         spyOn(server, "ClearToken");

         auth.AddCallback(CallBack);
         auth.LoginUser(userName, testPassword);

         expect(auth.GetUserStatus()).toEqual(auth.status.AUTH_PENDING_LOGIN);

         jasmine.Ajax.requests.mostRecent().response(mock.DatabaseError());

         expect(testEvent).toEqual(auth.events.AUTH_USER_LOG_IN);
         expect(testStatus).toEqual(auth.status.AUTH_AUTHENTICATION_ERROR);
         expect(server.ClearToken).toHaveBeenCalledWith();
         expect(auth.GetUserStatus()).toEqual(auth.status.AUTH_USER_NOT_AUTHENTICATED);
         expect(auth.GetUserId()).toBeUndefined();
         expect(auth.GetUserName()).toBeUndefined();
         expect(auth.GetUserDisplayName()).toBeUndefined();
         expect(auth.GetUserEmail()).toBeUndefined();
      });

      it("reports user authenticated upon successful login", function() {
         var testEvent = undefined;
         var testStatus = undefined;
         var userId = '0001';
         var userName = 'TestUser';
         var testPassword = 'testPassword';
         var displayName = 'Test User 1';
         var email = 'testuser1@chamrock.net';

         var CallBack = function(event, status) {
            testEvent = event;
            testStatus = status;
         };

         spyOn(server, "SetTokenUser");

         auth.AddCallback(CallBack);
         auth.LoginUser(userName, testPassword);

         expect(auth.GetUserStatus()).toEqual(auth.status.AUTH_PENDING_LOGIN);

         jasmine.Ajax.requests.mostRecent().response(mock.UserResponse(userId,
                                                                       userName,
                                                                       displayName,
                                                                       email));

         expect(testEvent).toEqual(auth.events.AUTH_USER_LOG_IN);
         expect(testStatus).toEqual(auth.status.AUTH_USER_AUTHENTICATED);
         expect(server.SetTokenUser).toHaveBeenCalledWith(userId);
         expect(auth.GetUserStatus()).toEqual(auth.status.AUTH_USER_AUTHENTICATED);
         expect(auth.GetUserId()).toEqual(userId);
         expect(auth.GetUserName()).toEqual(userName);
         expect(auth.GetUserDisplayName()).toEqual(displayName);
         expect(auth.GetUserEmail()).toEqual(email);
      });

   });

   describe("-when authenticated,", function() {
      var auth;
      var mock;

      beforeEach(module('test.data.mockserver'));
      beforeEach(module('cge.utils'));
      beforeEach(module('cge.server'));
      beforeEach(function() {
         inject(function($injector) {
            mock = $injector.get('test.data.mockServer');
         });

         inject(function($injector) {
            auth = $injector.get('cge.server.Authenticator');
            auth.Init();
            auth.InitToken();
         });

         jasmine.Ajax.install();
      });

      afterEach(function() {
         jasmine.Ajax.uninstall();
         auth.LogoutUser();
      });

      it("reports user un-authenticated upon receiving server error", function() {
         var testEvent = undefined;
         var testStatus = undefined;
         var userId = '0001';
         var userName = 'TestUser';
         var testPassword = 'testPassword';
         var displayName = 'Test User 1';
         var email = 'testuser1@chamrock.net';

         var CallBack = function(event, status) {
            testEvent = event;
            testStatus = status;
         };

         spyOn(server, "ClearToken");

         auth.AddCallback(CallBack);

         // Log the user in
         auth.LoginUser(userName, testPassword);
         jasmine.Ajax.requests.mostRecent().response(mock.UserResponse(userId,
                                                                       userName,
                                                                       displayName,
                                                                       email));
         expect(testEvent).toEqual(auth.events.AUTH_USER_LOG_IN);
         expect(testStatus).toEqual(auth.status.AUTH_USER_AUTHENTICATED);
         expect(auth.GetUserStatus()).toEqual(auth.status.AUTH_USER_AUTHENTICATED);

         // Now, cause the server failure
         server.CallBack(server.events.SI_SERVER_ERROR, server.status.SI_FAILURE, undefined);
         expect(server.ClearToken).toHaveBeenCalledWith();
         expect(testEvent).toEqual(auth.events.AUTH_USER_LOG_OUT);
         expect(testStatus).toEqual(auth.status.AUTH_SERVER_ERROR);
         expect(auth.GetUserStatus()).toEqual(auth.status.AUTH_USER_NOT_AUTHENTICATED);
      });

      it("reports user un-authenticated upon user logout", function() {
         var testEvent = undefined;
         var testStatus = undefined;
         var userId = '0001';
         var userName = 'TestUser';
         var testPassword = 'testPassword';
         var displayName = 'Test User 1';
         var email = 'testuser1@chamrock.net';

         var CallBack = function(event, status) {
            testEvent = event;
            testStatus = status;
         };

         spyOn(server, "ClearToken");

         auth.AddCallback(CallBack);

         // Log the user in
         auth.LoginUser(userName, testPassword);
         jasmine.Ajax.requests.mostRecent().response(mock.UserResponse(userId,
                                                                       userName,
                                                                       displayName,
                                                                       email));
         expect(testEvent).toEqual(auth.events.AUTH_USER_LOG_IN);
         expect(testStatus).toEqual(auth.status.AUTH_USER_AUTHENTICATED);
         expect(auth.GetUserStatus()).toEqual(auth.status.AUTH_USER_AUTHENTICATED);

         // Now, log the user out
         auth.LogoutUser();
         expect(server.ClearToken).toHaveBeenCalledWith();
         expect(testEvent).toEqual(auth.events.AUTH_USER_LOG_OUT);
         expect(testStatus).toEqual(auth.status.AUTH_USER_NOT_AUTHENTICATED);
         expect(auth.GetUserStatus()).toEqual(auth.status.AUTH_USER_NOT_AUTHENTICATED);
      });

   });
});



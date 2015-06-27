
angular.module('TestAuthService', []);

describe( "TestAuthService", function() {
   beforeEach(function() {
       module('cge.utils');
       inject(function($injector) {
           authService = $injector.get('cge.utils.AuthService');
       });
   });

   xit("should be defined", function () {
   });

   xit("should initially indicate that the user is not authenticated", function () {
   });

   xit("should be able read stored creditials from config", function () {
   });

   xit("should indicate the status of the current authentication", function () {
   });

   xit("should successfully authenticate a valid user", function () {
   });

   xit("should fail to authenticate an invalid user", function () {
   });

});
describe( "TestAuthService", function() {

   var AuthService = null;

   beforeEach(angular.module('myApp'));

   beforeEach ( function () {
      AuthService = angular.injector(['myApp']).get('AuthService');
   });

   it("should be defined", function () {
      expect(AuthService).not.toBe(null);
   });

   xit("should initially indicate that the user is not authenticated", function () {
   });

   xit("should be able log in with stored creditials from config", function () {
   });

   xit("should be able to log in with creditials supplied as parameters", function () {
   });

   xit("should be able to store creditials to the config on a succesful login", function () {
   });

   xit("should be able to clear stored creditials", function () {
   });

   xit("should log out the user when the network becomes unavailable", function () {
   });

   xit("should log in the user when the network becomes available", function () {
   });
});
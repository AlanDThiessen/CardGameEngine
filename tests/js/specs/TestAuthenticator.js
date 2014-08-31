
// Pull in the module we're testing.
var fileSystem = require("../../../src/js/utils/Authenticator.js");

describe("Authenticator", function() {

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

   });

   describe("-when authenticated,", function() {

      xit("reports user un-authenticated upon receiving server error", function() {
      });

      xit("reports user un-authenticated upon user logout", function() {
      });

   });
});



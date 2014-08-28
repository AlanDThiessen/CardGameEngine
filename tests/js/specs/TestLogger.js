
// Pull in the module we're testing.
var fileSystem = require("../../../src/js/utils/FileSystem.js");
var logger = require("../../../src/js/utils/Logger.js");

describe("Logger", function () {

   var fsStatus = false;

   it("should write to the log file", function (done) {

      // fileSystem.SetErrorCallback(function (errorCode, errorStr) {
      //    expect(errorStr).toBeNull();
      //    expect(fsStatus).toBeTruthy();
      //    done();
      // });

      // fileSystem.OpenLogFile(

      //    function (status) {
      //       fsStatus = status;
      //    },

      //     function () {
      //       expect(fileSystem.fileEntries.log).toBeDefined();
      //       done();
      //        // logger.debug("test");

      //        // setTimeout(function () {
      //        //    expect(fileSystem.fileEntries.log.writer.length).toEqual("test\n".length);
      //        //    done();
      //        // }, 250);
      //     }
      // );

      // fileSystem.ClearLogFile();

      var OnClearReady = function(status) {
         console.log("OnClearReady");
         fsStatus = status;
      };

      var OnClearEnd = function() {
//         CommonExpectations();
//         ClearLogExpectations();
         //expect(true).toBeTruthy();
         console.log("OnClearEnd");
         done();
      };

      var Failure = function(errorCode, errorStr) {
         fsError = errorStr;
//         CommonExpectations();
         expect(false).toBeTruthy();
         console.log("Failure");
         done();
      };

      var ClearLogExpectations = function() {
         expect(fileSystem.fileEntries.log).toBeDefined();
         expect(fileSystem.fileEntries.log.entry.isFile).toBeTruthy();
         expect(fileSystem.fileEntries.log.writer).toBeDefined();
         expect(fileSystem.fileEntries.log.writer.length).toEqual(0);
      };

      console.log("Running logger test");

      fileSystem.SetErrorCallback(Failure);
      // Log file should already be open, just change its callbacks
      fileSystem.OpenLogFile(OnClearReady, OnClearEnd);
      fileSystem.ClearLogFile();
   });
});
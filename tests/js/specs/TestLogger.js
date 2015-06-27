
angular.module('TestLogger', []);

describe("Logger", function () {

   var fsStatus = false;

   beforeEach(function() {
       module('cge.utils');
       inject(function($injector) {
           log = $injector.get('cge.utils.Logger');
       });

       inject(function($injector) {
           fileSystem = $injector.get('cge.utils.FileSystem');
       });
   });

   xit("writes to the log file", function (done) {

      var OnClearReady = function(status) {
         fsStatus = status;
      };

      var OnClearEnd = function() {
          expect(fileSystem.fileEntries.log).toBeDefined();
          expect(fileSystem.fileEntries.log.entry.isFile).toBeTruthy();
          expect(fileSystem.fileEntries.log.writer).toBeDefined();
          expect(fileSystem.fileEntries.log.writer.length).toEqual(0);
          done();
      };

      var Failure = function(errorCode, errorStr) {
         fsError = errorStr;
         done();
      };

      fileSystem.SetErrorCallback(Failure);
      // Log file should already be open, just change its callbacks
      fileSystem.OpenLogFile(OnClearReady, OnClearEnd);
      fileSystem.ClearLogFile();
   });


   xit("clears the log file", function(done) {

   });
});

var jasmineCtrl = angular.module('jasmine_controller', []);

jasmineCtrl.controller('JasmineCtrl', function() {
   this.title = "Jasmine";
   this.version = jasmine.version;
   this.duration = jsApiReporter.executionTime();
   this.testsComplete = jsApiReporter.finished;
   this.specs = jsApiReporter.specs();
   this.specStats  = {};
   this.specStats.total = 0;
   this.specStats.numPassed = 0;
   this.specStats.numFailed = 0;
   this.specStats.status = "failed";

   this.JasmineComplete = function() {
      console.log("Jasmine is now complete");
      this.specStats.total = this.specs.length;
      this.specStats.numPassed = 
      this.specStats.numPassed = this.NumPassed();
      this.specStats.numFailed = this.NumFailed();

      if(this.specStats.numFailed == 0) {
         this.specStats.status = "passed";
      }
      else {
         this.specStats.status = "failed";
      }
   };

   this.NumPassed = function() {
      var cntr;
      var numPassed = 0;

      for(cntr = 0; cntr < this.specs.length; cntr++){
         if(this.specs[cntr].status === "passed") {
            numPassed += 1;
         }
      }

      return numPassed;
   };

   this.NumFailed = function() {
      var cntr;
      var numFailed = 0;

      for(cntr = 0; cntr < this.specs.length; cntr++){
         if(this.specs[cntr].status === "failed") {
            numFailed += 1;
         }
      }

      return numFailed;
   };

   if(jsApiReporter.finished == true) {
      console.log("Jasmine already complete");
      this.JasmineComplete();
   }
   else {
      console.log("Jasmine not already complete");
   }
});

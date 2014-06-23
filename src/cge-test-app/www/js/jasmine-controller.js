
var jasmineCtrl = angular.module('jasmine_controller', []);

jasmineCtrl.controller('JasmineCtrl', function() {
   this.title = "Jasmine";
   this.version = jasmine.version;
   this.duration = 0;
   this.state = 'ready';
   this.testsComplete = false;
   this.specs = jsApiReporter.specs();
   this.specStats  = {};
   this.specStats.total = 0;
   this.specStats.numPassed = 0;
   this.specStats.numFailed = 0;
   this.specStats.status = "failed";

   this.ShowDiv = function(div) {
      var show = false;
      if(div === this.state){
         show = true;
      }

      return show;
   };

   this.RunJasmine = function() {
      var env = jasmine.getEnv();
      env.execute();
      this.state = 'running';
      console.log("running jasmine: " + this.state);
      this.CheckComplete();
   };

   this.JasmineComplete = function() {
      console.log("Jasmine is now complete");
      this.testsComplete = true;
      this.state = 'complete';
      this.specStats.total = this.specs.length;
      this.specStats.numPassed = 
      this.specStats.numPassed = this.NumPassed();
      this.specStats.numFailed = this.NumFailed();
      this.duration = jsApiReporter.executionTime();

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

      if(this.testsComplete) {
         for(cntr = 0; cntr < this.specs.length; cntr++){
            if(this.specs[cntr].status === "passed") {
               numPassed += 1;
            }
         }
      }

      return numPassed;
   };

   this.NumFailed = function() {
      var cntr;
      var numFailed = 0;

      if(this.testsComplete) {
         for(cntr = 0; cntr < this.specs.length; cntr++){
            if(this.specs[cntr].status === "failed") {
               numFailed += 1;
            }
         }
      }

      return numFailed;
   };

   this.CheckComplete = function() {
      if(jsApiReporter.finished == true) {
         console.log("Jasmine already complete");
         this.JasmineComplete();
      }
      else {
         console.log("Jasmine not already complete");
         this.Reschedule();
      }
   };

   this.Reschedule = function() {
      setTimeout(this.CheckComplete, 1000);
   };

});

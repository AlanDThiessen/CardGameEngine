
var testControl = angular.module('test_controller', [ ]);

testControl.controller('tester', function() {
   this.title = "";
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

      return numFailed;
   };
});


var testerMod = angular.module( "module.tester", [] );

/*
   TODO: Eventually, create a Tester abstract class that can go in a Tester
         Service.  Then derive the Jasmine tester from it.
*/

/******************************************************************************
 * The tester Service
 * This one runs Jasmine
 ******************************************************************************/
testerMod.service( 'Tester', [ '$rootScope', function($rootScope) {
   var service = {};
   service.title = "Jasmine";
   service.version = jasmine.version;
   service.tests = [];
   service.testStats = {};
   service.state = "ready";
   service.duration = 0;
   service.testStats.status = 'pending';
   service.testStats.total = 0;
   service.testStats.numPassed = 0;
   service.testStats.numFailed = 0;

   service.RunTests = function() {
      if(service.state === "ready") {
         var env = jasmine.getEnv();
         env.execute();
         service.state = 'running';
         
         // Send the event letting others know we're done.
         $rootScope.$broadcast('tester.started');

         service.CheckComplete();
      }
   };

   service.TestsComplete = function() {
      console.log("Tests are now complete");
      service.state = 'complete';
      service.tests = jsApiReporter.specs();
      service.testStats.total = service.tests.length;
      service.testStats.numPassed = service.NumPassed();
      service.testStats.numFailed = service.NumFailed();
      service.duration = jsApiReporter.executionTime();

      if(service.testStats.numFailed == 0) {
         service.testStats.status = "passed";
      }
      else {
         service.testStats.status = "failed";
      }
      
      // Send the event letting others know we're done.
      $rootScope.$broadcast('tester.complete');
   };

   service.NumPassed = function() {
      var cntr;
      var numPassed = 0;

      if(service.state == 'complete') {
         for(cntr = 0; cntr < service.tests.length; cntr++){
            if(service.tests[cntr].status === "passed") {
               numPassed += 1;
            }
         }
      }

      return numPassed;
   };

   service.NumFailed = function() {
      var cntr;
      var numFailed = 0;

      if(service.state == 'complete') {
         for(cntr = 0; cntr < service.tests.length; cntr++){
            if(service.tests[cntr].status === "failed") {
               numFailed += 1;
            }
         }
      }
      
      return numFailed;
   };

   service.CheckComplete = function() {
      if(jsApiReporter.finished == true) {
         console.log("Tester already complete");
         service.TestsComplete();
      }
      else {
         console.log("Tests not already complete");
         service.Reschedule();
      }
   };

   service.Reschedule = function() {
      setTimeout(service.CheckComplete, 250);
   };

   return service;
}]);


/******************************************************************************
 * Controller: Tester Summary
 ******************************************************************************/
var testCtrl = ['$scope', 'Tester', function(scope, Tester) {
   scope.title = Tester.title;
   scope.version = Tester.version;
   scope.state = Tester.state;
   scope.testsTotal = 0;
   scope.testsPassed = 0;
   scope.testsFailed = 0;
   scope.duration = 0;

   scope.DurationString = function() {
      var ms2hrs = (1000 * 60 * 60);
      var ms2mins = (1000 * 60);
      var hours = Math.floor(scope.duration / ms2hrs);
      var minutes = Math.floor((scope.duration - (hours * ms2hrs)) / ms2mins);
      var seconds = (scope.duration - (hours * ms2hrs) - (minutes * ms2mins)) / 1000;
      return(hours + ':' + minutes + ':' + seconds.toFixed(3));
   };

   scope.$on('tester.started', function(event) {
      scope.state = Tester.state;
      scope.$apply();
   });

   scope.$on('tester.complete', function(event) {
      scope.state = Tester.state;
      scope.testsTotal = Tester.testStats.total;
      scope.testsPassed = Tester.testStats.numPassed;
      scope.testsFailed = Tester.testStats.numFailed;
      scope.duration = Tester.duration;
      scope.$apply();
   });
}];

testerMod.controller('tester.summary', testCtrl);


/******************************************************************************
 * Create a button directive to start the tester
 ******************************************************************************/
testerMod.directive( "startTesterButton", [ 'Tester', function(Tester) {
   return {
      restrict: "A",
      link: function(scope, element, attrs) {
         element.bind('click', function() {
            Tester.RunTests();
         });
      }
   }
}]);


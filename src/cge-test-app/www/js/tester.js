
var testerMod = angular.module( "module.tester", [] );


// Defined the TestResult object
function TestResult(id, name, description, status) {
   this.id = id;
   this.name = name;
   this.description = description;
   this.status = status;
   this.failures = [];
};

TestResult.prototype.AddFailure = function(expected, actual, message, trace) {
   var failure = {};

   failure.expected = expected;
   failure.actual = actual;
   failure.message = message;
   failure.trace = trace;

   this.failures.push(failure);
};


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
   service.results = [];
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
      service.GatherTests();
      service.testStats.total = service.results.length;
      service.duration = jsApiReporter.executionTime();

      if(service.testStats.numFailed == 0) {
         service.testStats.status = "passed";
      }
      else {
         service.testStats.status = "failed";
      }

      // Change our state to complete.      
      service.state = 'complete';

      // Send the event letting others know we're done.
      $rootScope.$broadcast('tester.complete');
   };

   service.GatherTests = function() {
      var tests = jsApiReporter.specs();
      var cntr;

      service.testStats.numPassed = 0;
      service.testStats.numFailed = 0;

      for(cntr = 0; cntr < tests.length; cntr++ ) {
         var thisTest = new TestResult(tests[cntr].id,
                                       tests[cntr].fullName,
                                       tests[cntr].description,
                                       tests[cntr].status);

         if(tests[cntr].status === 'passed') {
            service.testStats.numPassed += 1;
         }
         else if(tests[cntr].status === 'failed') {
            service.testStats.numFailed += 1;

            for(var failCntr = 0; failCntr < tests[cntr].failedExpectations.length; failCntr++) {
               thisTest.AddFailure(tests[cntr].failedExpectations[failCntr].expected,
                                   tests[cntr].failedExpectations[failCntr].actual,
                                   tests[cntr].failedExpectations[failCntr].message,
                                   tests[cntr].failedExpectations[failCntr].stack);
            }
         }

         service.results.push(thisTest);
      }
   };


   service.GetTestResult = function(testId) {
      var result;

      for(var cntr = 0; cntr < service.results.length; cntr++) {
         if(service.results[cntr].id === testId) {
            result = service.results[cntr];
            break;
         }
      }

      return result;
   }

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
 * Route Provider
 ******************************************************************************/
/* We'll try to add this later, to keep everything in a single module.
testerMod.config(function($routeProvider, $locationProvider) {
   $routeProvider
      .when('/Tester', {
          templateUrl: 'templates/tester.html',
          controller: 'tester.summary'
      });
});
*/

/******************************************************************************
 * Controller: Tester Summary
 ******************************************************************************/
var testSummaryCtrl = ['$scope', '$location', 'Tester', function(scope, location, Tester) {
   scope.title = Tester.title;
   scope.version = Tester.version;
   scope.state = Tester.state;
   scope.testsTotal = Tester.testStats.total;
   scope.testsPassed = Tester.testStats.numPassed;
   scope.testsFailed = Tester.testStats.numFailed;
   scope.duration = Tester.duration;
   scope.results = Tester.results;
   scope.filterResults = "failed";  // By default, only show failed results.

   scope.DurationString = function() {
      var ms2hrs = (1000 * 60 * 60);
      var ms2mins = (1000 * 60);
      var hours = Math.floor(scope.duration / ms2hrs);
      var minutes = Math.floor((scope.duration - (hours * ms2hrs)) / ms2mins);
      var seconds = (scope.duration - (hours * ms2hrs) - (minutes * ms2mins)) / 1000;
      return(hours + ':' + minutes + ':' + seconds.toFixed(3));
   };

   scope.ShowTest = function(testId) {
      location.path('/app/tester/testId/' + testId);
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
      scope.results = Tester.results;
      scope.$apply();
   });
}];

testerMod.controller('tester.summary', testSummaryCtrl);


/******************************************************************************
 * Controller: Test Detail
 ******************************************************************************/
var testDetailCtrl = ['$scope', '$stateParams', 'Tester', function(scope, stateParams, Tester) {
   scope.result = Tester.GetTestResult(stateParams.testId);
}];

testerMod.controller('tester.detail', testDetailCtrl);


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


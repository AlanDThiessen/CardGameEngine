
var jasmineCtrl = angular.module('jasmine_controller', []);

jasmineCtrl.controller('JasmineCtrl', function() {

   this.GetJasmineDiv = function() {
      return document.getElementById('jasmineDiv');
   };
});

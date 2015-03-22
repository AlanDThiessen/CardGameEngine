
angular.module('cge.server').
    factory('cge.server.Ajax', function() {

   ajax = {};

   ajax.server = {
      protocol: 'https',
      hostname: 'gator4021.hostgator.com',
      port: 443,
      path: '/~thiessea/TheThiessens.net/cge/cge.php'
   };


   ajax.ServerPost = function (postData, success, failure) {
      var url = ajax.server.protocol + '://' + ajax.server.hostname + ajax.server.path;
      var formData = new FormData();
      var request = new XMLHttpRequest();

      for (var key in postData) {
         if (postData.hasOwnProperty(key)) {
            formData.append(key, postData[key]);
         }
      }

      request.open("POST", url, true);
      request.responseType = 'text';
      request.onreadystatechange = function (e) {
         ajax.HandleResponse(e, this, success, failure);
      };
      request.send(formData);
   };


   ajax.HandleResponse = function (event, resp, success, failure) {
      if (resp.readyState == resp.DONE) {
         if (resp.status == 200) {
            if (typeof success === 'function') {
               success(JSON.parse(resp.responseText));
            }
         }
         else {
            if (typeof failure === 'function') {
               failure(resp.status);
            }
         }
      }
   };

   return ajax;
});

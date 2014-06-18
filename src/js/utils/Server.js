
ajax = require("./Ajax.js");
log = require("./Logger.js");

server = {};

server.LoginUser = function(username, password) {
   var postData = {
      'action': 'cge_login_user',
      'username': username,
      'password': password
   };

   ajax.ServerPost(postData, server.LogResponse, server.Failure);
}


server.LogResponse = function(response) {
   alert("Logged in as: " + response.display_name);
   log.info("Logged in as: " + response.display_name);
}

server.Failure = function() {
   log.info("Request Failed");
   alert("Request Failed");
}




module.exports = server;
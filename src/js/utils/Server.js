
ajax = require("./Ajax.js");
log = require("./Logger.js");

server = {};

server.LoginUser = function(username, password) {
   var postData = {
      'action': 'cge_login_user',
      'username': username,
      'password': password
   };

   ajax.ServerPost(postData, server.LoginSuccess, server.Failure);
}


server.GetUserGames = function(userId) {
   var postData = {
      'action': 'cge_get_my_games',
      'user_id': userId
   };
   
   ajax.ServerPost(postData, server.GameSuccess, server.Failure);
}



server.LoginSuccess = function(user) {
   alert("Logged in as: " + user.display_name);
   log.info("Logged in as: " + user.display_name);
   
   // Now, get the user's games.
   server.GetUserGames(user.id);
}


server.GameSuccess = function(games) {
   var cntr;
   var gameNames = "";
   
   for(cntr = 0; cntr < games.length; cntr++) {
      gameNames += '"' + games[cntr].game_name + '", ';
   }
   
   alert("There are " + games.length + " games: " + gameNames);
   log.info("There are " + games.length + " games: " + gameNames);
}


server.Failure = function() {
   log.warn("Ajax Request Failed");
   alert("Ajax Request Failed");
}




module.exports = server;
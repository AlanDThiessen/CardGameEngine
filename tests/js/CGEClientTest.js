//var $ = require('jquery'); 
var log = require("../../src/js/Logger.js");
var qs = require('qs');
//var http = require("http")
var https = require("https")

var ajaxUrl;
var user;
var game_id;
var gameSpec;
var deckSpec;
var players = [ 1, 2, 3 ];

function main() {
   //register_user('athiessen', 'hello', "Alan Thiessen", 'AlanDThiessen@gmail.com');
   //login_user('athiessen', 'hello');
   //get_game_types();
   //start_game(1, 'simple-war');
   //get_joinable_games();
   get_my_games(1);
}

function server_post(post_data, callback) {
   var options = {
                  hostname:   'gator4021.hostgator.com',
                  port:       443,
                  path:       '/~thiessea/TheThiessens.net/cge/cge.php',
                  //hostname:   'www.TheThiessens.net',
                  //port:       80,
                  //path:       '/cge/cge.php',
                  method:     'POST',
                  headers:		{
	   									'Content-Type': 'application/x-www-form-urlencoded',
                                 'Content-Length': post_data.length
      								}
                  };
   
   //var post_req = http.request(options, callback);
   var post_req = https.request(options, callback);
    
   // post the data
   post_req.write(post_data);
   post_req.end();
}

function log_response(res) {
   console.log("statusCode: ", res.statusCode);
   console.log("headers: ", res.headers);

   res.on('data', function(d) {
     process.stdout.write(d);
   });
}
      

function register_user(username, password, displayName, email) {
   var post_data = qs.stringify({
      'action': 'cge_register_user',
      'username': username,
      'password': password,
      'display_name': displayName,
      'email': email
   });

   server_post(post_data, log_response);
   //user = $.parseJSON(response);
}
      

function login_user(username, password) {
   var post_data = qs.stringify({
      'action': 'cge_login_user',
      'username': username,
      'password': password,
   });

   server_post(post_data, log_response);
   //user = $.parseJSON(response);
}
      

function get_my_games(userId) {
   var post_data = qs.stringify({
      'action': 'cge_get_my_games',
      'user_id': userId
   });

   server_post(post_data, log_response);
   //user = $.parseJSON(response);
}
      

function get_game_types() {
   var post_data = qs.stringify({
      'action': 'cge_get_game_types'
   });

   server_post(post_data, log_response);
   //user = $.parseJSON(response);
}
      

function get_joinable_games(userId) {
   var post_data = qs.stringify({
      'action': 'cge_get_joinable_games',
      'user_id': userId
   });

   server_post(post_data, log_response);
   //user = $.parseJSON(response);
}
      

function start_game(userId, gameType) {
   var post_data = qs.stringify({
      'action': 'cge_start_game',
      'user_id': userId,
      'game_type_id': gameType
   });

   server_post(post_data, log_response);
   //user = $.parseJSON(response);
}


/*
function initialize() {
   // set ajaxUrl so all functions can use it
   ajaxUrl = $( 'https://gator4021.hostgator.com/~thiessea/TheThiessens.net/cge/cge.php' ).val();

   // make sure user is logged in, then show available games
   var data = {
      action: 'cge_login_user',
      username: 'athiessen',
      password: 'hello'
   };
   $.post(ajaxUrl, data, function(response) {
      console.log('Ajax response: ' + response);
      if (null != response && response.length && response != 0) {
         user = $.parseJSON(response);
         // may want to make sure user is in a game before listening for updates
         setupSseListeners(); 
         // show available games
         get_game_types();
         get_joinable_games();
         get_my_games();
      } else {
         console.log('No user');
      }
   });
}



function get_game_types() {
   var data = {
      action: 'cge_get_game_types'
   };
   $.post(ajaxUrl, data, function(response) {
      console.log('GGT: Ajax response: ' + response);
      if (null != response && response.length && response != 0) {
         show_game_types(response);
      } else {
         console.log('Error loading game types');
      }
   });
}

function show_game_types(game_types_json) {
   var game_type_list = '';
   var game_types = $.parseJSON(game_types_json);
   $('#cge_header #gameTypes').append($('<div>', { 
         class: 'gameTypesHeader',
         text:  'Click a type of game below to start a new game!',
   }));
   $.each(game_types, function(index, element) {
      $('#cge_header #gameTypes').append($('<div>', { 
         html: '<a href="javascript:void(0)">' + element.name + '</a>',
         class: 'gameType',
         'data-game-type-id':  element.id,
      }));
   });

   $('.gameType a').click(function(evt) {
      console.log("gameType click");
      var data = {
         action:       'cge_start_game',
         user_id:       user.id,
         game_type_id: $(this).parent().data( 'game-type-id'),
      };
      $.post(ajaxUrl, data, function(response) {
         console.log('CSG: Ajax response: ' + response);
         if (null != response && response.length && response != 0) {
            var responseObject = $.parseJSON(response);

            // ADT: temporary work-around so we can launch a game even though it 
            //      currently exists
            responseObject.success = 1;

            if (responseObject.success) {
               get_joinable_games();
               get_my_games();
               game_id = responseObject.game_id;
               gameSpec = responseObject.game_spec;
               load_deck(gameSpec.required.deck);
            } else {
               alert('You already have a game of that type.');
            }
         } else {
            console.log('Error loading game spec');
         }
      });
   });
}
*/

if (typeof window === 'undefined')
{
   main();
}
else
{
//   document.addEventListener('deviceready', main, false);
   window.addEventListener('load', main, false);
}

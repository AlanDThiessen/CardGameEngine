var qs = require('qs');
//var http = require('http');
var https = require('https');
var readline = require('readline');


var currMenu   = undefined;
var currPlayer = undefined;
var io         = undefined;

var server     = {
                   hostname:   'gator4021.hostgator.com',
                   port:       443,
                   path:       '/~thiessea/TheThiessens.net/cge/cge.php',
                 };


var settingsMenu =   { name: "Settings:",
                       items: [
                         { name:    'Return',
                           enabled: true,
                           value:   '',
                           handler: function(){ currMenu = mainMenu },
                         },
                         { name:    'Host',
                           enabled: true,
                           value:   server.hostname,
                           handler: SetMenuValue,
                         },
                         { name:    'Path',
                           enabled: true,
                           value:   server.path,
                           handler: SetMenuValue,
                         },
                         { name:    'Port',
                           enabled: true,
                           value:   server.port,
                           handler: SetMenuValue,
                         },
                       ]
                     };

var mainMenu =       { name: 'Main Menu:',
                       items: [
                         { name:    'Exit',
                           enabled: true,
                           value:   '',
                           handler: function(){ process.exit(0) },
                         },
                         { name:    'Settings',
                           enabled: true,
                           value:   '',
                           handler: function(){ currMenu = settingsMenu }
                         },
                         { name:    'Show Server',
                           enabled: true,
                           value:   '',
                           handler: ShowServer
                         },
                         {
                           name:    'Get Game Types',
                           enabled: true,
                           value:   '',
                           handler: get_game_types
                         },
                         {
                           name:    'Get Deck Speck',
                           enabled: true,
                           value:   '',
                           handler: GetDeckSpec
                         },
                         {
                           name:    'Get User Games',
                           enabled: true,
                           value:   '',
                           handler: GetUserGames
                         }
                       ]
                     };
                        

function RunMenu() {
   ResetScreen();
   DisplayMenu(currMenu);

   if(io !== undefined) {
      io.prompt();
   }
}


function HandleInput(input) {
   var selected = parseInt(input, 10);
 
   if(selected < currMenu.items.length) {
      if((currMenu.items[selected].enabled) &&
         (currMenu.items[selected].handler !== undefined)) {
         currMenu.items[selected].handler(currMenu.items[selected]);
      }
   }
 
   RunMenu();
}


function SetMenuValue(menuItem, value) {
   if(value != undefined) {
      if(typeof(menuItem.value) === 'string') {
         menuItem.value = value.trim();
      }
      else if(typeof(menuItem.value) === 'number') {
         menuItem.value = parseInt(value, 10);
      }
  
      console.log("'" + menuItem.name + "' set to " + menuItem.value);
      console.log('Press <Enter> to continue...');
      io.prompt();
   }
  
   if(value === undefined) {
      io.question( "Enter new value for '" + menuItem.name + "': ", function(answer){
    	  		SetMenuValue(menuItem, answer);
         });
      
   }
}


function ResetScreen() {
   //if(io !== undefined) {
      //readline.cursorTo(io, 0,0);
      //readline.clearScreenDown(io);
   //}
   console.log(String.fromCharCode(27) + "[2J" + String.fromCharCode(27) + "[;H" );
}


function DisplayMenu(menu) {
   //if(io !== undefined) {
      //io.write('\n' + menu.name);
      console.log('\n' + menu.name);
      
      for(cntr = 0; cntr < menu.items.length; cntr++) {
         outStr = '   ' + (cntr) + '. ' + menu.items[cntr].name;
         if(menu.items[cntr].value != '') {
            if(typeof(menu.items[cntr].value) === 'string') {
               outStr += ": '" + menu.items[cntr].value + "'";
            }
            else {
               outStr += ": " + menu.items[cntr].value;
            }
         }
         
         console.log(outStr);
      }
      
      console.log('');
   //}
}



function main() {
   currMenu = mainMenu;
   io = readline.createInterface(process.stdin, process.stdout);
   SetMenuValue("path", server, 'path', 'alan thiessen');

   if(io !== undefined) {
      RunMenu();
      io.on('line', HandleInput);
   }

   //register_user('athiessen', 'hello', "Alan Thiessen", 'AlanDThiessen@gmail.com');
   //register_user('S', 'hello', "Alan Thiessen", 'AlanDThiessen@gmail.com');
   //register_user('John', 'hola', "John", '');
   //login_user('athiessen', 'hello');
   //get_game_types();
   //start_game(1, 'simple-war');
   //get_joinable_games();
   //get_my_games(1);
}


function ShowServer() {
   io.question(console.log(server), function(){});
}


function GetDeckSpec() {
   get_deck_spec('asdf');
}

function GetUserGames() {
   get_my_games('0001');
}

function server_post(post_data, callback) {
   var options = {
                  hostname:   server.hostname,
                  port:       server.port,
                  path:       server.path,
                  method:     'POST',
                  headers:    {
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


function get_deck_spec(name) {
   var post_data = qs.stringify({
      'action': 'cge_load_deck_spec',
      'deck_type': name
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


if (typeof window === 'undefined')
{
   main();
}
else
{
//   document.addEventListener('deviceready', main, false);
   window.addEventListener('load', main, false);
}


serverMock = {};

serverMock.ServerTimeout = function() {
   return {
      "status": 408,
      "content-type": 'text/html',
      "responseText": ''
   };
};


serverMock.ServerError = function() {
   return {
      "status": 403,
      "content-type": 'text/html',
      "responseText": ''
   };
};


serverMock.UserExists = function(userName) {
   return {
      "status": 200,
      "content-type": 'text/html',
      "responseText": '{"cge_error_id": "001", "cge_error": "User ' + userName + ' already exists."}'
   };
};


serverMock.DatabaseError = function() {
   return {
      "status": 200,
      "content-type": 'text/html',
      "responseText": '{"cge_error_id": "002", "cge_error": "Database error."}'
   };
};


serverMock.UserResponse = function(userId, userName, displayName, email) {
   return {
      "status": 200,
      "content-type": 'text/html',
      "responseText":   '{"id": "' + userId + '",'
                      +  ' "username": "' + userName + '",'
                      +  ' "display_name": "' + displayName + '",'
                      +  ' "email": "' + email + '"'
                      + '}'
   };
};


serverMock.GameTypes = function() {
   return {
      "status": 200,
      "content-type": 'text/html',
      "responseText":   '[{"id":"simple-war","name":"Simple War"},{"id":"ten-phases","name":"Ten Phases"}]'
   };
};


serverMock.UserGames = function() {
   return {
      "status": 200,
      "content-type": 'text/html',
      "responseText": '[{"id":"1","game_type_id":"simple-war","game_name":"Simple War created by FIXME","created_by":"1","num_players_allowed":"4","game_state":"0"},{"id":"2","game_type_id":"simple-war","game_name":"Simple War created by FIXME","created_by":"1","num_players_allowed":"4","game_state":"0"}]'
   };
};


serverMock.NotFoundError = function(item) {
   return {
      "status": 200,
      "content-type": 'text/html',
      "responseText": '{"cge_error_id":"003","cge_error":"Deck ' + item + ' definition file not found."}'
   };
};


serverMock.DeckSpecStandard = function() {
   return {
      "status": 200,
      "content-type": 'text/html',
      "responseText": '{"id":"standard","name":"Standard Deck","suited":{"suits":{"suit":[{"id":"clubs","name":"Clubs","shortname":"C","color":"black"},{"id":"hearts","name":"Hearts","shortname":"H","color":"red"},{"id":"spades","name":"Spades","shortname":"S","color":"black"},{"id":"diamonds","name":"Diamonds","shortname":"D","color":"red"}]},"values":{"value":[{"id":"2","name":"Two","shortname":"2","rank":"2","quantity":"1"},{"id":"3","name":"Three","shortname":"3","rank":"3","quantity":"1"},{"id":"4","name":"Four","shortname":"4","rank":"4","quantity":"1"},{"id":"5","name":"Five","shortname":"5","rank":"5","quantity":"1"},{"id":"6","name":"Six","shortname":"6","rank":"6","quantity":"1"},{"id":"7","name":"Seven","shortname":"7","rank":"7","quantity":"1"},{"id":"8","name":"Eight","shortname":"8","rank":"8","quantity":"1"},{"id":"9","name":"Nine","shortname":"9","rank":"9","quantity":"1"},{"id":"10","name":"Ten","shortname":"10","rank":"10","quantity":"1"},{"id":"J","name":"Jack","shortname":"J","rank":"11","quantity":"1"},{"id":"Q","name":"Queen","shortname":"Q","rank":"12","quantity":"1"},{"id":"K","name":"King","shortname":"K","rank":"13","quantity":"1"},{"id":"A","name":"Ace","shortname":"A","rank":"14","quantity":"1"}]}},"nonsuited":{"values":{"value":{"id":"joker","name":"Joker","shortname":"Joker","rank":"0","quantity":"2","color":"black"}}}}'
   };
};


serverMock.DeckSpecStandardNoJokers = function() {
   return {
      "status": 200,
      "content-type": 'text/html',
      "responseText": '{"id":"standard-no-jokers","name":"Standard Deck without Jokers","suited":{"suits":{"suit":[{"id":"clubs","name":"Clubs","shortname":"C","color":"black"},{"id":"hearts","name":"Hearts","shortname":"H","color":"red"},{"id":"spades","name":"Spades","shortname":"S","color":"black"},{"id":"diamonds","name":"Diamonds","shortname":"D","color":"red"}]},"values":{"value":[{"id":"2","name":"Two","shortname":"2","rank":"2","quantity":"1"},{"id":"3","name":"Three","shortname":"3","rank":"3","quantity":"1"},{"id":"4","name":"Four","shortname":"4","rank":"4","quantity":"1"},{"id":"5","name":"Five","shortname":"5","rank":"5","quantity":"1"},{"id":"6","name":"Six","shortname":"6","rank":"6","quantity":"1"},{"id":"7","name":"Seven","shortname":"7","rank":"7","quantity":"1"},{"id":"8","name":"Eight","shortname":"8","rank":"8","quantity":"1"},{"id":"9","name":"Nine","shortname":"9","rank":"9","quantity":"1"},{"id":"10","name":"Ten","shortname":"10","rank":"10","quantity":"1"},{"id":"J","name":"Jack","shortname":"J","rank":"11","quantity":"1"},{"id":"Q","name":"Queen","shortname":"Q","rank":"12","quantity":"1"},{"id":"K","name":"King","shortname":"K","rank":"13","quantity":"1"},{"id":"A","name":"Ace","shortname":"A","rank":"14","quantity":"1"}]}},"nonsuited":{"values":{}}}'
   };
};


module.exports = serverMock;


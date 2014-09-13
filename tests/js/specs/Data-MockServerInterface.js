
serverMock = {};

serverMock.ServerTimeout = function() {
   return {
      "status": 408,
      "content-type": 'text/JSON',
      "responseText": ''
   };
};


serverMock.ServerError = function() {
   return {
      "status": 403,
      "content-type": 'text/JSON',
      "responseText": ''
   };
};


serverMock.UserExists = function(userName) {
   return {
      "status": 200,
      "content-type": 'text/JSON',
      "responseText": '{"cge_error_id": "001", "cge_error": "User ' + userName + ' already exists."}'
   };
};


serverMock.DatabaseError = function() {
   return {
      "status": 200,
      "content-type": 'text/JSON',
      "responseText": '{"cge_error_id": "002", "cge_error": "Database error."}'
   };
};


serverMock.UserResponse = function(userId, userName, displayName, email) {
   return {
      "status": 200,
      "content-type": 'text/JSON',
      "responseText":   '{"id": "' + userId + '",'
                      +  ' "username": "' + userName + '",'
                      +  ' "display_name": "' + displayName + '",'
                      +  ' "email": "' + email + '"'
                      + '}'
   };
};

module.exports = serverMock;


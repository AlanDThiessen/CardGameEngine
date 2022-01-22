

angular.module( "test.data.mockGamedata", [] ).factory('test.data.mockGamedata', function() {

   var gameDataMock = {};

   gameDataMock.deckSpec = {
       "cge_deck": {
           "id": "standard",
           "name": "Standard Deck",
           "suited": {
               "suits": {
                   "suit": [
                       {
                           "id": "clubs",
                           "name": "Clubs",
                           "shortname": "C",
                           "color": "black"
                       },
                       {
                           "id": "hearts",
                           "name": "Hearts",
                           "shortname": "H",
                           "color": "red"
                       },
                       {
                          "id": "spades",
                           "name": "Spades",
                           "shortname": "S",
                           "color": "black"
                       },
                       {
                           "id": "diamonds",
                           "name": "Diamonds",
                           "shortname": "D",
                           "color": "red"
                       }
                   ]
               },
               "values": {
                   "value": [
                       {
                           "id": "2",
                           "name": "Two",
                           "shortname": "2",
                           "rank": "2",
                           "quantity": "1"
                       },
                       {
                          "id": "3",
                           "name": "Three",
                           "shortname": "3",
                           "rank": "3",
                           "quantity": "1"
                       },
                       {
                           "id": "4",
                           "name": "Four",
                           "shortname": "4",
                           "rank": "4",
                           "quantity": "1"
                       },
                       {
                           "id": "5",
                           "name": "Five",
                           "shortname": "5",
                           "rank": "5",
                           "quantity": "1"
                       },
                       {
                           "id": "6",
                           "name": "Six",
                           "shortname": "6",
                           "rank": "6",
                           "quantity": "1"
                       },
                       {
                           "id": "7",
                           "name": "Seven",
                           "shortname": "7",
                           "rank": "7",
                           "quantity": "1"
                       },
                       {
                           "id": "8",
                           "name": "Eight",
                           "shortname": "8",
                           "rank": "8",
                           "quantity": "1"
                       },
                       {
                           "id": "9",
                           "name": "Nine",
                           "shortname": "9",
                           "rank": "9",
                           "quantity": "1"
                       },
                       {
                           "id": "10",
                           "name": "Ten",
                           "shortname": "10",
                           "rank": "10",
                           "quantity": "1"
                       },
                       {
                           "id": "J",
                           "name": "Jack",
                           "shortname": "J",
                           "rank": "11",
                           "quantity": "1"
                       },
                       {
                           "id": "Q",
                           "name": "Queen",
                           "shortname": "Q",
                           "rank": "12",
                           "quantity": "1"
                       },
                       {
                           "id": "K",
                           "name": "King",
                           "shortname": "K",
                           "rank": "13",
                           "quantity": "1"
                       },
                       {
                           "id": "A",
                           "name": "Ace",
                           "shortname": "A",
                           "rank": "14",
                           "quantity": "1"
                       }
                   ]
               }
           },
           "nonsuited": {
               "values": {
                   "value": {
                       "id": "joker",
                       "name": "Joker",
                       "shortname": "Joker",
                       "rank": "0",
                       "quantity": "2",
                       "color": "black"
                   }
               }
           }
       }
   };


   gameDataMock.gameSpec = {
       "cge_game": {
           "id": "simple-war",
           "name": "Simple War",
           "required": {
               "deck": "standard",
               "minPlayers": "2",
               "maxPlayers": "4"
           },
           "server": {
               "isPrimary": "false",
               "players": ""
           }
       }
   };

   return gameDataMock;
});


var SimpleWarGame = require( "../../src/js/games/SimpleWar/SimpleWarGame.js" );

var gameSpec = 
{
   "id": "simple-war",
   "name": "Simple War",
   "required": {
      "deck": "standard",
      "minPlayers": "2",
      "maxPlayers": "4"
   },
   "server": {
      "isPrimary": "true",
   },
   "players": [ 
      { "id": "0010",
        "alias": "Alan"
      },
      { "id": "0020",
        "alias": "David"
      },
      { "id": "0030",
        "alias": "Jordan"
      }
   ],
 };


var deckSpec = 
{
     "id": "standardNoJokers",
     "name": "Standard Deck without Jokers",
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
         "value": [ ]
       }
     }
};


console.log('Launching game of ' + gameSpec.name + ' with deck type ' + deckSpec.name );
cardGame = new SimpleWarGame();

cardGame.Init( gameSpec, deckSpec );

console.log( cardGame.players[0] );
console.log( cardGame.players[1] );

//cardGame.dealer.PrintCards();  // The deck should *not* be shuffled here

cardGame.StartGame();

console.log( "Player 0: Current State: %s", cardGame.players[0].currentState.name );
console.log( "Player 1: Current State: %s", cardGame.players[1].currentState.name );
console.log( "***** Player 0: Card Stack *****" );
cardGame.players[0].rootContainer.containers[0].PrintCards();
console.log( "***** Player 1: Card Stack *****" );
cardGame.players[1].rootContainer.containers[0].PrintCards();
console.log( "***** Player 2: Card Stack *****" );
cardGame.players[2].rootContainer.containers[0].PrintCards();


//cardGame.dealer.PrintCards();  // The deck should now be shuffled.


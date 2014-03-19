
module.exports = SimpleWarGame;
var SimpleWarPlayer = require( "./SimpleWarPlayer.js" );
var CardGame = require( "../../CardGame.js" );

/******************************************************************************
 * States
 ******************************************************************************/
var SIMPLE_WAR_STATE_IN_PROGRESS = "InProgress";
var SIMPLE_WAR_STATE_GAME_OVER   = "GameOver";
var SIMPLE_WAR_STATE_BATTLE      = "Battle";
var SIMPLE_WAR_STATE_WAR         = "War";


/******************************************************************************
 * CLASS Definition: Simple War Game
 ******************************************************************************/

/******************************************************************************
 *
 * Class: SimpleWarGame
 * Inherits From: Game
 * Constructor
 *
 ******************************************************************************/
function SimpleWarGame( id, alias )
{
   // Call the parent class constructor
   CardGame.call( this, "Simple War" );

   // Create the State Machine
   this.AddState( SIMPLE_WAR_STATE_IN_PROGRESS, undefined                     );
   this.AddState( SIMPLE_WAR_STATE_GAME_OVER,   undefined                     );
   this.AddState( SIMPLE_WAR_STATE_BATTLE,      SIMPLE_WAR_STATE_IN_PROGRESS  );
   this.AddState( SIMPLE_WAR_STATE_WAR,         SIMPLE_WAR_STATE_IN_PROGRESS  );

   this.SetInitialState( SIMPLE_WAR_STATE_BATTLE );
   
   this.SetEnterRoutine( SIMPLE_WAR_STATE_IN_PROGRESS, this.InProgressEnter );
};


//Inherit from ActiveEntity
SimpleWarGame.prototype = new CardGame();
//Correct the constructor pointer
SimpleWarGame.prototype.constructor = SimpleWarGame;


SimpleWarGame.prototype.AddPlayer = function( id, alias )
{
   this.players.push( new SimpleWarPlayer( id, alias ) );
};


SimpleWarGame.prototype.InProgressEnter = function()
{
   if( this.isHost )
   {
      this.dealer.Shuffle();
      this.Deal();
   }
};


SimpleWarGame.prototype.Deal = function()
{
   console.log( "SimpleWar: Deal" );

   // Ensure players get an even number of cards
   var cardRemainder = this.dealer.NumCards() % this.players.length;
   
   console.log( "Card Remainder: %d", cardRemainder );

   var player = 0;
   while( this.dealer.NumCards() > cardRemainder )
   {
      var cardGroup = this.dealer.GetGroup( [ "TOP" ] );

      console.log( "Dealer: %d; Player: %s; Card: %s", this.dealer.NumCards(), this.players[player].alias, cardGroup[0].shortName );

      // TODO: Implement transactions here
      this.players[player].rootContainer.containers[0].AddGroup( cardGroup );

      player++;

      if( player >= this.players.length )
      {
         player = 0;
      }
   }
};


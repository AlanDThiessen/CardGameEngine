
module.exports = SimpleWarGame;
var SimpleWarPlayer = require( "./SimpleWarPlayer.js" );
var CardGame = require( "../../CardGame.js" );
var transDef = require( "../../TransactionDefinition.js" );
var SWGC     = require( "./SimpleWarDefs.js" );

var TransactionDefinition = transDef.TransactionDefinition;
var AddTransactionDefinition = transDef.AddTransactionDefinition;
var TRANSACTION_TYPE_INBOUND = transDef.TRANSACTION_TYPE_INBOUND;
var TRANSACTION_TYPE_OUTBOUND = transDef.TRANSACTION_TYPE_OUTBOUND;


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
function SimpleWarGame( id )
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
   this.SetEnterRoutine( SIMPLE_WAR_STATE_BATTLE,      this.BattleEnter     );
   
   // Add the valid transactions to the states
   this.AddValidTransaction( SIMPLE_WAR_STATE_IN_PROGRESS, "CGE_DEAL" );
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
   console.log( "SimpleWar: InProgress Enter");
   if( this.isHost )
   {
      this.dealer.Shuffle();
      this.Deal();
   }
 
   // Advance to the first player
   this.AdvancePlayer();
};


SimpleWarGame.prototype.BattleEnter = function()
{
   this.AllPlayersHandleEvent( SWGC.SW_EVENT_DO_BATTLE, undefined );
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
      var cardGroup = Array();

      if( this.ExecuteTransaction( "CGE_DEAL", [ "TOP" ], cardGroup ) )
      {
         this.players[player].ExecuteTransaction( SWGC.SWP_TRANSACTION_DEAL, [ "TOP" ], cardGroup );
      }

      player++;

      if( player >= this.players.length )
      {
         player = 0;
      }
   }
};


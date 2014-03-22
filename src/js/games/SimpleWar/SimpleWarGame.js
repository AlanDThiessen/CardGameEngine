
module.exports = SimpleWarGame;
var SimpleWarPlayer = require( "./SimpleWarPlayer.js" );
var SimpleWarPlayerAI = require( "./SimpleWarPlayerAI.js" );
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

   this.hasBattled = [];
 
   // Create the State Machine
   this.AddState( SIMPLE_WAR_STATE_IN_PROGRESS, undefined                     );
   this.AddState( SIMPLE_WAR_STATE_GAME_OVER,   undefined                     );
   this.AddState( SIMPLE_WAR_STATE_BATTLE,      SIMPLE_WAR_STATE_IN_PROGRESS  );
   this.AddState( SIMPLE_WAR_STATE_WAR,         SIMPLE_WAR_STATE_IN_PROGRESS  );

   this.SetInitialState( SIMPLE_WAR_STATE_BATTLE );
   
   this.SetEnterRoutine( SIMPLE_WAR_STATE_IN_PROGRESS, this.InProgressEnter );
   this.SetEnterRoutine( SIMPLE_WAR_STATE_BATTLE,      this.BattleEnter     );

   this.AddEventHandler( SIMPLE_WAR_STATE_BATTLE, SWGC.CGE_EVENT_TRANSACTION, this.BattleTransaction );
   
   // Add the valid transactions to the states
   this.AddValidTransaction( SIMPLE_WAR_STATE_IN_PROGRESS, "CGE_DEAL" );
};


//Inherit from ActiveEntity
SimpleWarGame.prototype = new CardGame();
//Correct the constructor pointer
SimpleWarGame.prototype.constructor = SimpleWarGame;


SimpleWarGame.prototype.AddPlayer = function( id, alias, type )
{
   if( type == "AI" )
   {
      this.players.push( new SimpleWarPlayerAI( this, id, alias ) );
   }
   else
   {
      this.players.push( new SimpleWarPlayer( this, id, alias ) );
   }
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


SimpleWarGame.prototype.BattleTransaction = function( eventId, data )
{
   if( ( data != undefined ) &&
       ( data.ownerId != undefined ) &&
       ( data.transaction != undefined ) )
   {
      if( data.transaction == SWGC.SWP_TRANSACTION_BATTLE )
      {
         this.hasBattled.push( data.ownerId );
      }
   }
 
   // If all players have done battle, then let's do score!
   if( this.hasBattled.length >= this.NumPlayers() )
   {
      // Clear out the array for future use
      this.hasBattled = [];
 
      var topPlayers = this.ScoreBattle();
      this.DetermineBattleResult( topPlayers );
   }

   // Event has been handled
   return true;
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
      this.EventTransaction( this.players[player].id,
                             SWGC.SWP_TRANSACTION_DEAL,
                             this.id,
                             "CGE_DEAL",
                             ["TOP:1"] );

      player++;

      if( player >= this.players.length )
      {
         player = 0;
      }
   }
};


SimpleWarGame.prototype.ScoreBattle = function()
{
   var	topPlayers = [];
   var	topScore = 0;

   console.log( "All players have battled, now let's determine a winner!" );
   
   for( var cntr = 0; cntr < this.NumPlayers(); cntr++ )
   {
      var score = this.players[cntr].GetScore();
      
      if( score > topScore )
      {
         topPlayers = [];
         topPlayers.push( cntr );
         topScore = score;
      }
      else if( score == topScore )
      {
         //  There's a tie situation here!
         topPlayers.push( cntr );
      }
   }
   
   if( topPlayers.length == 1 )
   {
      console.log( "Battle Winner: %s", this.players[topPlayers[0]].name );
   }
   else
   {
      console.log( "Tie between:" );
      for( var cntr = 0; cntr < topPlayers.length; cntr++ )
      {
         console.log( "   - %s", this.players[topPlayers[cntr]].name );
      }
   }

   return topPlayers;
};


SimpleWarGame.prototype.DetermineBattleResult = function( topPlayers )
{
   var numPlayers = this.NumPlayers();


   // Tell all players to discard
   for( var cntr = 0; cntr < numPlayers; cntr++ )
   {
      this.EventTransaction( this.players[cntr].id, SWGC.SWP_TRANSACTION_DICARD,
    		  						  undefined,             undefined,
    		  						  ["TOP:ALL"] );
   }

   // If there is a tie, we need to go to War!
   if( topPlayers.length > 1 )
   {
      for( var cntr = 0; cntr < numPlayers; cntr++ )
      {
         var doWar = false;
 
         // If the current player index is in the list of winners, then signal war
         if( topPlayers.indexOf( cntr ) != -1 )
         {
            doWar = true;
         }
 
         this.SendEvent( SWGC.SW_EVENT_DO_WAR, { ownerId: this.players[cntr].id, gotoWar: doWar } );
      }
   }
   else
   {
      var winnerIndex = topPlayers.pop();
 
      for( var cntr = 0; cntr < numPlayers; cntr++ )
      {
         this.EventTransaction( this.players[winnerIndex].id, SWGC.SWP_TRANSACTION_COLLECT,
        		 						  this.players[cntr].id,        SWGC.SWP_TRANSACTION_GIVEUP,
        		 						  ["TOP:ALL"] );
      }
   }
};

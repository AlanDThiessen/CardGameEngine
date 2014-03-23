
module.exports = SimpleWarGame;
var SimpleWarPlayer = require( "./SimpleWarPlayer.js" );
var SimpleWarPlayerAI = require( "./SimpleWarPlayerAI.js" );
var CardGame = require( "../../CardGame.js" );
var transDef = require( "../../TransactionDefinition.js" );
var SWGC     = require( "./SimpleWarDefs.js" );
var log      = require( "../../Logger.js" );

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
var SIMPLE_WAR_STATE_SCORE       = "Score";


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

   this.hasBattled   = [];
   this.atBattle     = [];
 
   // Create the State Machine
   this.AddState( SIMPLE_WAR_STATE_IN_PROGRESS, undefined                     );
   this.AddState( SIMPLE_WAR_STATE_GAME_OVER,   undefined                     );
   this.AddState( SIMPLE_WAR_STATE_BATTLE,      SIMPLE_WAR_STATE_IN_PROGRESS  );
   this.AddState( SIMPLE_WAR_STATE_SCORE,       SIMPLE_WAR_STATE_IN_PROGRESS  );

   this.SetInitialState( SIMPLE_WAR_STATE_BATTLE );
 
   this.SetEnterRoutine( SIMPLE_WAR_STATE_IN_PROGRESS, this.InProgressEnter );
   this.SetEnterRoutine( SIMPLE_WAR_STATE_BATTLE,      this.BattleEnter     );
   this.SetEnterRoutine( SIMPLE_WAR_STATE_SCORE,       this.ScoreEnter      );

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
   if( this.isHost )
   {
      this.dealer.Shuffle();
      this.Deal();
   }

   // Advance to the first player
   this.AdvancePlayer();
   this.ResetBattleList();
};


SimpleWarGame.prototype.BattleEnter = function()
{
   log.info( "SWGame : ************************* BATTLE *************************");
   this.hasBattled = [];
   this.SendEvent( SWGC.SW_EVENT_DO_BATTLE, undefined );
};


SimpleWarGame.prototype.BattleTransaction = function( eventId, data )
{
   var	eventHandled = false;


   if( ( data             != undefined ) &&
       ( data.ownerId     != undefined ) &&
       ( data.transaction != undefined ) )
   {
      if( data.transaction == SWGC.SWP_TRANSACTION_BATTLE )
      {
         this.hasBattled.push( data.ownerId );
 
         // If all players have done battle, then let's do score!
         if( this.hasBattled.length >= this.atBattle.length )
         {
            this.Transition( SIMPLE_WAR_STATE_SCORE );
         }

         eventHandled = true;
      }
   }

   return eventHandled;
};


SimpleWarGame.prototype.ScoreEnter = function()
{
   this.atBattle = this.ScoreBattle();
   this.DetermineBattleResult( this.atBattle );

   if( this.atBattle.length == 1 )
   {
      log.info( "SWGame : %s Wins!!!", this.players[ this.atBattle[0] ].name );
      this.Transition( SIMPLE_WAR_STATE_GAME_OVER );
   }
   else
   {
      this.Transition( SIMPLE_WAR_STATE_BATTLE );
   }
};


SimpleWarGame.prototype.Deal = function()
{
   log.info( "SWGame : Deal" );

   // Ensure players get an even number of cards
   var cardRemainder = this.dealer.NumCards() % this.NumPlayers();

   log.debug( "SWGame : Card Remainder: %d", cardRemainder );

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
   var   topPlayers = [];
   var   topScore = 0;


   for( var cntr = 0; cntr < this.atBattle.length; cntr++ )
   {
      var score = this.players[ this.atBattle[cntr] ].GetScore();
 
      if( score > topScore )
      {
         topPlayers = [];
         topPlayers.push( this.atBattle[cntr] );
         topScore = score;
      }
      else if( score == topScore )
      {
         //  There's a tie situation here!
         topPlayers.push( this.atBattle[cntr] );
      }
   }
   
   if( topPlayers.length == 1 )
   {
      log.info( "SWGame : Battle Winner: %s", this.players[ topPlayers[0] ].name );
   }
   else
   {
      log.info( "SWGame : Tie between:" );
      
      for( var cntr = 0; cntr < topPlayers.length; cntr++ )
      {
         log.info( "SWGame :   - %s", this.players[ topPlayers[cntr] ].name );
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
      log.info( "SWGame : ************************* WAR!!! *************************");
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

      log.info( "SWGame : Stack Counts:" );
   
      for( var cntr = 0; cntr < this.NumPlayers(); cntr++ )
      {
         var cont1 = this.players[cntr].rootContainer.GetContainerById( "Stack" );
         var cont2 = this.players[cntr].rootContainer.GetContainerById( "Battle" );
         var cont3 = this.players[cntr].rootContainer.GetContainerById( "Discard" );
         log.info( "SWGame :   - %s : %d %d %d",
                   this.players[cntr].name,
                   cont1.NumCards(),
                   cont2.NumCards(),
                   cont3.NumCards() );
      }
   
      this.ResetBattleList();
   }
};


SimpleWarGame.prototype.ResetBattleList = function()
{
   this.atBattle = [];

   for( cntr = 0; cntr < this.NumPlayers(); cntr++ )
   {
      if( this.players[cntr].IsInGame() )
      {
         this.atBattle.push( cntr );
      }
   }
};


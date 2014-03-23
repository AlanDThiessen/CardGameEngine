module.exports = SimpleWarPlayer;

var SWGC     = require( "./SimpleWarDefs.js" );
var Player   = require( "../../Player.js" );
var transDef = require( "../../TransactionDefinition.js" );
var log      = require( "../../Logger.js" );

var TransactionDefinition = transDef.TransactionDefinition;
var AddTransactionDefinition = transDef.AddTransactionDefinition;
var TRANSACTION_TYPE_INBOUND = transDef.TRANSACTION_TYPE_INBOUND;
var TRANSACTION_TYPE_OUTBOUND = transDef.TRANSACTION_TYPE_OUTBOUND;


/******************************************************************************
 * States
 ******************************************************************************/
var SWP_STATE_IN_GAME         = "InGame";    // Top:InGame
var SWP_STATE_OUT             = "Out";       // Top:Out
var SWP_STATE_READY           = "Ready";     // Top:InGame:Ready
var SWP_STATE_BATTLE          = "Battle";    // Top:InGame:Battle
var SWP_STATE_WAIT            = "Wait";      // Top:InGame:Wait

/******************************************************************************
 * Containers
 ******************************************************************************/
var SWP_CONTAINER_STACK       = "Stack";     // The main stack of cards
var SWP_CONTAINER_BATTLE      = "Battle";    // The location to flip the top card
var SWP_CONTAINER_DISCARD     = "Discard";   // Where all turned cards go before end of turn


// Internal Transactions
AddTransactionDefinition( SWGC.SWP_TRANSACTION_BATTLE,   SWP_CONTAINER_STACK,      SWP_CONTAINER_BATTLE,       1, 1, "TOP"     );
AddTransactionDefinition( SWGC.SWP_TRANSACTION_DICARD,   SWP_CONTAINER_BATTLE,     SWP_CONTAINER_DISCARD,      1, 1, "TOP"     );
AddTransactionDefinition( SWGC.SWP_TRANSACTION_FLOP,     SWP_CONTAINER_STACK,      SWP_CONTAINER_DISCARD,      3, 3, "TOP"     );

// Incoming Transactions
AddTransactionDefinition( SWGC.SWP_TRANSACTION_DEAL,     TRANSACTION_TYPE_INBOUND, SWP_CONTAINER_STACK,        1, 52, "TOP"    );
AddTransactionDefinition( SWGC.SWP_TRANSACTION_COLLECT,  TRANSACTION_TYPE_INBOUND, SWP_CONTAINER_STACK,        1, 52, "BOTTOM" );

// Outgoing Transactions
AddTransactionDefinition( SWGC.SWP_TRANSACTION_GIVEUP,   SWP_CONTAINER_DISCARD,    TRANSACTION_TYPE_OUTBOUND,  1, 52, "TOP"    );


/******************************************************************************
 * CLASS Definition: Simple War Player
 ******************************************************************************/

/******************************************************************************
 *
 * Class: SimpleWarPlayer
 * Inherits From: Player
 * Constructor
 *
 ******************************************************************************/
function SimpleWarPlayer( parent, id, alias )
{
   // Call the parent class constructor
   Player.call( this, parent, id, alias );

   // Create the State Machine
   this.AddState( SWP_STATE_IN_GAME,   undefined         );
   this.AddState( SWP_STATE_OUT,       undefined         );
   this.AddState( SWP_STATE_READY,     SWP_STATE_IN_GAME );
   this.AddState( SWP_STATE_BATTLE,    SWP_STATE_IN_GAME );
   this.AddState( SWP_STATE_WAIT,      SWP_STATE_IN_GAME );

   this.SetInitialState( SWP_STATE_READY );

   this.SetEnterRoutine( SWP_STATE_WAIT,      this.WaitEnter     );

   this.AddEventHandler( SWP_STATE_READY,  SWGC.SW_EVENT_DO_BATTLE,    this.DoBattle );
   this.AddEventHandler( SWP_STATE_BATTLE, SWGC.CGE_EVENT_TRANSACTION, this.BattleTransaction );
   this.AddEventHandler( SWP_STATE_WAIT,   SWGC.CGE_EVENT_TRANSACTION, this.WaitTransaction );
   this.AddEventHandler( SWP_STATE_WAIT,   SWGC.SW_EVENT_DO_WAR,       this.DoWar );

   // TODO: Need definitions for Max cards in deck
   this.AddContainer( "Stack",   undefined, 0, 52 );
   this.AddContainer( "Battle",  undefined, 0,  1 );
   this.AddContainer( "Discard", undefined, 0, 52 );

   // Add the valid transactions to the states
   this.AddValidTransaction( SWP_STATE_IN_GAME,   SWGC.SWP_TRANSACTION_DICARD  );
   this.AddValidTransaction( SWP_STATE_IN_GAME,   SWGC.SWP_TRANSACTION_COLLECT );
   this.AddValidTransaction( SWP_STATE_IN_GAME,   SWGC.SWP_TRANSACTION_GIVEUP  );
   this.AddValidTransaction( SWP_STATE_READY,     SWGC.SWP_TRANSACTION_DEAL    );
   this.AddValidTransaction( SWP_STATE_BATTLE,    SWGC.SWP_TRANSACTION_BATTLE  );
   this.AddValidTransaction( SWP_STATE_WAIT,      SWGC.SWP_TRANSACTION_FLOP    );
};

//Inherit from ActiveEntity
SimpleWarPlayer.prototype = new Player();
//Correct the constructor pointer
SimpleWarPlayer.prototype.constructor = SimpleWarPlayer;


SimpleWarPlayer.prototype.DoBattle = function()
{
   this.Transition( SWP_STATE_BATTLE );

   return true;
};


SimpleWarPlayer.prototype.BattleTransaction = function( eventId, data )
{
   var eventHandled = false;

   if( data.transaction == SWGC.SWP_TRANSACTION_BATTLE )
   {
      eventHandled = true;
      this.Transition( SWP_STATE_WAIT );
   }

   return eventHandled;
};


SimpleWarPlayer.prototype.WaitEnter = function()
{
   this.Score();
};


SimpleWarPlayer.prototype.WaitTransaction = function( eventId, data )
{
   var eventHandled = false;


   if( ( data.transaction == SWGC.SWP_TRANSACTION_GIVEUP ) &&
       ( data.ownerId == this.id ) )
   {
      eventHandled = true;
      this.Transition( SWP_STATE_READY );
   }

   return eventHandled;
};


SimpleWarPlayer.prototype.DoWar = function( eventId, data )
{
   var eventHandled = false;


   if( ( data.gotoWar ) && ( data.ownerId == this.id ) )
   {
      this.parentGame.EventTransaction( this.id,   SWGC.SWP_TRANSACTION_FLOP,
                                        undefined,	undefined,
                                        ["TOP:3"] );
      this.Transition( SWP_STATE_READY );

      eventHandled = true;
   }

   return eventHandled;
};


SimpleWarPlayer.prototype.Score = function()
{
   var   cont = this.rootContainer.GetContainerById( "Battle" );
   var   score = 0;
 
   function CardScore( element )
   {
      score += parseInt( element.rank, 10 );
   }
   
   if( cont != undefined )
   {
      cont.cards.forEach( CardScore );
   }

   log.info( "SWPlay : %s: Score: = %d", this.name, score );
   this.score = score;
};

module.exports = SimpleWarPlayer;

var Player = require( "../../Player.js" );
var TransactionDefinition = require( "../../TransactionDefinition.js" );

/******************************************************************************
 * States
 ******************************************************************************/
var SWP_STATE_IN_GAME         = "InGame";    // Top:InGame
var SWP_STATE_OUT             = "Out";       // Top:Out
var SWP_STATE_READY           = "Ready";     // Top:InGame:Ready
var SWP_STATE_BATTLE          = "Battle";    // Top:InGame:Battle
var SWP_STATE_WAIT            = "Wait";      // Top:InGame:Wait
var SWP_STATE_WAR             = "War";       // Top:InGame:War
var SWP_STATE_FLOP            = "Flop";      // Top:InGame:War:Flop
var SWP_STATE_DRAW            = "Draw";      // Top:InGame:War:Draw

/******************************************************************************
 * Containers
 ******************************************************************************/
var SWP_CONTAINER_STACK       = "Stack";     // The main stack of cards
var SWP_CONTAINER_BATTLE      = "Battle";    // The location to flip the top card
var SWP_CONTAINER_DISCARD     = "Discard";   // Where all turned cards go before end of turn


/******************************************************************************
 * Transaction Definitions
 ******************************************************************************/
var SWP_TRANSACTION_DEAL      = "Deal";      // All inbound cards to Stack
var SWP_TRANSACTION_BATTLE    = "Battle";    // 1 card from Stack to Battle
var SWP_TRANSACTION_DICARD    = "Discard";   // 1 card from Battle to Discard
var SWP_TRANSACTION_FLOP      = "Flop";      // 3 cards from Stack to Discard
var SWP_TRANSACTION_COLLECT   = "Collect";   // All inbound cards to Stack
var SWP_TRANSACTION_GIVEUP    = "GiveUp";    // All outbound cards from Discard 

var SWPTransactions = Array();

// Internal Transactions
SWPTransactions.push( new TransactionDefinition( SWP_TRANSACTION_BATTLE,   SWP_CONTAINER_STACK,      SWP_CONTAINER_BATTLE,       1, 1 ) );
SWPTransactions.push( new TransactionDefinition( SWP_TRANSACTION_DICARD,   SWP_CONTAINER_BATTLE,     SWP_CONTAINER_DISCARD,      1, 1 ) );
SWPTransactions.push( new TransactionDefinition( SWP_TRANSACTION_FLOP,     SWP_CONTAINER_STACK,      SWP_CONTAINER_DISCARD,      3, 3 ) );

// Incoming Transactions
SWPTransactions.push( new TransactionDefinition( SWP_TRANSACTION_DEAL,     TRANSACTION_TYPE_INBOUND, SWP_CONTAINER_STACK,        1, 52 ) );
SWPTransactions.push( new TransactionDefinition( SWP_TRANSACTION_COLLECT,  TRANSACTION_TYPE_INBOUND, SWP_CONTAINER_DISCARD,      1, 52 ) );

// Outgoing Transactions
SWPTransactions.push( new TransactionDefinition( SWP_TRANSACTION_GIVEUP,   SWP_CONTAINER_DISCARD,    TRANSACTION_TYPE_OUTBOUND,  1, 52 ) );


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
function SimpleWarPlayer( id, alias )
{
   // Call the parent class constructor
   Player.call( this, id, alias );

   // Create the State Machine
   this.AddState( SWP_STATE_IN_GAME,   undefined         );
   this.AddState( SWP_STATE_OUT,       undefined         );
   this.AddState( SWP_STATE_READY,     SWP_STATE_IN_GAME );
   this.AddState( SWP_STATE_BATTLE,    SWP_STATE_IN_GAME );
   this.AddState( SWP_STATE_WAIT,      SWP_STATE_IN_GAME );
   this.AddState( SWP_STATE_WAR,       SWP_STATE_IN_GAME );
   this.AddState( SWP_STATE_FLOP,      SWP_STATE_WAR     );
   this.AddState( SWP_STATE_DRAW,      SWP_STATE_WAR     );

   this.SetInitialState( SWP_STATE_READY );

   // TODO: Need definitions for Max cards in deck
   this.AddContainer( "Stack",   undefined, 0, 52 );
   this.AddContainer( "Battle",  undefined, 0,  1 );
   this.AddContainer( "Discard", undefined, 0, 52 );

   // Add the valid transactions to the states
   this.AddValidTransaction( SWP_STATE_READY,  SWP_TRANSACTION_DEAL    );
   this.AddValidTransaction( SWP_STATE_BATTLE, SWP_TRANSACTION_BATTLE  );
   this.AddValidTransaction( SWP_STATE_FLOP,   SWP_TRANSACTION_FLOP    );
   this.AddValidTransaction( SWP_STATE_DRAW,   SWP_TRANSACTION_BATTLE  );
   this.AddValidTransaction( SWP_STATE_WAIT,   SWP_TRANSACTION_COLLECT );
   this.AddValidTransaction( SWP_STATE_WAIT,   SWP_TRANSACTION_GIVEUP  );
};

//Inherit from ActiveEntity
SimpleWarPlayer.prototype = new Player();
//Correct the constructor pointer
SimpleWarPlayer.prototype.constructor = SimpleWarPlayer;



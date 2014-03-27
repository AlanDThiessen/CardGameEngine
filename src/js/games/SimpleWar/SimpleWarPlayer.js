module.exports = SimpleWarPlayer;

var SWGC = require("./SimpleWarDefs.js");
var Player = require("../../Player.js");
var transDef = require("../../TransactionDefinition.js");
var PlayerStatus = require("./SimpleWarStatus.js").SimpleWarPlayerStatus;
var log = require("../../Logger.js");

var TransactionDefinition = transDef.TransactionDefinition;
var AddTransactionDefinition = transDef.AddTransactionDefinition;
var TRANSACTION_TYPE_INBOUND = transDef.TRANSACTION_TYPE_INBOUND;
var TRANSACTION_TYPE_OUTBOUND = transDef.TRANSACTION_TYPE_OUTBOUND;

/*******************************************************************************
 * States
 ******************************************************************************/
var SWP_STATE_IN_GAME = "InGame";         // Top:InGame
var SWP_STATE_OUT = "Out";                // Top:Out
var SWP_STATE_READY = "Ready";            // Top:InGame:Ready
var SWP_STATE_BATTLE = "Battle";          // Top:InGame:Battle
var SWP_STATE_WAIT = "Wait";              // Top:InGame:Wait

/*******************************************************************************
 * Containers
 ******************************************************************************/
var SWP_CONTAINER_STACK = "Stack";        // The main stack of cards
var SWP_CONTAINER_BATTLE = "Battle";      // The location to flip the top card
var SWP_CONTAINER_DISCARD = "Discard";    // Where all turned cards go before end of turn

// Internal Transactions
AddTransactionDefinition(SWGC.SWP_TRANSACTION_BATTLE,  SWP_CONTAINER_STACK,      SWP_CONTAINER_BATTLE,      1, 1, "TOP");
AddTransactionDefinition(SWGC.SWP_TRANSACTION_DICARD,  SWP_CONTAINER_BATTLE,     SWP_CONTAINER_DISCARD,     1, 1, "TOP");
AddTransactionDefinition(SWGC.SWP_TRANSACTION_FLOP,    SWP_CONTAINER_STACK,      SWP_CONTAINER_DISCARD,     3, 3, "TOP");

// Incoming Transactions
AddTransactionDefinition(SWGC.SWP_TRANSACTION_DEAL,    TRANSACTION_TYPE_INBOUND, SWP_CONTAINER_STACK,       1, 52, "TOP");
AddTransactionDefinition(SWGC.SWP_TRANSACTION_COLLECT, TRANSACTION_TYPE_INBOUND, SWP_CONTAINER_STACK,       1, 52, "BOTTOM");

// Outgoing Transactions
AddTransactionDefinition(SWGC.SWP_TRANSACTION_GIVEUP,  SWP_CONTAINER_DISCARD,    TRANSACTION_TYPE_OUTBOUND, 1, 52, "TOP");

   
/*******************************************************************************
 * CLASS Definition: Simple War Player
 ******************************************************************************/

/*******************************************************************************
 * 
 * Class: SimpleWarPlayer Inherits From: Player Constructor
 * 
 ******************************************************************************/
function SimpleWarPlayer(parent, id, alias) {
   // Call the parent class constructor
   Player.call(this, parent, id, alias);

   this.inGame = true;
   this.status = new PlayerStatus;

   this.status.id = this.id;
   this.status.type = 'USER';
   this.status.alias = this.alias;

   // Create the State Machine
   this.AddState(SWP_STATE_IN_GAME, undefined);
   this.AddState(SWP_STATE_OUT,     undefined);
   this.AddState(SWP_STATE_READY,   SWP_STATE_IN_GAME);
   this.AddState(SWP_STATE_BATTLE,  SWP_STATE_IN_GAME);
   this.AddState(SWP_STATE_WAIT,    SWP_STATE_IN_GAME);

   this.SetInitialState(SWP_STATE_READY);

   this.SetEnterRoutine(SWP_STATE_IN_GAME, this.InGameEnter);
   this.SetEnterRoutine(SWP_STATE_WAIT,    this.WaitEnter);
   this.SetExitRoutine( SWP_STATE_IN_GAME, this.InProgressExit);

   this.AddEventHandler(SWP_STATE_IN_GAME, SWGC.CGE_EVENT_TRANSACTION, this.InGameTransaction); // Catch-all to update status after a // transaction
   this.AddEventHandler(SWP_STATE_READY,   SWGC.SW_EVENT_DO_BATTLE,    this.DoBattle);
   this.AddEventHandler(SWP_STATE_BATTLE,  SWGC.CGE_EVENT_TRANSACTION, this.BattleTransaction);
   this.AddEventHandler(SWP_STATE_WAIT,    SWGC.CGE_EVENT_TRANSACTION, this.WaitTransaction);
   this.AddEventHandler(SWP_STATE_WAIT,    SWGC.SW_EVENT_DO_WAR,       this.DoWar);

   // TODO: Need definitions for Max cards in deck
   this.stack = this.AddContainer("Stack", undefined, 0, 52);
   this.battle = this.AddContainer("Battle", undefined, 0, 1);
   this.discard = this.AddContainer("Discard", undefined, 0, 52);

   // Add the valid transactions to the states
   this.AddValidTransaction(SWP_STATE_IN_GAME, SWGC.SWP_TRANSACTION_DICARD);
   this.AddValidTransaction(SWP_STATE_IN_GAME, SWGC.SWP_TRANSACTION_COLLECT);
   this.AddValidTransaction(SWP_STATE_IN_GAME, SWGC.SWP_TRANSACTION_GIVEUP);
   this.AddValidTransaction(SWP_STATE_OUT,     SWGC.SWP_TRANSACTION_GIVEUP);
   this.AddValidTransaction(SWP_STATE_READY,   SWGC.SWP_TRANSACTION_DEAL);
   this.AddValidTransaction(SWP_STATE_BATTLE,  SWGC.SWP_TRANSACTION_BATTLE);
   this.AddValidTransaction(SWP_STATE_WAIT,    SWGC.SWP_TRANSACTION_FLOP);
};

SimpleWarPlayer.prototype = new Player();
SimpleWarPlayer.prototype.constructor = SimpleWarPlayer;

/*******************************************************************************
 * 
 * SimpleWarPlayer.prototype.InGameEnter
 * 
 * This method performs the action upon entrance to the In Game state.
 * 
 ******************************************************************************/
SimpleWarPlayer.prototype.InGameEnter = function() {
   this.UpdateStatus();
};

/*******************************************************************************
 * 
 * SimpleWarPlayer.prototype.InGameTransaction
 * 
 * This method handles the Transaction event for the In Game state.
 * 
 ******************************************************************************/
SimpleWarPlayer.prototype.InGameTransaction = function(eventId, data) {
   // Update our status anytime we perform a transcation
   if (data.ownerId == this.id) {
      this.UpdateStatus();
   }
   
   return true;	// Event was handled
};

/*******************************************************************************
 * 
 * SimpleWarPlayer.prototype.InProgressExit
 * 
 * This method performs the action taken upon exit from the In Progress state.
 * 
 ******************************************************************************/
SimpleWarPlayer.prototype.InProgressExit = function() {
   // Discard our Battle stack
   this.ExecuteTransaction(SWGC.SWP_TRANSACTION_DISCARD, [ "TOP:ALL" ], undefined);
   this.inGame = false;
   this.UpdateStatus();
   log.info("SwPlay : %s is Out", this.name);
};

/*******************************************************************************
 * 
 * SimpleWarPlayer.prototype.DoBattle
 * 
 * This method handles the Do Battle event in the Ready state.  It transitions
 * to the Battle state.
 * 
 ******************************************************************************/
SimpleWarPlayer.prototype.DoBattle = function() {
   this.score = 0;
   this.Transition(SWP_STATE_BATTLE);

   return true;
};

/*******************************************************************************
 * 
 * SimpleWarPlayer.prototype.BattleTransaction
 * 
 * This method handles the Transaction in the Battle state.  The event
 * is only handled if it is for this player, and it is a Battle transaction.
 * 
 ******************************************************************************/
SimpleWarPlayer.prototype.BattleTransaction = function(eventId, data) {
   var eventHandled = false;

   if (    (data.ownerId == this.id)
        && (data.transaction == SWGC.SWP_TRANSACTION_BATTLE)) {
      this.UpdateStatus();
      this.Transition(SWP_STATE_WAIT);
      eventHandled = true;
   }

   return eventHandled;
};

/*******************************************************************************
 * 
 * SimpleWarPlayer.prototype.WaitEnter
 * 
 * This method performs the action taken upon entrance to the Wait state.
 * 
 ******************************************************************************/
SimpleWarPlayer.prototype.WaitEnter = function() {
   this.Score();
};

/*******************************************************************************
 * 
 * SimpleWarPlayer.prototype.WaitTransaction
 * 
 * This method handles the Transaction event in the Wait state.
 * 
 ******************************************************************************/
SimpleWarPlayer.prototype.WaitTransaction = function(eventId, data) {
   var eventHandled = false;

   if (    (data.transaction == SWGC.SWP_TRANSACTION_GIVEUP)
        && (data.ownerId == this.id)) {

      // TODO: Fix bug where player will go out even if he just won the battle
      if (this.stack.IsEmpty()) {
         this.ExecuteTransaction(SWGC.SWP_TRANSACTION_DISCARD, [ "TOP:ALL" ], undefined);
         this.Transition(SWP_STATE_OUT);
      } else {
         this.Transition(SWP_STATE_READY);
      }

      this.UpdateStatus();
      eventHandled = true;
   }

   return eventHandled;
};

/*******************************************************************************
 * 
 * SimpleWarPlayer.prototype.DoWar
 * 
 * This method handles the Do War event in the Wait state.
 * 
 ******************************************************************************/
SimpleWarPlayer.prototype.DoWar = function(eventId, data) {
   var eventHandled = false;

   if (data.ownerId == this.id) {
      if (data.gotoWar) {
         this.ExecuteTransaction(SWGC.SWP_TRANSACTION_FLOP, [ "TOP:3" ], undefined);
         this.Transition(SWP_STATE_READY);
      } else {
         this.score = 0;
      }

      this.UpdateStatus();
      eventHandled = true;
   }

   return eventHandled;
};

/*******************************************************************************
 * 
 * SimpleWarPlayer.prototype.Score
 * 
 * This method calculates the score for this player based on the rank of the 
 * card on the Battle stack
 * 
 ******************************************************************************/
SimpleWarPlayer.prototype.Score = function() {
   var score = 0;

   function CardScore(element) {
      score += parseInt(element.rank, 10);
   }

   this.battle.cards.forEach(CardScore);

   log.info("SWPlay : %s: Score: = %d", this.name, score);
   this.score = score;
};

/*******************************************************************************
 * 
 * SimpleWarPlayer.prototype.IsInGame
 * 
 * This method returns true if the player is still in the game (i.e. Not out of
 * cards)
 * 
 ******************************************************************************/
SimpleWarPlayer.prototype.IsInGame = function() {
   return this.inGame;
};

/*******************************************************************************
 * 
 * SimpleWarPlayer.prototype.UpdateStatus
 * 
 * This method updates the status of the this player for feedback to the UI.
 * 
 ******************************************************************************/
SimpleWarPlayer.prototype.UpdateStatus = function() {
   // Indicate what our stack size is
   this.status.stackSize = this.stack.NumCards();
   this.status.discardSize = this.discard.NumCards();
   this.status.discardList = this.discard.GetList(); // Get the list of cards

   // Prune the list so only visible cards are shown
   for ( var cntr = 0; cntr < this.status.discardList.length; cntr++) {
      // Only every 4th card should be visible, starting with the first one
      if (cntr % 4 > 0) {
         this.status.discardList[cntr] = "";
      }
   }

   // If our battle stack has a card on it, then indicate what that card is
   if (this.battle.NumCards() > 0) {
      this.status.battleStackTop = this.battle.cards[0].shortName;
   } else {
      this.status.battleStackTop = '';
   }

   // Now, notify the game engine of our updated status
   this.parentGame.UpdatePlayerStatus(this.id, this.status);
};

module.exports = SimpleWarGame;

var SimpleWarPlayer = require("./SimpleWarPlayer.js");
var SimpleWarPlayerAI = require("./SimpleWarPlayerAI.js");
var CardGame = require("../../CardGame.js");
var transDef = require("../../TransactionDefinition.js");
var CGE = require("../../CardGameDefs.js");
var SWGC = require("./SimpleWarDefs.js");
var SimpleWarUI = require("./SimpleWarUI.js");
var log = require("../../Logger.js");

var TransactionDefinition = transDef.TransactionDefinition;
var AddTransactionDefinition = transDef.AddTransactionDefinition;
var TRANSACTION_TYPE_INBOUND = transDef.TRANSACTION_TYPE_INBOUND;
var TRANSACTION_TYPE_OUTBOUND = transDef.TRANSACTION_TYPE_OUTBOUND;

/*******************************************************************************
 * States
 ******************************************************************************/
var SIMPLE_WAR_STATE_IN_PROGRESS = "InProgress";
var SIMPLE_WAR_STATE_GAME_OVER   = "GameOver";
var SIMPLE_WAR_STATE_BATTLE      = "Battle";
var SIMPLE_WAR_STATE_SCORE       = "Score";

                                           
/*******************************************************************************
 * CLASS Definition: Simple War Game
 ******************************************************************************/

/*******************************************************************************
 * 
 * Class: SimpleWarGame
 * Inherits From: CardGame
 * 
 ******************************************************************************/
function SimpleWarGame(id) {
   // Call the parent class constructor
   CardGame.call(this, "Simple War");

   this.hasBattled = [];
   this.atBattle = [];
   this.atWar = false;

   // Create the State Machine
   this.AddState(SIMPLE_WAR_STATE_IN_PROGRESS, undefined);
   this.AddState(SIMPLE_WAR_STATE_GAME_OVER,   undefined);
   this.AddState(SIMPLE_WAR_STATE_BATTLE,      SIMPLE_WAR_STATE_IN_PROGRESS);
   this.AddState(SIMPLE_WAR_STATE_SCORE,       SIMPLE_WAR_STATE_IN_PROGRESS);

   this.SetInitialState(SIMPLE_WAR_STATE_BATTLE);

   this.SetEnterRoutine(SIMPLE_WAR_STATE_IN_PROGRESS, this.InProgressEnter);
   this.SetEnterRoutine(SIMPLE_WAR_STATE_BATTLE,      this.BattleEnter);
   this.SetEnterRoutine(SIMPLE_WAR_STATE_SCORE,       this.ScoreEnter);

   this.AddEventHandler(SIMPLE_WAR_STATE_BATTLE,      CGE.CGE_EVENT_TRANSACTION, this.BattleTransaction);
   this.AddEventHandler(SIMPLE_WAR_STATE_IN_PROGRESS, CGE.CGE_EVENT_DEAL,        this.Deal);
   this.AddEventHandler(SIMPLE_WAR_STATE_SCORE,       CGE.CGE_EVENT_SCORE,       this.EventScore);

   // Add the valid transactions to the states
   this.AddValidTransaction(SIMPLE_WAR_STATE_IN_PROGRESS, "CGE_DEAL");
}

SimpleWarGame.prototype = new CardGame();
SimpleWarGame.prototype.constructor = SimpleWarGame;

/*******************************************************************************
 * 
 * Simplewar.prototype.AddPlayer
 * 
 * This method creates either a SimpleWarPlayer or a SimpleWarPlayer AI based on 
 * the type of the player passed in, and adds the player to the game.
 * 
 ******************************************************************************/
SimpleWarGame.prototype.AddPlayer = function(id, alias, type) {
   if (type == "AI") {
      this.players.push(new SimpleWarPlayerAI(this, id, alias));
   } else {
      this.players.push(new SimpleWarPlayer(this, id, alias));
   }
};

/*******************************************************************************
 * 
 * Simplewar.prototype.InProgressEnter
 * 
 * This method performs the action upon entrance to the In Progress state.
 * It shuffles the cards and sends the event to deal.
 * 
 ******************************************************************************/
SimpleWarGame.prototype.InProgressEnter = function() {
   if (this.isHost) {
      this.dealer.Shuffle();
      this.SendEvent(CGE.CGE_EVENT_DEAL);
   }

   // Advance to the first player
   this.AdvancePlayer();		// Current player is not really used in this game.
   this.ResetBattleList();
};

/*******************************************************************************
 * 
 * Simplewar.prototype.BattleEnter
 * 
 * This method performs the action upon entrance to the Battle state.  It sends
 * a Do Battle event to all players.
 * 
 ******************************************************************************/
SimpleWarGame.prototype.BattleEnter = function() {
   log.info("SWGame : ************************* BATTLE *************************");
   this.hasBattled = [];
   this.SendEvent(SWGC.SW_EVENT_DO_BATTLE, undefined);
};

/*******************************************************************************
 * 
 * Simplewar.prototype.BattleTransaction
 * 
 * This method handles the Battle transaction in the Battle state.  If every
 * player has performed the transaction, then the state transitions to the
 * Score state.
 * 
 ******************************************************************************/
SimpleWarGame.prototype.BattleTransaction = function(eventId, data) {
   var eventHandled = false;

   if (  (data             !== undefined) &&
         (data.ownerId     !== undefined) &&
         (data.transaction !== undefined)) {

      if (data.transaction == SWGC.SWP_TRANSACTION_BATTLE) {
         this.hasBattled.push(data.ownerId);

         // If all players have done battle, then let's do score!
         if (this.hasBattled.length >= this.atBattle.length) {
            this.Transition(SIMPLE_WAR_STATE_SCORE);
         }

         eventHandled = true;
      }
   }

   return eventHandled;
};

/*******************************************************************************
 * 
 * Simplewar.prototype.ScoreEnter
 * 
 * This method performs the action upon entrance to the Score state.
 * It delays for a period before sending the score event.  This delay is so the
 * user has time to observe the cards.
 * 
 ******************************************************************************/
SimpleWarGame.prototype.ScoreEnter = function() {
   var that = this;
   var timeout;
      
   if (typeof window !== 'undefined') {
      timeout = 2000;
   } else {
      timeout = 20;
   }

   this.atBattle = this.ScoreBattle();

   setTimeout(function() {
      that.SendEvent(CGE.CGE_EVENT_SCORE, undefined);
   }, timeout);
};

/*******************************************************************************
 * 
 * Simplewar.prototype.EventScore
 * 
 * This method handles the Score event.  It Scores the battle, determines the
 * result.  It transitions to the Game Over state if only one player is left.
 * Otherwise, it transitions back to the battle state.
 * 
 ******************************************************************************/
SimpleWarGame.prototype.EventScore = function() {
   this.LogPlayerStatus();
   this.DetermineBattleResult(this.atBattle);

   if (this.atBattle.length == 1) {
      var alias = this.players[this.atBattle[0]].alias;
      this.Notify(alias + ' Wins the Game!');
      this.Transition(SIMPLE_WAR_STATE_GAME_OVER);
      this.SendEvent(CGE.CGE_EVENT_EXIT, undefined);
   } else {
      this.Transition(SIMPLE_WAR_STATE_BATTLE);
   }
};

/*******************************************************************************
 * 
 * Simplewar.prototype.Deal
 * 
 * This method schedules the transactions to deal the cards from the dealer
 * to each individual player.  Note: Each player is dealt an even number of
 * cards.  The remainder of the cards is left in the dealer container.
 * 
 ******************************************************************************/
SimpleWarGame.prototype.Deal = function() {
   log.info("SWGame : Deal");

   // Ensure players get an even number of cards
   var cardRemainder = this.dealer.NumCards() % this.NumPlayers();

   log.debug("SWGame : Card Remainder: %d", cardRemainder);

   var player = 0;
   var numCards = this.dealer.NumCards() - cardRemainder;

   while (numCards) {
      this.EventTransaction(this.players[player].id,
                            SWGC.SWP_TRANSACTION_DEAL,
                            this.id,
                            "CGE_DEAL",
                            [ "TOP:1" ]);

      player++;

      if (player >= this.players.length) {
         player = 0;
      }

      numCards--;
   }
};

/*******************************************************************************
 * 
 * Simplewar.prototype.ScoreBattle
 * 
 * This method builds a list of indices to the array of players with the
 * highest score.  If there is a winner, then there is only one on the list.
 * If it is tied, there could be up to the number of players on the list
 * 
 ******************************************************************************/
SimpleWarGame.prototype.ScoreBattle = function() {
   var topPlayers = [];
   var topScore = 0;
   var cntr;

   for (cntr = 0; cntr < this.atBattle.length; cntr++) {
      var score = this.players[this.atBattle[cntr]].GetScore();

      if (score > topScore) {
         topPlayers = [];
         topPlayers.push(this.atBattle[cntr]);
         topScore = score;
      } else if (score == topScore) {
         // There's a tie situation here!
         topPlayers.push(this.atBattle[cntr]);
      }
   }

   if (topPlayers.length == 1) {
      log.info("SWGame : Battle Winner: %s", this.players[topPlayers[0]].name);

      if (this.atWar) {
         this.Notify(this.players[topPlayers[0]].alias + ' Wins the War!');
      } else {
         this.Notify(this.players[topPlayers[0]].alias + ' Wins the Battle!');
      }
   } else {
      this.Notify("Going to War!");
      log.info("SWGame : Tie between:");

      for (cntr = 0; cntr < topPlayers.length; cntr++) {
         log.info("SWGame :   - %s", this.players[topPlayers[cntr]].name);
      }
   }

   return topPlayers;
};

/*******************************************************************************
 * 
 * Simplewar.prototype.DetermineBattleResult
 * 
 * This method determines whether the battle has been won or if the game needs
 * to go to war.
 * 
 ******************************************************************************/
SimpleWarGame.prototype.DetermineBattleResult = function(topPlayers) {
   var numPlayers = this.NumPlayers();
   var cntr;

   // Tell all players to discard
   for (cntr = 0; cntr < numPlayers; cntr++) {
      this.EventTransaction(this.players[cntr].id,
                            SWGC.SWP_TRANSACTION_DICARD,
                            undefined,
                            undefined,
                            [ "TOP:ALL" ]);
   }

   // If there is a tie, we need to go to War!
   if (topPlayers.length > 1) {
      log.info("SWGame : ************************* WAR!!! *************************");
      this.atWar = true;

      for (cntr = 0; cntr < numPlayers; cntr++) {
         var doWar = false;

         // If the current player index is in the list of winners, then signal
         // war
         if (topPlayers.indexOf(cntr) != -1) {
            doWar = true;
         }

         this.SendEvent(SWGC.SW_EVENT_DO_WAR, {
            ownerId : this.players[cntr].id,
            gotoWar : doWar
         });
      }
   } else {
      var winnerIndex = topPlayers.pop();
      this.atWar = false;

      for (cntr = 0; cntr < numPlayers; cntr++) {
         this.EventTransaction(this.players[winnerIndex].id,
                               SWGC.SWP_TRANSACTION_COLLECT,
                               this.players[cntr].id,
                               SWGC.SWP_TRANSACTION_GIVEUP,
                               [ "TOP:ALL" ]);
      }

      this.LogPlayerStatus();
      this.ResetBattleList();
   }
};

/*******************************************************************************
 * 
 * Simplewar.prototype.ResetBattleList
 * 
 * This method builds a list of all the players still in the game who are
 * eligible to do battle.
 * 
 ******************************************************************************/
SimpleWarGame.prototype.ResetBattleList = function() {
   this.atBattle = [];

   for (cntr = 0; cntr < this.NumPlayers(); cntr++) {
      if (this.players[cntr].IsInGame()) {
         this.atBattle.push(cntr);
      }
   }
};

/*******************************************************************************
 * 
 * Simplewar.prototype.AddUI
 * 
 * This method creates and adds the User Interface to the game
 * 
 ******************************************************************************/
SimpleWarGame.prototype.AddUI = function() {
   this.UI = new SimpleWarUI(this, "0030");
};

/*******************************************************************************
 * 
 * Simplewar.prototype.LogPlayerStatus
 * 
 * This method logs the status data from a player's structure
 * 
 ******************************************************************************/
SimpleWarGame.prototype.LogPlayerStatus = function(playerId) {
   var playerIds = [];

   if (playerId !== undefined) {
      playerId.push(playerId);
   } else {
      playerIds = this.GetPlayerIds();
   }

   for ( var cntr = 0; cntr < playerIds.length; cntr++) {
      log.info("SWGame :   - %s : %d %d %s",
               this.status[playerIds[cntr]].alias,
               this.status[playerIds[cntr]].stackSize,
               this.status[playerIds[cntr]].discardSize,
               this.status[playerIds[cntr]].battleStackTop);
   }
};

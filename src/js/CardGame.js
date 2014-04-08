var ActiveEntity = require("./ActiveEntity.js");
var CGEActiveEntity = require("./CGEActiveEntity.js");
var Card = require("./Card.js");
var transDef = require("./TransactionDefinition.js");
var CGE = require("./CardGameDefs.js");
var Events = require('events');
var CardGameStatus = require("./Status.js").CardGameStatus;

var TransactionDefinition = transDef.TransactionDefinition;
var AddTransactionDefinition = transDef.AddTransactionDefinition;
var TRANSACTION_TYPE_INBOUND = transDef.TRANSACTION_TYPE_INBOUND;
var TRANSACTION_TYPE_OUTBOUND = transDef.TRANSACTION_TYPE_OUTBOUND;

var CGE_DEALER = "Dealer";
var CGE_TABLE = "Table";

var log = require("./Logger.js");

// Outgoing Transactions
AddTransactionDefinition("CGE_DEAL", CGE_DEALER, TRANSACTION_TYPE_OUTBOUND, 1, 1, "TOP");

/*******************************************************************************
 * 
 * CardGame Class Constructor
 * 
 ******************************************************************************/
function CardGame(name) {
   this.id = undefined;
   this.name = 'CardGame:' + name;

   // Call the parent class constructor
   CGEActiveEntity.call(this, this.name);

   this.isHost = false;
   this.players = Array();
   this.gameName = '';
   this.currPlayerIndex = -1; // Index to current player
   this.currPlayer = undefined; // Reference to current player
   this.events = [];
   this.status = new CardGameStatus();

   // TODO: Bug: generic card games can't have card limits
   this.table = this.AddContainer(CGE_TABLE, undefined, 0, 52);
   this.dealer = this.AddContainer(CGE_DEALER, undefined, 0, 52);
}

CardGame.prototype = new CGEActiveEntity();
CardGame.prototype.constructor = CardGame;


/*******************************************************************************
 * Virtual Functions - Must be overridden by derived card game
 ******************************************************************************/
   
/*******************************************************************************
 * 
 * CardGame.prototype.AddPlayer
 * 
 ******************************************************************************/
CardGame.prototype.AddPlayer = function(id, name) {
   log.error('CGame  : Please override virtual function \'CardGame.AddPlayer()\'.');
};

/*******************************************************************************
 * 
 * CardGame.prototype.AddUI
 * 
 ******************************************************************************/
CardGame.prototype.AddUI = function() {
   log.error('CGame  : Please override virtual function "CardGame.AddUI()".');
};

/*******************************************************************************
 * 
 * CardGame.prototype.Deal
 * 
 ******************************************************************************/
CardGame.prototype.Deal = function() {
   log.info('CGame  : Please override virtual function \'CardGame.Deal()\'.');
};

/*******************************************************************************
 * Internal Methods
 ******************************************************************************/
 
/*******************************************************************************
 * 
 * CardGame.prototype.Init
 * 
 ******************************************************************************/
CardGame.prototype.Init = function(gameSpec, deckSpec) {
   log.info('CGame  : Initializing game of ' + gameSpec.name);
   log.info(gameSpec);

   this.gameName = gameSpec.server.name;
   this.id = gameSpec.server.id;

   // Setup game parameters
   if (gameSpec.server.isPrimary == 'true') {
      this.isHost = true;
   }

   log.info("CGame  : Adding players");
   this.AddPlayers(gameSpec.players);

   this.InitEvents();
   this.CreateDeck(deckSpec);
   this.AddUI();
};

/*******************************************************************************
 * 
 * CardGame.prototype.InitEvents
 * 
 ******************************************************************************/
CardGame.prototype.InitEvents = function() {
   var that = this;

   // TODO: Make events work
   this.emitter = new Events.EventEmitter();
   this.emitter.addListener("EventQueue", function() {
      that.ProcessEvents();
   });
};

/*******************************************************************************
 * 
 * CardGame.prototype.CreateDeck
 * 
 * This method goes through the deck specification JSON data and creates the
 * actual card objects represented by the data.
 * 
 ******************************************************************************/
CardGame.prototype.CreateDeck = function(deckSpec) {
   var suitCntr;
   var valueCntr;
   var qty;

   // Create the suited cards first
   for (suitCntr = 0; suitCntr < deckSpec.suited.suits.suit.length; suitCntr++) {
      for (valueCntr = 0; valueCntr < deckSpec.suited.values.value.length; valueCntr++) {
         for (qty = 0; qty < deckSpec.suited.values.value[valueCntr].quantity; qty++) {
            this.dealer.AddCard(this.CreateSuitedCard(
                  deckSpec.suited.suits.suit[suitCntr],
                  deckSpec.suited.values.value[valueCntr], qty));
         }
      }
   }

   // Now Create the non-suited cards
   for (valueCntr = 0; valueCntr < deckSpec.nonsuited.values.value.length; valueCntr++) {
      for (qty = 0; qty < deckSpec.nonsuited.values.value[valueCntr].quantity; qty++) {
         this.dealer.AddCard(this.CreateNonSuitedCard(
               deckSpec.nonsuited.values.value[valueCntr], qty));
      }
   }
};

/*******************************************************************************
 * 
 * CardGame.prototype.CreateSuitedCard
 * 
 * This method creates and returns a new Card object with the given suit, value,
 * and count
 * 
 ******************************************************************************/
CardGame.prototype.CreateSuitedCard = function(suit, value, count) {
   return new Card(suit.name,
		             suit.name + ' ' + value.name,
		             suit.shortname + value.shortname,
		             value.rank,
		             suit.color,
		             count);
};

/*******************************************************************************
 * 
 * CardGame.prototype.CreateNonSuitedCard
 * 
 * this method creates and returns a new Card object given the count
 * 
 ******************************************************************************/
CardGame.prototype.CreateNonSuitedCard = function(nonSuited, count) {
   return new Card(nonSuited.name,
                   nonSuited.name,
                   nonSuited.shortname,
                   nonSuited.rank,
                   nonSuited.color,
                   count);
};

/*******************************************************************************
 * 
 * CardGame.prototype.AddPlayers
 * 
 * This method goes through the Game JSON data that is passed in and creates
 * the players for this game.
 * 
 ******************************************************************************/
CardGame.prototype.AddPlayers = function(players) {
   for ( var cntr = 0; cntr < players.length; cntr++) {
      this.AddPlayer(players[cntr].id, players[cntr].alias, players[cntr].type);
   }
};

/*******************************************************************************
 * 
 * CardGame.prototype.AdvancePlayer
 * 
 * This method advances the current player index and the reference to the
 * current player.
 * 
 ******************************************************************************/
CardGame.prototype.AdvancePlayer = function() {
   if (++this.currPlayerIndex > this.NumPlayers()) {
      this.currPlayerIndex = 0;
   }

   this.currPlayer = this.players[this.currPlayerIndex];
};

/*******************************************************************************
 * 
 * CardGame.prototype.StartGame
 * 
 ******************************************************************************/
CardGame.prototype.StartGame = function() {
   // First, Start all the players
   for ( var cntr = 0; cntr < this.players.length; cntr++) {
      this.players[cntr].Start();
   }

   this.UI.Start();

   // Now, start the game
   this.Start();
};

/*******************************************************************************
 * 
 * CardGame.prototype.GetEntityById
 * 
 * This method searches the game and the players for the given id and returns
 * a reference to the object.  If none is found, it returns undefined.
 * 
 ******************************************************************************/
CardGame.prototype.GetEntityById = function(id) {
   var cntr = 0;
   var entity = undefined;

   if (this.id == id) {
      entity = this;
   } else {
      while (cntr < this.players.length) {
         if (this.players[cntr].id == id) {
            entity = this.players[cntr];
            break;
         }

         cntr++;
      }
   }

   return entity;
};

/*******************************************************************************
 * 
 * CardGame.prototype.GetContainerById
 * 
 * This method searches the Containers of the game for the container with the
 * specified id and returns a reference to that object.  If none is found, then 
 * it returns undefined.
 * 
 ******************************************************************************/
CardGame.prototype.GetContainerById = function(id) {
   var cntr;
   var returnVal = undefined;

   // Check to see if the dealer has this container
   returnVal = this.rootContainer.GetContainerById(id);

   // Otherwise, check all the players
   if (returnVal == undefined) {
      cntr = 0;

      do {
         returnVal = this.players[cntr].GetContainerById(id);
      } while ((cntr < this.players.length) && (returnVal == undefined))
   }

   return returnVal;
};

/*******************************************************************************
 * 
 * CardGame.prototype.AllPlayersHandleEvent
 * 
 * This method sends the given eventId with the specified data to all of the
 * player objects in the game.
 * 
 ******************************************************************************/
CardGame.prototype.AllPlayersHandleEvent = function(eventId, data) {
   for ( var cntr = 0; cntr < this.players.length; cntr++) {
      this.players[cntr].HandleEvent(eventId, data);
   }
};

/*******************************************************************************
 * 
 * CardGame.prototype.ProcessEvents
 * 
 * This internal method is called when the Javascript event is received.  It
 * pulls a game event from the event queue and sends it to the appropriate
 * places.
 * 
 ******************************************************************************/
CardGame.prototype.ProcessEvents = function() {
   var event;

   event = this.events.shift();

   if (event != undefined) {
      if (event.eventId == CGE.CGE_EVENT_DO_TRANSACTION) {
         this.ProcessEventTransaction(event.data.destId,
                                      event.data.destTransName,
                                      event.data.srcId,
                                      event.data.srcTransName,
                                      event.data.cardList);
      } else {
         this.DispatchEvent(event.eventId, event.data);
      }
   }
};

/*******************************************************************************
 * 
 * CardGame.prototype.DispatchEvent
 * 
 * This method sends the specified event to the owner of the event (if specified)
 * or to all players.  Then it sends it to the game engine, and finally the UI.
 * 
 * Note:  The following events are sent to the UI only:
 *           - CGE_EVENT_STATUS_UPDATE
 *           - CGE_EVENT_NOTIFY
 * 
 ******************************************************************************/
CardGame.prototype.DispatchEvent = function(eventId, data) {
   if (    (eventId != CGE.CGE_EVENT_STATUS_UPDATE)
        && (eventId != CGE.CGE_EVENT_NOTIFY)) {
      if ((data != undefined) && (data.ownerId != undefined)) {
         var entity = this.GetEntityById(data.ownerId);
         entity.HandleEvent(eventId, data);
      } else {
         this.AllPlayersHandleEvent(eventId, data);
      }

      // Send all events to the game engine
      this.HandleEvent(eventId, data);
   }

   // Send all events to the UI
   this.UI.HandleEvent(eventId, data);
};

/*******************************************************************************
 * 
 * CardGame.prototype.ProcessEventTransaction
 * 
 * This method processes the Transaction event received via the EventTransaction
 * method.
 * 
 ******************************************************************************/
CardGame.prototype.ProcessEventTransaction = function(destId, destTransName,
      srcId, srcTransName, cardList) {
   var destEntity = this.GetEntityById(destId);
   var success = false;

   // log.info( "CGame : Process Transaction Event" );
   if (destEntity != undefined) {
      if (srcId != undefined) {
         var srcEntity = this.GetEntityById(srcId);

         if (srcEntity != undefined) {
            var cardArray = Array();

            if (srcEntity.ExecuteTransaction(srcTransName, cardList, cardArray)) {
               this.SendEvent(CGE.CGE_EVENT_TRANSACTION, {
                  ownerId : srcId,
                  transaction : srcTransName
               });
               success = destEntity.ExecuteTransaction(destTransName, cardList,
                     cardArray);

               if (success) {
                  this.SendEvent(CGE.CGE_EVENT_TRANSACTION, {
                     ownerId : destId,
                     transaction : destTransName
                  });
               }
            } else {
               log.error("CGame  : EventTransaction: src transaction failed");
            }
         } else {
            log.error("CGame  : EventTransaction: srcId Not found!");
         }
      } else {
         success = destEntity.ExecuteTransaction(destTransName, cardList,
               undefined);

         if (success) {
            this.SendEvent(CGE.CGE_EVENT_TRANSACTION, {
               ownerId : destId,
               transaction : destTransName
            });
         }
      }
   }

   return success;
};

/*******************************************************************************
 * Interface Methods
 ******************************************************************************/
 
/*******************************************************************************
 * 
 * CardGame.prototype.SendEvent
 * 
 * This method sends an event with the given id and data to the game engine.
 * The event is placed in a queue, and a Javascript event is signaled.
 * 
 ******************************************************************************/
CardGame.prototype.SendEvent = function(inEventId, inData) {
   var event = {
      eventId : inEventId,
      data : inData
   };

   this.events.push(event);
   this.emitter.emit("EventQueue");
};

/*******************************************************************************
 * 
 * CardGame.prototype.EventTransaction
 * 
 * This method builds and sends an event which signals the CardGame to perform
 * the specified transaction.
 * 
 * Parmaeters:
 *    inDestId - The id of the destination entity (game or player), where the
 *               cards will end up.
 *    inDestTransName - The name of the transaction to perform on the
 *                      destination entity.
 * 
 * Optional Parameters:
 *    inSrcId - The id of the source entity (game or player), where the cards
 *              will originiate.  If left blank, it indicates the transaction
 *              is internal to the destination entity only.
 *    inSrcTransName - The name of the transaction to perform on the source
 *                     entity.
 *    inCardList - A list of cards to perform in the transaction.  This is an
 *                 array of short card names (i.e. "D4" for Four of Diamonds).
 *                 
 *                 Special Values:
 *                 "TOP:x" - Indicates take the cards from the Top, where x is
 *                           the number of cards, or "ALL"
 *                 "BOTTOM:x" - Indicates take the cards from the bottom, where
 *                              x is the number of cards, or "ALL"
 * 
 ******************************************************************************/
CardGame.prototype.EventTransaction = function(inDestId,
                                               inDestTransName,
                                               inSrcId,
                                               inSrcTransName,
                                               inCardList) {
   var event = {
      destId : inDestId,
      destTransName : inDestTransName,
      srcId : inSrcId,
      srcTransName : inSrcTransName,
      cardList : inCardList
   };

   this.SendEvent(CGE.CGE_EVENT_DO_TRANSACTION, event);
};

/*******************************************************************************
 * 
 * CardGame.prototype.Notify
 * 
 * This method sends a Notify Event with the given message
 * Note: This event is only sent to the UI.
 * 
 ******************************************************************************/
CardGame.prototype.Notify = function(message) {
   log.info("Notify : %s", message);
   this.SendEvent(CGE.CGE_EVENT_NOTIFY, {
      msg : message
   });
};

/*******************************************************************************
 * 
 * CardGame.prototype.NumPlayers
 * 
 * this method returns the number of players in the game.
 * 
 ******************************************************************************/
CardGame.prototype.NumPlayers = function() {
   return this.players.length;
};

/*******************************************************************************
 * 
 * CardGame.prototype.GetPlayerIds
 * 
 * This method returns a list of the ids of all the players in the game
 * 
 ******************************************************************************/
CardGame.prototype.GetPlayerIds = function() {
   var ids = [];

   for ( var cntr = 0; cntr < this.NumPlayers(); cntr++) {
      ids.push(this.players[cntr].id);
   }

   return ids;
};

/*******************************************************************************
 * 
 * CardGame.prototype.UpdatePlayerStatus
 * 
 * This method adds the specified player status to the hash of statuses.
 * 
 ******************************************************************************/
CardGame.prototype.UpdatePlayerStatus = function(playerId, status) {
   this.status[playerId] = status;

   this.SendEvent(CGE.CGE_EVENT_STATUS_UPDATE, {
      ownerId : playerId
   });
};

/*******************************************************************************
 * 
 * CardGame.prototype.GetPlayerStatus
 * 
 * This method returns the status structure of the requested player
 * 
 ******************************************************************************/
CardGame.prototype.GetPlayerStatus = function(playerId) {
   return this.status[playerId];
};

module.exports = CardGame;

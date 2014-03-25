(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){


/******************************************************************************
 *  NodeJS stuff
 ******************************************************************************/
var State   = require( "./State.js" );
var log     = require("./Logger.js");

var TOP_STATE  = "TOP";


/******************************************************************************
 *  CLASS: ActiveEntity
 ******************************************************************************/

/******************************************************************************
 *
 * Class: ActiveEntity
 * Constructor
 *
 ******************************************************************************/
function ActiveEntity( name )
{
   this.name         = name;
   this.initial      = undefined;
   this.currentState = undefined;
   this.topState     = new State( this, this.name );
}


/******************************************************************************
 *
 * ActiveEntity.prototype.AddState
 * 
 * This method creates a state, and adds it to the parent state.  If the parent
 * state is not defined, then the state is added to the topState.
 *
 ******************************************************************************/
ActiveEntity.prototype.AddState = function( name, parentName )
{
   var   parent = undefined;


   if( parentName != undefined )
   {
      parent = this.topState.FindState( parentName, true );
   }

   // If we didn't find the state name, or it's undefined, then set the topState
   // as the parent of the new state.
   if( parent == undefined )
   {
      parent = this.topState;
   }

   // For now, assume they are valid
   var state = new State( this, name, parent );
   parent.AddState( state );

   return( state );
};


ActiveEntity.prototype.AddEventHandler = function( stateName, eventId, routine )
{
   var   state = this.topState.FindState( stateName, true );

   if( state != undefined )
   {
      log.debug( "Adding event handler for event %d to state %s", eventId, state.name );
      state.AddEventHandler( eventId, routine );
   }
};


ActiveEntity.prototype.SetEnterRoutine = function( stateName, routine )
{
   var   state = this.topState.FindState( stateName, true );

   if( state != undefined )
   {
      state.SetEnterRoutine( routine );
   }
};


ActiveEntity.prototype.SetExitRoutine = function( stateName, routine )
{
   var   state = this.topState.FindState( stateName, true );

   if( state != undefined )
   {
      state.SetExitRoutine( routine );
   }
};


/******************************************************************************
 *
 * ActiveEntity.prototype.SetInitialState
 * 
 * This method sets the initial state of the Active Entity (i.e. the initial
 * substate of the topState)
 *
 ******************************************************************************/
ActiveEntity.prototype.SetInitialState = function( initialStateName, parentName )
{
   var state;


   if( parentName != undefined )
   {
      state = this.topState.FindState( parentName, true );
   }
   else
   {
      state = this.topState;
   }

   state.SetInitialState( initialStateName );
};


/******************************************************************************
 *
 * ActiveEntity.prototype.Start
 * 
 * This method starts the state machine.  i.e. It performs the initial
 * transition to the topState.  Note: If the topState does not have an initial
 * substate defined, then the state machine is never really started.
 *
 ******************************************************************************/
ActiveEntity.prototype.Start = function()
{
   log.debug( "Start: transition to %s", this.name );
   this.currentState = this.topState;
   this.Transition( this.name );
};


/******************************************************************************
 *
 * ActiveEntity.prototype.HandleEvent
 *
 ******************************************************************************/
ActiveEntity.prototype.HandleEvent = function( eventId, data )
{
   if( this.currentState != undefined )
   {
      this.currentState.HandleEvent( eventId, data );
   }
};


/******************************************************************************
 *
 * ActiveEntity.prototype.Transition
 * 
 * This method performs a recursive transition from the current state to the
 * specified destination state.  
 *
 ******************************************************************************/
ActiveEntity.prototype.Transition = function( destStateName )
{
   var destAncestors = Array();
   var srcAncestors  = Array();
   var found         = undefined;
   var lcAncestor    = this.name;   // The Lowest Common Ancestor
   var destState     = this.topState.FindState( destStateName, true );


   log.debug( "Transition: %s -> %s; ", this.currentState.name, destStateName );

   if( destState != undefined )
   {
      // If we are coming from outside the destination state, then we need to
      // change the destination state to the initial substate.
      while( ( !destState.inState ) && ( destState.initial != undefined ) )
      {
         destState = destState.initial;
      }

      // First, get the ancestors of the source and destination states. 
      destState.GetAncestors( destAncestors );
      this.currentState.GetAncestors( srcAncestors );
      
      log.debug( destAncestors );
      log.debug( srcAncestors );

      // Now, iterate from the bottom of the source ancestor list to find the 
      // Lowest common denominator of both states.
      // The first one popped off the list should be current state.
      found = -1;
      while( ( found == -1 ) && srcAncestors.length )
      {
         lcAncestor = srcAncestors.pop();
         found = destAncestors.indexOf( lcAncestor );
      }

      log.debug( "Common Ancestor: %s", lcAncestor );

      // Did we find a common ancestor?
      if( found != -1  )
      {
         // Exit the current state, all the way up to the common ancestor
         this.currentState.ExitState( lcAncestor );

         // TODO: If/when we add transition actions, we need to perform it
         //       between states

         // Update our current state variable
         this.currentState = destState;

         // Now, Enter the destination state, all the way from the common ancestor
         destState.EnterState( lcAncestor );
      }
      else
      {
         // We should never get here because every state should have the
         // topState as it's ancestor
         log.error( "Could not find common ancestor state" );
      }
   }
   else
   {
      log.error( "Transition to undefined state in ActiveEntity: %s", this.name );
   }
};

module.exports = ActiveEntity;

},{"./Logger.js":8,"./State.js":10}],2:[function(require,module,exports){

module.exports = CGEActiveEntity;

var CGEState      = require( "./CGEState.js" );
var ActiveEntity  = require( "./ActiveEntity.js" );
var CardContainer = require( "./CardContainer.js" );
var TransDef = require( "./TransactionDefinition.js" );

var TransactionDefinition = TransDef.TransactionDefinition;
var AddTransactionDefinition = TransDef.AddTransactionDefinition;
var GetTransactionDefinition = TransDef.GetTransactionDefinition;
var TRANSACTION_TYPE_INBOUND = TransDef.TRANSACTION_TYPE_INBOUND;
var TRANSACTION_TYPE_OUTBOUND = TransDef.TRANSACTION_TYPE_OUTBOUND;

// TODO: Yeah, this doesn't belong here.
var SWGC     = require( "./games/SimpleWar/SimpleWarDefs.js" );


/******************************************************************************
 *  CLASS: CGEActiveEntity
 ******************************************************************************/

/******************************************************************************
 *
 * Class: CGEActiveEntity
 * Constructor
 *
 ******************************************************************************/
function CGEActiveEntity( owner, name, parent )
{
   ActiveEntity.call( this, owner, name, parent );

   this.rootContainer   = new CardContainer( name );
};


//Inherit from ActiveEntity
CGEActiveEntity.prototype = new ActiveEntity();
//Correct the constructor pointer
CGEActiveEntity.prototype.constructor = CGEActiveEntity;


CGEActiveEntity.prototype.AddContainer = function( name, parent, minCards, maxCards )
{
   var parentContainer;
   var container = new CardContainer( name, minCards, maxCards );


   if( parent != undefined )
   {
      parentContainer = this.rootContainer.GetContainerById( parent );
   }
   else
   {
      parentContainer = this.rootContainer;
   }

   parentContainer.AddContainer( container );

   return container;
};


CGEActiveEntity.prototype.AddState = function( name, parentName )
{
   var   parent = undefined;


   if( parentName != undefined )
   {
      parent = this.topState.FindState( parentName, true );
   }

   // If we didn't find the state name, or it's undefined, then set the topState
   // as the parent of the new state.
   if( parent == undefined )
   {
      parent = this.topState;
   }

   // For now, assume they are valid
   var state = new CGEState( this, name, parent );
   parent.AddState( state );

   return( state );
};


CGEActiveEntity.prototype.AddValidTransaction = function( stateName, transDefName )
{
   var state = undefined;


   if( stateName != undefined )
   {
      state = this.topState.FindState( stateName, true );
   }

   if( state != undefined )
   {
      state.AddValidTransaction( transDefName );
   }
};


CGEActiveEntity.prototype.IsTransactionValid = function( transDefName )
{
   var isValid = false;
   
   if( this.currentState != undefined )
   {
      isValid = this.currentState.IsTransactionValid( transDefName );
   }
   
   return isValid;
};


CGEActiveEntity.prototype.ExecuteTransaction = function( transName, cardList, cards )
{
   var success = false;


   if( this.IsTransactionValid( transName ) )
   {
      var transDef = GetTransactionDefinition( transName );
 
      if( transDef != undefined )
      {
         if( transDef.fromContainerName == TRANSACTION_TYPE_INBOUND )
         {
            var toContainer = this.rootContainer.GetContainerById( transDef.toContainerName );
            
            if( toContainer != undefined )
            {
               toContainer.AddGroup( cards, transDef.location );
               success = true;
            }
         }
         else if( transDef.toContainerName == TRANSACTION_TYPE_OUTBOUND )
         {
            var fromContainer = this.rootContainer.GetContainerById( transDef.fromContainerName );
            
            if( fromContainer != undefined )
            {
               fromContainer.GetGroup( cards, cardList );
               success = true;
            }
         }
         else
         {
            var toContainer = this.rootContainer.GetContainerById( transDef.toContainerName );
            var fromContainer = this.rootContainer.GetContainerById( transDef.fromContainerName );
            var cardArray = Array();
           
            if( ( toContainer != undefined ) && ( fromContainer != undefined ) )
            {
               fromContainer.GetGroup( cardArray, cardList );
               toContainer.AddGroup( cardArray, transDef.location );
               success = true;
            }
         }
      }
   }

   return success;
};


},{"./ActiveEntity.js":1,"./CGEState.js":3,"./CardContainer.js":5,"./TransactionDefinition.js":11,"./games/SimpleWar/SimpleWarDefs.js":12}],3:[function(require,module,exports){

module.exports = CGEState;

var State = require( "./State.js" );

/******************************************************************************
 *  CLASS: CGEState
 ******************************************************************************/

/******************************************************************************
 *
 * Class: CGEState
 * Constructor
 *
 ******************************************************************************/
function CGEState( owner, name, parent )
{
   State.call( this, owner, name, parent );

   // Array of definition names that are valid for this state
   this.validTransactions = Array();
};


//Inherit from State
CGEState.prototype = new State();
//Correct the constructor pointer
CGEState.prototype.constructor = CGEState;


CGEState.prototype.AddValidTransaction = function( transDefName )
{
   this.validTransactions.push( transDefName );
};


CGEState.prototype.IsTransactionValid = function( transDefName )
{
   var isValid = false;

   if( this.validTransactions.indexOf( transDefName ) != -1 )
   {
      isValid = true;
   }
   else if( ( this.parent != undefined ) && ( this.parent.IsTransactionValid != undefined ) )
   {
      isValid = this.parent.IsTransactionValid( transDefName );
   }

   return isValid;
};

},{"./State.js":10}],4:[function(require,module,exports){
var log = require('./Logger.js');

/******************************************************************************
 *
 * Card Class
 * Constructor
 *
 ******************************************************************************/
function Card( suit, name, shortName, rank, color, count )
{
   this.id        = shortName + '-' + rank + '-' + count;
   this.suit      = suit;
   this.name      = name;
   this.shortName = shortName;
   this.rank      = rank;
   this.color     = color;
}


/******************************************************************************
 *
 * Card.prototype.Print
 *
 ******************************************************************************/
Card.prototype.Print = function()
{
   log.info( "CGCard :    " + this.id + ' : ' + this.shortName + ' : ' + this.name );
};

module.exports = Card;

},{"./Logger.js":8}],5:[function(require,module,exports){

var Card = require( "./Card.js" );
var CardGroup = require( "./CardGroup.js" );

/*******************************************************************************
 * 
 * CardContainer Class Constructor
 * 
 ******************************************************************************/
function CardContainer( id, minCards, maxCards )
{
   this.id = id;
   this.containers = Array();
   this.minCards = 0;
   this.maxCards = 0;

   CardGroup.call(this);
}

// Inherit from CardContainer
CardContainer.prototype = new CardGroup();
// Correct the constructor pointer
CardContainer.prototype.constructor = CardContainer;


/*******************************************************************************
 * 
 * CardContainer.prototype.AddGroup
 * 
 ******************************************************************************/
CardContainer.prototype.AddGroup = function( group, location )
{
   if (this.AcceptGroup( group ) == true)
   {
      var index;

      if( location == "TOP" )
      {
         index = 0;
      }
      else
      {
         index = -1;
      }

		while( group.length )
	   {
         this.cards.splice( this.cards.length, 0, group.shift() );
	   }
   }
};


/*******************************************************************************
 * 
 * CardContainer.prototype.AddContainer
 * 
 ******************************************************************************/
CardContainer.prototype.AddContainer = function( container )
{
   this.containers.push(container);
};

/*******************************************************************************
 * 
 * CardContainer.prototype.CanGetGroup
 * 
 ******************************************************************************/
CardContainer.prototype.CanGetGroup = function( cardList )
{
   // ADT TODO: Finish this method
   // Verify cardList is an array first...
   if (Object.prototype.toString.call(cardList) === '[object Array]')
   {

   }

   return true;
};


/*******************************************************************************
 * 
 * CardContainer.prototype.GetGroup
 * 
 ******************************************************************************/
CardContainer.prototype.GetGroup = function( cardArray, cardList )
{
   if( this.CanGetGroup( cardList ) == true )
   {
      for( var cntr = 0; cntr < cardList.length; cntr++ )
      {
         var numCards = 0;
         var action = cardList[cntr].split( ':', 2 );
 
         if( ( action[0] == "TOP" ) || ( action[0] == "BOTTOM" ) )
         {
            if( action[1] == "ALL" )
            {
               numCards = this.cards.length;
            }
            else
            {
               numCards = parseInt( action[1], 10 );
               
               if( isNaN( numCards ) )
               {
                  numCards = 0;
               }
               
               if( numCards > this.cards.length )
               {
                  log.warn( "CGCntnr: '%s' Out of Cards", this.id );
                  numCards = this.cards.length;
               }
            }

            while( numCards-- )
            {
               cardArray.push( this.GetCard( action[0] ) );
            }
         }
      }
   }
};


/*******************************************************************************
 * 
 * CardContainer.prototype.AcceptGroup
 * 
 ******************************************************************************/
CardContainer.prototype.AcceptGroup = function( group )
{
   return true;
};


/*******************************************************************************
 * 
 * CardContainer.prototype.GetContainerById
 * 
 ******************************************************************************/
CardContainer.prototype.GetContainerById = function( id )
{
   var cntr;
   var returnVal = undefined;


   if (id == this.id)
   {
      returnVal = this;
   }
   else
   {
      cntr = 0;

      for( cntr = 0; cntr < this.containers.length; cntr++ )
      {
         returnVal = this.containers[cntr].GetContainerById(id);
         
         if( returnVal != undefined )
         {
            break;
         }
      }
   }

   return returnVal;
};


/*******************************************************************************
 * 
 * CardContainer.prototype.IsEmpty
 * 
 ******************************************************************************/
CardContainer.prototype.IsEmpty = function()
{
   var isEmpty = true;

   // First check if we are empty.
   if (this.cards.length == 0)
   {
      // If we are empty, then check our children containers
      for (var cntr = 0; cntr < this.containers.length; cntr++)
      {
         if (!this.containers[cntr].IsEmpty())
         {
            isEmpty = false;
            break;
         }
      }
   }
   else
   {
      isEmpty = false;
   }

   return isEmpty;
};


/*******************************************************************************
 * 
 * CardContainer.prototype.IsFull
 * 
 ******************************************************************************/
CardContainer.prototype.IsFull = function( id )
{
   if (this.cards.length >= this.maxCards)
   {
      return true;
   }
   else
   {
      return false;
   }
};

module.exports = CardContainer;

},{"./Card.js":4,"./CardGroup.js":7}],6:[function(require,module,exports){

var ActiveEntity = require( "./ActiveEntity.js" );
var CGEActiveEntity = require( "./CGEActiveEntity.js" );
var Card = require( "./Card.js" );
var transDef = require( "./TransactionDefinition.js" );
var SWGC     = require( "./games/SimpleWar/SimpleWarDefs.js" );
var Events = require('events');

var TransactionDefinition = transDef.TransactionDefinition;
var AddTransactionDefinition = transDef.AddTransactionDefinition;
var TRANSACTION_TYPE_INBOUND = transDef.TRANSACTION_TYPE_INBOUND;
var TRANSACTION_TYPE_OUTBOUND = transDef.TRANSACTION_TYPE_OUTBOUND;

var CGE_DEALER = "Dealer";
var CGE_TABLE = "Table";

var log = require("./Logger.js");

//Outgoing Transactions
AddTransactionDefinition( "CGE_DEAL", CGE_DEALER,    TRANSACTION_TYPE_OUTBOUND,  1, 1, "TOP" );


/******************************************************************************
 *
 * CardGame Class
 * Constructor
 *
 ******************************************************************************/
function CardGame( name )
{
   this.id              = undefined;
   this.name            = 'CardGame:'+ name;

   // Call the parent class constructor
   CGEActiveEntity.call( this, this.name );

   this.isHost          = false;
   this.players         = Array();
   this.gameName        = '';
   this.currPlayerIndex = -1;             // Index to current player
   this.currPlayer      = undefined;      // Reference to current player
   this.events            = [];
   
   // TODO: Bug: generic card games can't have card limits
   this.table = this.AddContainer( CGE_TABLE,   undefined, 0, 52 );
   this.dealer = this.AddContainer( CGE_DEALER,  undefined, 0, 52 );
}

//Inherit from CGEActiveEntity
CardGame.prototype = new CGEActiveEntity();
//Correct the constructor pointer
CardGame.prototype.constructor = CardGame;


/******************************************************************************
 *
 * CardGame.prototype.Init
 *
 ******************************************************************************/
CardGame.prototype.Init = function( gameSpec, deckSpec )
{
   log.info( 'CGame  : Initializing game of ' + gameSpec.name );
   log.info( gameSpec );

   this.gameName = gameSpec.server.name;
   this.id       = gameSpec.server.id;

   // Setup game parameters
   if( gameSpec.server.isPrimary == 'true' )
   {
      this.isHost = true;
   }

   log.info( "CGame  : Adding players" );
   this.AddPlayers( gameSpec.players );
   
   this.InitEvents();

   this.CreateDeck( deckSpec );

   this.AddUI();
};


/******************************************************************************
 *
 * CardGame.prototype.AddPlayers
 *
 ******************************************************************************/
CardGame.prototype.AddPlayers = function( players )
{
   for( var cntr = 0; cntr < players.length; cntr++ )
   {
      this.AddPlayer( players[cntr].id, players[cntr].alias, players[cntr].type );
   }
};


CardGame.prototype.NumPlayers = function()
{
   return this.players.length;
};


CardGame.prototype.AdvancePlayer = function()
{
   if( ++this.currPlayerIndex > this.NumPlayers() )
   {
      this.currPlayerIndex = 0;
   };
   
   this.currPlayer = this.players[this.currPlayerIndex];
};


CardGame.prototype.InitEvents = function()
{
   var that = this;
 
   // TODO: Make events work
   this.emitter = new Events.EventEmitter();
   this.emitter.addListener( "EventQueue", function() {
      that.ProcessEvents();
      } );
};



/******************************************************************************
 *
 * CardGame.prototype.StartGame
 *
 ******************************************************************************/
CardGame.prototype.StartGame = function()
{
   // First, Start all the players
   for( var cntr = 0; cntr < this.players.length; cntr++ )
   {
      this.players[cntr].Start();
   }

   this.UI.Start();

   // Now, start the game
   this.Start();
};


/******************************************************************************
 *
 * CardGame.prototype.CreateDeck
 *
 ******************************************************************************/
CardGame.prototype.CreateDeck = function( deckSpec )
{
   var suitCntr;
   var valueCntr;
   var qty;


   // Create the suited cards first
   for( suitCntr = 0; suitCntr < deckSpec.suited.suits.suit.length; suitCntr++ )
   {
      for( valueCntr = 0; valueCntr < deckSpec.suited.values.value.length; valueCntr++ )
      {
         for( qty = 0; qty < deckSpec.suited.values.value[valueCntr].quantity; qty++ )
         {
            this.dealer.AddCard( this.CreateSuitedCard( deckSpec.suited.suits.suit[suitCntr],
                                                        deckSpec.suited.values.value[valueCntr],
                                                        qty ) );
         }
      }
   }

   // Now Create the non-suited cards
   for( valueCntr = 0; valueCntr < deckSpec.nonsuited.values.value.length; valueCntr++ )
   {
      for( qty = 0; qty < deckSpec.nonsuited.values.value[valueCntr].quantity; qty++ )
      {
         this.dealer.AddCard( this.CreateNonSuitedCard( deckSpec.nonsuited.values.value[valueCntr],
                                                        qty ) );
      }
   }
};


/******************************************************************************
 *
 * CardGame.prototype.CreateSuitedCard
 * 
 ******************************************************************************/
CardGame.prototype.CreateSuitedCard = function( suit, value, count )
{
   return new Card( suit.name,
                    suit.name + ' '+ value.name,
                    suit.shortname + value.shortname,
                    value.rank,
                    suit.color,
                    count );
};


/******************************************************************************
 *
 * CardGame.prototype.CreateNonSuitedCard
 *
 ******************************************************************************/
CardGame.prototype.CreateNonSuitedCard = function( nonSuited, count )
{
   return new Card( nonSuited.name,
                    nonSuited.name,
                    nonSuited.shortname,
                    nonSuited.rank,
                    nonSuited.color,
                    count );
};


/******************************************************************************
 *
 * CardGame.prototype.AddPlayer
 *
 ******************************************************************************/
CardGame.prototype.AddPlayer = function( id, name )
{
   log.error( 'CGame  : Please override virtual function \'CardGame.AddPlayer()\'.' );
};

CardGame.prototype.AddUI = function()
{
   log.error( 'CGame  : Please override virtual function "CardGame.AddUI()".' );
};


CardGame.prototype.GetEntityById = function( id )
{
   var cntr = 0;
   var entity = undefined;


   if( this.id == id )
   {
      entity = this;
   }
   else
   {
      while( cntr < this.players.length )
      {
         if( this.players[cntr].id == id )
         {
            entity = this.players[cntr];
            break;
         }
         
         cntr++;
      }
   }
   
   return entity;
};


/******************************************************************************
 *
 * CardGame.prototype.Deal
 *
 ******************************************************************************/
CardGame.prototype.Deal = function()
{
   log.info( 'CGame  : Please override virtual function \'CardGame.Deal()\'.' );
};


/******************************************************************************
 *
 * CardGame.prototype.GetContainerById
 *
 ******************************************************************************/
CardGame.prototype.GetContainerById = function( id )
{
   var   cntr;
   var   returnVal = undefined;


   // Check to see if the dealer has this container
   returnVal = this.rootContainer.GetContainerById( id );

   // Otherwise, check all the players
   if( returnVal == undefined )
   {
      cntr = 0;

      do
      {
         returnVal = this.players[cntr].GetContainerById( id );
      }
      while( ( cntr < this.players.length ) && ( returnVal == undefined ) )
   }

   return returnVal;
};


CardGame.prototype.AllPlayersHandleEvent = function( eventId, data )
{
   for( var cntr = 0; cntr < this.players.length; cntr++ )
   {
      this.players[cntr].HandleEvent( eventId, data );
   }
};


CardGame.prototype.SendEvent = function( inEventId, inData )
{
   var event = { eventId: inEventId, data: inData };
 
   this.events.push( event );
 
   this.emitter.emit( "EventQueue" );
};


CardGame.prototype.ProcessEvents = function()
{
   var event;
   
   event = this.events.shift();
   
   if( event != undefined )
   {
      if( event.eventId == SWGC.CGE_EVENT_DO_TRANSACTION ) {
         this.ProcessEventTransaction( event.data.destId,
                                       event.data.destTransName,
                                       event.data.srcId,
                                       event.data.srcTransName,
                                       event.data.cardList );
      }
      else {
         this.DispatchEvent( event.eventId, event.data );
      }
   }
};


CardGame.prototype.DispatchEvent = function( eventId, data )
{
   if( ( eventId != SWGC.CGE_EVENT_STATUS_UPDATE ) &&
       ( eventId != SWGC.CGE_EVENT_NOTIFY ) )
   {
      if( ( data != undefined ) && ( data.ownerId != undefined ) )
      {
         var entity = this.GetEntityById( data.ownerId );
         entity.HandleEvent( eventId, data );
      }
      else
      {
         this.AllPlayersHandleEvent( eventId, data );
      }
   
      // Send all events to the game engine
      this.HandleEvent( eventId, data );
   }
 
   // Send all events to the UI
   this.UI.HandleEvent( eventId, data);
};


CardGame.prototype.ProcessEventTransaction = function( destId, destTransName, srcId, srcTransName, cardList )
{
   var   destEntity = this.GetEntityById( destId );
   var   success = false;


   //log.info( "CGame  : Process Transaction Event" );
   if( destEntity != undefined )
   {
      if( srcId != undefined )
      {
         var srcEntity = this.GetEntityById( srcId );
 
         if( srcEntity != undefined )
         {
            var   cardArray = Array();

            if( srcEntity.ExecuteTransaction( srcTransName, cardList, cardArray ) )
            {
               this.SendEvent( SWGC.CGE_EVENT_TRANSACTION, { ownerId : srcId, transaction: srcTransName } );
               success = destEntity.ExecuteTransaction( destTransName, cardList, cardArray );

               if( success )
               {
                  this.SendEvent( SWGC.CGE_EVENT_TRANSACTION, { ownerId : destId, transaction: destTransName } );
               }
            }
            else
            {
               log.error( "CGame  : EventTransaction: src transaction failed" );
            }
         }
         else
         {
            log.error( "CGame  : EventTransaction: srcId Not found!" );
         }
      }
      else
      {
         success = destEntity.ExecuteTransaction( destTransName, cardList, undefined );

         if( success )
         {
            this.SendEvent( SWGC.CGE_EVENT_TRANSACTION, { ownerId : destId, transaction: destTransName } );
         }
      }
   }

   return success;
};


CardGame.prototype.EventTransaction = function( inDestId, inDestTransName, inSrcId, inSrcTransName, inCardList )
{
   var event = { destId            : inDestId,
                 destTransName   : inDestTransName,
                 srcId            : inSrcId,
                 srcTransName      : inSrcTransName,
                 cardList         : inCardList
               };
 
   this.SendEvent( SWGC.CGE_EVENT_DO_TRANSACTION, event );
};


CardGame.prototype.Notify = function( message ) {
   log.info( "Notify : %s", message );
   this.SendEvent( SWGC.CGE_EVENT_NOTIFY, { msg: message } );
};


module.exports = CardGame;

},{"./ActiveEntity.js":1,"./CGEActiveEntity.js":2,"./Card.js":4,"./Logger.js":8,"./TransactionDefinition.js":11,"./games/SimpleWar/SimpleWarDefs.js":12,"events":20}],7:[function(require,module,exports){

var log = require('./Logger.js');

/******************************************************************************
 *
 * CardGroup Class
 * Constructor
 *
 ******************************************************************************/
function CardGroup()
{
   this.cards = Array();
}


/******************************************************************************
 *
 * CardGroup.prototype.AddCard
 *
 ******************************************************************************/
CardGroup.prototype.AddCard = function( card )
{
   this.cards.push( card );
};


CardGroup.prototype.Empty = function()
{
   this.cards = Array();
};


/******************************************************************************
 *
 * CardGroup.prototype.GetCard
 *
 ******************************************************************************/
CardGroup.prototype.GetCard = function( cardId )
{
   var card = undefined;

   if( cardId == "TOP" )
   {
      card = this.cards.shift();
   }
   else if( cardId == "BOTTOM" )
   {
      card = this.cards.pop();
   }

   return card;
};


/******************************************************************************
 *
 * CardGroup.prototype.NumCards
 *
 ******************************************************************************/
CardGroup.prototype.NumCards = function()
{
   return this.cards.length;
};


/******************************************************************************
 *
 * CardGroup.prototype.PrintCards
 *
 ******************************************************************************/
CardGroup.prototype.PrintCards = function()
{
   var i;
   
   log.info( "CGroup : ****************************************" );
   log.info( "CGroup :    '" + this.id + "' holds " + this.cards.length + ' cards ' );

   for( i = 0; i < this.cards.length; i++ )
   {
      this.cards[i].Print();
   }

   log.info( "CGroup : ****************************************" );
};


/******************************************************************************
 *
 * CardGroup.prototype.SortRank
 *
 ******************************************************************************/
CardGroup.prototype.SortRank = function( order )
{
   if( !defined( order ) )
   {
      order = 'ascending';
   }
   
   if( order.toLowerCase() == 'ascending' )
   {
      this.cards.sort( function(a, b){ return a.rank - b.rank; } );
   }
   else
   {
      this.cards.sort( function(a, b){ return b.rank - a.rank; } );
   }
};


/******************************************************************************
 *
 * CardGroup.prototype.SortSuit
 *
 ******************************************************************************/
CardGroup.prototype.SortSuit = function( order )
{
   if( !defined( order ) )
   {
      order = 'ascending';
   }
   
   if( order.toLowerCase() == 'ascending' )
   {
      this.cards.sort(  function(a, b)
                        {
                           if( a.suit < b.suit )
                              return -1;
                           else if( a.suit > b.suit )
                              return 1;
                           else
                              return 0;
                        }
                     );
   }
   else
   {
      this.cards.sort(  function(a, b)
                        {
                           if( b.suit < a.suit )
                              return -1;
                           else if( b.suit > a.suit )
                              return 1;
                           else
                              return 0;
                        }
                     );
   }
};


/******************************************************************************
 *
 * CardGroup.prototype.SortSuitRank
 *
 ******************************************************************************/
CardGroup.prototype.SortSuitRank = function( order )
{
   if( !defined( order ) )
   {
      order = 'ascending';
   }
   
   if( order.toLowerCase() == 'ascending' )
   {
      this.cards.sort(  function(a, b)
                        {
                           if( a.suit < b.suit )
                              return -1;
                           else if( a.suit > b.suit )
                              return 1;
                           else
                              return a.rank - b.rank;
                        }
                     );
   }
   else
   {
      this.cards.sort(  function(a, b)
                        {
                           if( b.suit < a.suit )
                              return -1;
                           else if( b.suit > a.suit )
                              return 1;
                           else
                              return b.rank - a.rank;
                        }
                     );
   }
};


/******************************************************************************
 *
 * CardGroup.prototype.Shuffle
 *
 ******************************************************************************/
CardGroup.prototype.Shuffle = function()
{
   var   numCards = this.cards.length;       // The number of cards in the group
   var   numIter  = numCards * 3;            // The number of iterations to move cards
   var   fromPos;                            // From position
   var   toPos;                              // To position


   while( numIter > 0 )
   {
      fromPos  = Math.floor( Math.random() * numCards );
      toPos    = Math.floor( Math.random() * numCards );
      
      // Move a card from the from position to the to position
      this.cards.splice( toPos, 0, this.cards.splice( fromPos, 1 )[0] );

      numIter--;
   }
};


module.exports = CardGroup;

},{"./Logger.js":8}],8:[function(require,module,exports){
log = { };

log.DEBUG   = 0x01;
log.INFO    = 0x02;
log.WARN    = 0x04;
log.ERROR   = 0x08;

log.mask = 0xFF;

log.debug = function (format) {
   var args = Array.prototype.slice.call(arguments, 0);
   args.unshift(log.DEBUG);

   if (log.mask & log.DEBUG) {
      log._out.apply(this, args);
   }
}

log.info = function (format) {
   var args = Array.prototype.slice.call(arguments, 0);
   args.unshift(log.INFO);

   if (log.mask & log.INFO) {
      log._out.apply(this, args);
   }
}

log.warn = function (format) {
   var args = Array.prototype.slice.call(arguments, 0);
   args.unshift(log.WARN);

   if (log.mask & log.WARN) {
      log._out.apply(this, args);
   }
}

log.error = function (format) {
   var args = Array.prototype.slice.call(arguments, 0);
   args.unshift(log.ERROR);

   if (log.mask & log.ERROR) {
      log._out.apply(this, args);
   }
}

log._out = function (level, format) {
   var i = -1;
   var args = Array.prototype.slice.call(arguments, 2);

   format = "" + format;

   var str = format.replace(/\%[sd]/g, function () {
      i++;  
      return args[i];
   });

   switch (level) {
      case log.DEBUG:
         console.log("DEBUG: " + str);
         break;

      case log.INFO:
         console.log(" INFO: " + str);
         break;

      case log.WARN:
         console.warn(" WARN: " + str);
         break;

      case log.ERROR:
         console.error("ERROR: " + str);
         break;
   }
};

module.exports = log;

},{}],9:[function(require,module,exports){
var CGEActiveEntity = require( "./CGEActiveEntity.js" );
var log = require("./Logger.js");

/******************************************************************************
 *
 * Player Class
 * Constructor
 *
 ******************************************************************************/
function Player( parent, id, alias )
{
   // Call the parent class constructor
   CGEActiveEntity.call( this, "Player:" + alias );

   log.info( "CGPlay : New Player: %s", alias );

   this.parentGame      = parent;
   this.id              = id;
   this.alias           = alias;
   this.score           = 0;
}

// Inherit from CGEActiveEntity
Player.prototype = new CGEActiveEntity();
// Correct the constructor pointer
Player.prototype.constructor = Player;


Player.prototype.GetScore = function()
{
   return this.score;
};

module.exports = Player;

},{"./CGEActiveEntity.js":2,"./Logger.js":8}],10:[function(require,module,exports){

/******************************************************************************
 *  NodeJS stuff
 ******************************************************************************/
var log = require('./Logger.js');

/******************************************************************************
 *  CLASS: State
 ******************************************************************************/

/******************************************************************************
 *
 * Class: State
 * Constructor
 *
 ******************************************************************************/
function State( owner, name, parent )
{
   this.name         = name;
   this.owner        = owner;
   this.parent       = parent;
   this.inState      = false;
   this.initial      = undefined;
   this.enter        = undefined;
   this.exit         = undefined;
   this.states       = Array();
   this.handlers     = {};

   // Logging/Debug
   var ancestorList = Array();
   this.GetAncestors(ancestorList);
   log.debug( "Created New State: %s", ancestorList.join(':') );
}


/******************************************************************************
 *
 * State.prototype.AddState
 *
 ******************************************************************************/
State.prototype.AddState = function( state )
{
   this.states.push( state );
};


/******************************************************************************
 *
 * State.prototype.AddEventHandler
 *
 ******************************************************************************/
State.prototype.AddEventHandler = function( eventId, routine )
{
   // TODO: Need to verify routine is a real function
   this.handlers[eventId] = routine;
};


/******************************************************************************
 *
 * State.prototype.SetInitialState
 *
 ******************************************************************************/
State.prototype.SetInitialState = function( stateName )
{
   var state = this.FindState( stateName, true );

   if( state != undefined )
   {
      log.debug( "State %s: Initial State set to %s", this.name, state.name );
      this.initial = state;
   }
};


/******************************************************************************
 *
 * State.prototype.SetEnterRoutine
 *
 ******************************************************************************/
State.prototype.SetEnterRoutine = function( routine )
{
   // TODO: Need to verify this is a valid routine
   this.enter = routine;
};


/******************************************************************************
 *
 * State.prototype.SetExitRoutine
 *
 ******************************************************************************/
State.prototype.SetExitRoutine = function( routine )
{
   // TODO: Need to verify this is a valid routine
   this.exit = routine;
};


/******************************************************************************
 *
 * State.prototype.EnterState
 * 
 * This method performs recursive entrance to this state, starting with the
 * common ancestor (the common ancestor is not entered).
 *
 ******************************************************************************/
State.prototype.EnterState = function( commonAncestor )
{
   // If we are the common ancestor, then our state doesn't get entered
   if( commonAncestor != this.name )
   {
      // First, enter our parent state
      if( this.parent != undefined )
      {
         this.parent.EnterState( commonAncestor );
      }

      this.inState = true;
      
      log.debug( "Enter State: %s", this.name );

      if( this.enter != undefined )
      {
         this.enter.call( this.owner );
      }
   }
};


/******************************************************************************
 *
 * State.prototype.ExitState
 * 
 * This method performs recursive exit from this state, all the way up to the
 * common ancestor (the common ancestor is not exited).
 *
 ******************************************************************************/
State.prototype.ExitState = function( commonAncestor )
{
   // If we are the common ancestor, then our state doesn't get exited.
   if( commonAncestor != this.name )
   {
      log.debug( "Exit State: %s", this.name );
      
      this.inState = false;

      if( this.exit != undefined )
      {
         this.exit.call( this.owner );
      }

      // Now, attempt to exit our parent state
      if( this.parent != undefined )
      {
         this.parent.ExitState( commonAncestor );
      }
   }
};


/******************************************************************************
 *
 * State.prototype.HandleEvent
 *
 ******************************************************************************/
State.prototype.HandleEvent = function( eventId, data )
{
   var   eventHandled = false;
   
  
   if( this.handlers.hasOwnProperty( eventId ) )
   {
      eventHandled = this.handlers[eventId].call( this.owner, eventId, data );
   }

   // We didn't handle the event, so pass it to our parent state
   if( ( eventHandled == false ) && ( this.parent != undefined ) )
   {
      this.parent.HandleEvent( eventId, data );
   }
};


/******************************************************************************
 *
 * State.prototype.GetAncestors
 * 
 * This method builds a top -> down list of ancestors to this state
 *
 ******************************************************************************/
State.prototype.GetAncestors = function( ancestorList )
{
   // TODO: Verify ancestorList is an array

   // First, get our parent state
   if( this.parent != undefined )
   {
      this.parent.GetAncestors( ancestorList );
   }

   // Finally, put our name on the list
   ancestorList.push( this.name );
};


/******************************************************************************
 *
 * State.prototype.FindState
 *
 ******************************************************************************/
State.prototype.FindState = function( name, goDeep )
{
   var stateFound = undefined;


   if( goDeep == undefined )
   {
      goDeep = false;
   }

   if( name == this.name )
   {
      stateFound = this;
   }
   else
   {
      for( var cntr = 0; cntr < this.states.length; cntr++ )
      {
         if( this.states[cntr].name == name )
         {
            stateFound = this.states[cntr];
            break;
         }
      }
      
      if( goDeep && ( stateFound == undefined ) )
      {
         cntr = 0;
         
         while( !stateFound && ( cntr < this.states.length ) )
         {
            stateFound = this.states[cntr].FindState( name, true );
            cntr++;
         }
      }
   }

   return( stateFound );
};

module.exports = State;

},{"./Logger.js":8}],11:[function(require,module,exports){

/******************************************************************************
 * Global array of Transaction Definitions
 ******************************************************************************/
//if( TransactionDefs == undefined )
//{
   var TransactionDefs = Array();

   function AddTransactionDefinition( name, from, to, minCards, maxCards, location )
   {
      if( GetTransactionDefinition( name ) == undefined )
      {
         TransactionDefs.push( new TransactionDefinition( name, from, to, minCards, maxCards, location ) );
      }
   }

   function GetTransactionDefinition( name )
   {
      var transDef = undefined;
      
      for( var cntr = 0; cntr < TransactionDefs.length; cntr++ )
      {
         if( TransactionDefs[cntr].name == name )
         {
            transDef = TransactionDefs[cntr];
            break;
         }
      }
      
      return transDef;
   }
//}

/******************************************************************************
 *  CLASS: TransactionDefinition
 ******************************************************************************/

var TRANSACTION_TYPE_INBOUND  = "InBound";
var TRANSACTION_TYPE_OUTBOUND = "Outbound";


/******************************************************************************
 *
 * Class: TransactionDefinition
 * Constructor
 *
 ******************************************************************************/
function TransactionDefinition( name, from, to, minCards, maxCards, location )
{
   this.name               = name;
   this.fromContainerName  = from;
   this.toContainerName    = to;
   this.minCards           = minCards;
   this.maxCards           = maxCards;
   this.location			   = location;
};



module.exports = {
 TransactionDefinition: TransactionDefinition,
 AddTransactionDefinition: AddTransactionDefinition,
 GetTransactionDefinition: GetTransactionDefinition,
 TRANSACTION_TYPE_INBOUND: TRANSACTION_TYPE_INBOUND,
 TRANSACTION_TYPE_OUTBOUND: TRANSACTION_TYPE_OUTBOUND
};

},{}],12:[function(require,module,exports){


var SWG_CONSTANTS = {

   /***************************************************************************
    * SimpleWarPlayer Transaction Definitions
    ***************************************************************************/
   SWP_TRANSACTION_DEAL    : "SWP_Deal",     // All inbound cards to Stack
   SWP_TRANSACTION_BATTLE  : "SWP_Battle",   // 1 card from Stack to Battle
   SWP_TRANSACTION_DICARD  : "SWP_Discard",  // 1 card from Battle to Discard
   SWP_TRANSACTION_FLOP    : "SWP_Flop",     // 3 cards from Stack to Discard
   SWP_TRANSACTION_COLLECT : "SWP_Collect",  // All inbound cards to Stack
   SWP_TRANSACTION_GIVEUP  : "SWP_GiveUp",   // All outbound cards from Discard 

   /***************************************************************************
    * SimpleWar Events
    ***************************************************************************/
   // TODO: This needs to go somewhere else
   CGE_EVENT_EXIT             :    0,
   CGE_EVENT_DO_TRANSACTION   :    1,
   CGE_EVENT_TRANSACTION      :    2,
   CGE_EVENT_DEAL             :   10,
   CGE_EVENT_SCORE            :   11,
   CGE_EVENT_NOTIFY           :  100,
   CGE_EVENT_STATUS_UPDATE    :  101,

   SW_EVENT_DO_BATTLE         : 1000,
   SW_EVENT_DO_WAR            : 1001
};

module.exports = SWG_CONSTANTS;

},{}],13:[function(require,module,exports){

module.exports = SimpleWarGame;
var SimpleWarPlayer = require( "./SimpleWarPlayer.js" );
var SimpleWarPlayerAI = require( "./SimpleWarPlayerAI.js" );
var CardGame = require( "../../CardGame.js" );
var transDef = require( "../../TransactionDefinition.js" );
var SWGC     = require( "./SimpleWarDefs.js" );
var GameStatus = require( "./SimpleWarStatus.js" ).SimpleWarStatus;
var SimpleWarUI = require( "./SimpleWarUI.js" );
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

   this.status			= new GameStatus();
   this.hasBattled   = [];
   this.atBattle     = [];
   this.atWar        = false;
 
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
   this.AddEventHandler( SIMPLE_WAR_STATE_IN_PROGRESS, SWGC.CGE_EVENT_DEAL, this.Deal );
   this.AddEventHandler( SIMPLE_WAR_STATE_SCORE, SWGC.CGE_EVENT_SCORE, this.EventScore );
   
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
      this.SendEvent( SWGC.CGE_EVENT_DEAL );
      //this.Deal();
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
   var that = this;
   var timeout = 1500;
   //var timeout = 15;

   setTimeout(function () {
      that.SendEvent( SWGC.CGE_EVENT_SCORE, undefined );
   }, timeout);
};


SimpleWarGame.prototype.EventScore = function()
{
   this.LogPlayerStatus();
   this.atBattle = this.ScoreBattle();
   this.DetermineBattleResult( this.atBattle );

   if( this.atBattle.length == 1 )
   {
      var alias = this.players[ this.atBattle[0] ].alias;
      this.Notify( alias + ' Wins the Game!' );
      this.Transition( SIMPLE_WAR_STATE_GAME_OVER );
      this.SendEvent( SWGC.CGE_EVENT_EXIT, undefined );
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
   var numCards = this.dealer.NumCards() - cardRemainder;
   
   while( numCards )
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
      
      numCards--;
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
      this.Notify( "Going to War!" );
      this.atWar = true;

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
      
      if( this.atWar ) {
         this.Notify( this.players[winnerIndex].alias + ' Wins the War!' );
      }
      else {
         this.Notify( this.players[winnerIndex].alias + ' Wins the Battle!' );
      }
 
      this.atWar = false;
 
      for( var cntr = 0; cntr < numPlayers; cntr++ )
      {
         this.EventTransaction( this.players[winnerIndex].id, SWGC.SWP_TRANSACTION_COLLECT,
                                   this.players[cntr].id,        SWGC.SWP_TRANSACTION_GIVEUP,
                                   ["TOP:ALL"] );
      }

      this.LogPlayerStatus();
      
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

SimpleWarGame.prototype.AddUI = function() {
   this.UI = new SimpleWarUI(this, "0030");
};

SimpleWarGame.prototype.UpdatePlayerStatus = function( id, status ) {
   this.status[id] = status;

   this.SendEvent( SWGC.CGE_EVENT_STATUS_UPDATE, { ownerId : id } );
};

SimpleWarGame.prototype.LogPlayerStatus = function( playerId ) {
   var	playerIds = [];
   
   if( playerId != undefined ) {
      playerId.push( playerId )
   }
   else {
      playerIds = this.GetPlayerIds();
   }
   
   for( var cntr = 0; cntr < playerIds.length; cntr++ )
   {
      log.info( "SWGame :   - %s : %d %d %s",
                this.status[ playerIds[cntr] ].alias,
                this.status[ playerIds[cntr] ].stackSize,
                this.status[ playerIds[cntr] ].discardSize,
                this.status[ playerIds[cntr] ].battleStackTop );
   }
};
      

SimpleWarGame.prototype.GetPlayerStatus = function( id ) {
   return this.status[id];
};


SimpleWarGame.prototype.GetPlayerIds = function() {
   var ids = [];
   
   for( var cntr = 0; cntr < this.NumPlayers(); cntr++ ) {
      ids.push( this.players[cntr].id );
   }

   return ids;
};

},{"../../CardGame.js":6,"../../Logger.js":8,"../../TransactionDefinition.js":11,"./SimpleWarDefs.js":12,"./SimpleWarPlayer.js":14,"./SimpleWarPlayerAI.js":15,"./SimpleWarStatus.js":16,"./SimpleWarUI.js":17}],14:[function(require,module,exports){
module.exports = SimpleWarPlayer;

var SWGC     = require( "./SimpleWarDefs.js" );
var Player   = require( "../../Player.js" );
var transDef = require( "../../TransactionDefinition.js" );
var PlayerStatus = require( "./SimpleWarStatus.js" ).SimpleWarPlayerStatus;
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
function SimpleWarPlayer( parent, id, alias ) {
   // Call the parent class constructor
   Player.call( this, parent, id, alias );

   this.inGame = true;
   this.status = new PlayerStatus;

   this.status.id = this.id;
   this.status.type = 'USER';
   this.status.alias = this.alias;

   // Create the State Machine
   this.AddState( SWP_STATE_IN_GAME,   undefined         );
   this.AddState( SWP_STATE_OUT,       undefined         );
   this.AddState( SWP_STATE_READY,     SWP_STATE_IN_GAME );
   this.AddState( SWP_STATE_BATTLE,    SWP_STATE_IN_GAME );
   this.AddState( SWP_STATE_WAIT,      SWP_STATE_IN_GAME );

   this.SetInitialState( SWP_STATE_READY );

   this.SetEnterRoutine( SWP_STATE_IN_GAME,   this.InGameEnter    );
   this.SetEnterRoutine( SWP_STATE_WAIT,      this.WaitEnter      );
   this.SetExitRoutine(  SWP_STATE_IN_GAME,   this.InProgressExit );

   this.AddEventHandler( SWP_STATE_IN_GAME,SWGC.CGE_EVENT_TRANSACTION, this.InGameTransaction );            // Catch-all to update status after a transaction
   this.AddEventHandler( SWP_STATE_READY,  SWGC.SW_EVENT_DO_BATTLE,    this.DoBattle );
   this.AddEventHandler( SWP_STATE_BATTLE, SWGC.CGE_EVENT_TRANSACTION, this.BattleTransaction );
   this.AddEventHandler( SWP_STATE_WAIT,   SWGC.CGE_EVENT_TRANSACTION, this.WaitTransaction );
   this.AddEventHandler( SWP_STATE_WAIT,   SWGC.SW_EVENT_DO_WAR,       this.DoWar );

   // TODO: Need definitions for Max cards in deck
   this.stack = this.AddContainer( "Stack",   undefined, 0, 52 );
   this.battle = this.AddContainer( "Battle",  undefined, 0,  1 );
   this.discard = this.AddContainer( "Discard", undefined, 0, 52 );

   // Add the valid transactions to the states
   this.AddValidTransaction( SWP_STATE_IN_GAME,   SWGC.SWP_TRANSACTION_DICARD  );
   this.AddValidTransaction( SWP_STATE_IN_GAME,   SWGC.SWP_TRANSACTION_COLLECT );
   this.AddValidTransaction( SWP_STATE_IN_GAME,   SWGC.SWP_TRANSACTION_GIVEUP  );
   this.AddValidTransaction( SWP_STATE_OUT,       SWGC.SWP_TRANSACTION_GIVEUP  );
   this.AddValidTransaction( SWP_STATE_READY,     SWGC.SWP_TRANSACTION_DEAL    );
   this.AddValidTransaction( SWP_STATE_BATTLE,    SWGC.SWP_TRANSACTION_BATTLE  );
   this.AddValidTransaction( SWP_STATE_WAIT,      SWGC.SWP_TRANSACTION_FLOP    );
};

SimpleWarPlayer.prototype = new Player();
SimpleWarPlayer.prototype.constructor = SimpleWarPlayer;


SimpleWarPlayer.prototype.InGameEnter = function() {
   this.UpdateStatus();
};


SimpleWarPlayer.prototype.InGameTransaction = function( eventId, data ) {
   // Update our status anytime we perform a transcation
   if( data.ownerId == this.id ) {
      this.UpdateStatus();
   }
}; 


SimpleWarPlayer.prototype.InProgressExit = function() {
   // Discard our Battle stack
   this.ExecuteTransaction( SWGC.SWP_TRANSACTION_DISCARD, ["TOP:ALL"], undefined );
   this.inGame = false;
   this.UpdateStatus();
   log.info( "SwPlay : %s is Out", this.name );
};


SimpleWarPlayer.prototype.DoBattle = function() {
   this.score = 0;
   this.Transition( SWP_STATE_BATTLE );

   return true;
};


SimpleWarPlayer.prototype.BattleTransaction = function( eventId, data ) {
   var eventHandled = false;

   if( ( data.ownerId == this.id ) && ( data.transaction == SWGC.SWP_TRANSACTION_BATTLE ) ) {
      this.UpdateStatus();

      this.Transition( SWP_STATE_WAIT );
      
      eventHandled = true;
   }

   return eventHandled;
};


SimpleWarPlayer.prototype.WaitEnter = function() {
   this.Score();
};


SimpleWarPlayer.prototype.WaitTransaction = function( eventId, data ) {
   var eventHandled = false;

   if( ( data.transaction == SWGC.SWP_TRANSACTION_GIVEUP ) &&
       ( data.ownerId == this.id ) ) {
      
      // TODO: Fix bug where player will go out even if he just won the battle
      if( this.stack.IsEmpty() ) {
         this.ExecuteTransaction( SWGC.SWP_TRANSACTION_DISCARD, ["TOP:ALL"], undefined );
         this.Transition( SWP_STATE_OUT );
      }
      else {
         this.Transition( SWP_STATE_READY );
      }

      this.UpdateStatus();
      eventHandled = true;
   }

   return eventHandled;
};


SimpleWarPlayer.prototype.DoWar = function( eventId, data ) {
   var eventHandled = false;

   if( data.ownerId == this.id ) {
      if( data.gotoWar ) {
         this.ExecuteTransaction( SWGC.SWP_TRANSACTION_FLOP, ["TOP:3"], undefined );
         this.Transition( SWP_STATE_READY );
      }
      else {
         this.score = 0;
      }

      this.UpdateStatus();
 
      eventHandled = true;
   }

   return eventHandled;
};


SimpleWarPlayer.prototype.Score = function()
{
   var   cont = this.rootContainer.GetContainerById( "Battle" );
   var   score = 0;
 
   function CardScore( element ) {
      score += parseInt( element.rank, 10 );
   }
   
   if( cont != undefined ) {
      cont.cards.forEach( CardScore );
   }

   log.info( "SWPlay : %s: Score: = %d", this.name, score );
   this.score = score;
};


SimpleWarPlayer.prototype.IsInGame = function() {
   return this.inGame;
};


SimpleWarPlayer.prototype.UpdateStatus = function() {
   // Indicate what our stack size is
   this.status.stackSize   = this.stack.NumCards();
   this.status.discardSize = this.discard.NumCards();

   // If our battle stack has a card on it, then indicate what that card is
   if( this.battle.NumCards() > 0 ) {
      this.status.battleStackTop = this.battle.cards[0].shortName;
   }
   else {
      this.status.battleStackTop = '';
   }

   // Now, notify the game engine of our updated status
   this.parentGame.UpdatePlayerStatus( this.id, this.status );
};

},{"../../Logger.js":8,"../../Player.js":9,"../../TransactionDefinition.js":11,"./SimpleWarDefs.js":12,"./SimpleWarStatus.js":16}],15:[function(require,module,exports){
var SimpleWarPlayer = require( "./SimpleWarPlayer.js" );
var SWGC     = require( "./SimpleWarDefs.js" );

/******************************************************************************
 * CLASS Definition: Simple War Player AI
 ******************************************************************************/

/******************************************************************************
 *
 * Class: SimpleWarPlayerAI
 * Inherits From: Player
 * Constructor
 *
 ******************************************************************************/
function SimpleWarPlayerAI( parent, id, alias )
{
   // Call the parent class constructor
   SimpleWarPlayer.call( this, parent, id, alias );

   this.status.type = "AI";
   this.status.alias = this.alias + " (AI)";
   this.SetEnterRoutine( "Battle", this.BattleEnter );
};

//Inherit from ActiveEntity
SimpleWarPlayerAI.prototype = new SimpleWarPlayer();
//Correct the constructor pointer
SimpleWarPlayerAI.prototype.constructor = SimpleWarPlayerAI;


SimpleWarPlayerAI.prototype.BattleEnter = function()
{
   var that = this;
   var timeout = ((Math.random() * 2) + 1) * 500;
   //var timeout = 5;

   setTimeout(function () {
      that.parentGame.EventTransaction( that.id,   SWGC.SWP_TRANSACTION_BATTLE,
                                        undefined,	undefined,
                                        ["TOP:1"] );
   }, timeout);
};


module.exports = SimpleWarPlayerAI;


},{"./SimpleWarDefs.js":12,"./SimpleWarPlayer.js":14}],16:[function(require,module,exports){


function SimpleWarPlayerStatus()
{
   this.id              = '';
   this.type            = '';
   this.alias           = '';
   this.stackSize       = 0;
   this.discardSize     = 0;
   this.battleStackTop  = '';
}


function SimpleWarStatus()
{
   this.players = {};
}


module.exports = {
                  SimpleWarPlayerStatus: SimpleWarPlayerStatus,
                  SimpleWarStatus: SimpleWarStatus };

},{}],17:[function(require,module,exports){
var CGEActiveEntity = require ('../../CGEActiveEntity.js');
var SWGC = require('./SimpleWarDefs.js');

var MAIN_STATE = "MAIN_STATE";

function SimpleWarUI(parentGame)
{
   CGEActiveEntity.call(this, "SimpleWarUI");

   log.info("Creating SimpleWarUI");

   this.AddState(MAIN_STATE);
   this.SetEnterRoutine(MAIN_STATE, this.MainEnter);
   this.SetInitialState(MAIN_STATE);

   this.parentGame = parentGame;
   this.playerId = null;
};

SimpleWarUI.prototype = new CGEActiveEntity();
SimpleWarUI.prototype.constructor = SimpleWarUI;

SimpleWarUI.prototype.MainEnter = function ()
{
   if (typeof window === 'undefined') return;

   var that = this;
   window.addEventListener('touchend', function () {
      if (that.playerId)
      {
         that.parentGame.EventTransaction(that.playerId,   SWGC.SWP_TRANSACTION_BATTLE,
                                          undefined,	undefined,
                                          ["TOP:1"] );
      }
   });

   var   gameDiv,
         noteDiv,
         playerIds,
         playerStatus,
         playerStack,
         discardStack;

   if (typeof window === 'undefined') return;

   gameDiv = document.getElementById('game');

   playerIds = this.parentGame.GetPlayerIds();
   for (var i = 0; i < playerIds.length; i++)
   {
      playerStatus = this.parentGame.GetPlayerStatus(playerIds[i]);

      infoDiv = document.createElement('div');
      infoDiv.id = playerStatus.alias + '-info';
      infoDiv.appendChild(document.createTextNode(playerStatus.alias));
      infoDiv.className = 'info';
      gameDiv.appendChild(infoDiv);

      playerStack = document.createElement('div');
      playerStack.id = playerStatus.alias + '-stack';
      playerStack.className = 'stack';
      gameDiv.appendChild(playerStack);

      battleStack = document.createElement('div');
      battleStack.id = playerStatus.alias + '-battle';
      battleStack.className = 'card-up';
      gameDiv.appendChild(battleStack);

      discardStack = document.createElement('div');
      discardStack.id = playerStatus.alias + '-discard';
      discardStack.className = 'discard';
      gameDiv.appendChild(discardStack);

      if (playerStatus.type !== 'AI')
      {
         this.playerId = playerStatus.id;
      }
   }

   noteDiv = document.createElement('div');
   noteDiv.id = 'note';
   gameDiv.appendChild(noteDiv);
};

SimpleWarUI.prototype.HandleEvent = function (eventId, data)
{
   var   playerStatus,
         playerStack,
         battleStack,
         infoDiv,
         noteDiv,
         x,
         xPos,
         yPos,
         timer = null;

   if (eventId === SWGC.CGE_EVENT_NOTIFY)
   {
      if (typeof window === 'undefined') return;

      noteDiv = document.getElementById('note');
      if (noteDiv)
      {
         noteDiv.style.display = 'block';
         noteDiv.innerHTML = data.msg;

         clearTimeout(timer);
         timer = setTimeout(function () {
            noteDiv.style.display = 'none';   
         }, 1000);
      }
   }
   else if (eventId === SWGC.CGE_EVENT_STATUS_UPDATE)
   {
      playerStatus = this.parentGame.GetPlayerStatus(data.ownerId);
      log.debug('StatusUpdateEvent: %s, %s', playerStatus.id, playerStatus.battleStackTop);

      if (typeof window === 'undefined') return;

      playerStack = document.getElementById(playerStatus.alias + '-stack');
      if (playerStack)
      {
         if (playerStatus.stackSize > 0)
         {
            playerStack.className = 'stack';
         }
         else
         {
            playerStack.className = 'stack-empty';
         }
      }

      infoDiv = document.getElementById(playerStatus.alias + '-info');
      if (infoDiv)
      {
         infoDiv.innerHTML = playerStatus.alias + '<br>' + playerStatus.stackSize + ' cards';
      }

      battleStack = document.getElementById(playerStatus.alias + '-battle');
      if (battleStack)
      {
         xPos = '0';
         yPos = '0';

         switch (playerStatus.battleStackTop.charAt(0))
         {
            case 'H':
               yPos = '-140px';
               break;

            case 'S':
               yPos = '-280px';
               break;

            case 'D':
               yPos = '-420px';
               break;
         }

         switch (playerStatus.battleStackTop.charAt(1))
         {
            case 'A':
               break;

            case 'K':
               xPos = '-1200px';
               break;

            case 'Q':
               xPos = '-1100px';
               break;

            case 'J':
               xPos = '-1000px';
               break;

            default:
               x = (parseInt(playerStatus.battleStackTop.slice(1), 10) - 1) * 100;
               xPos = '-' + x + 'px';
               break;
         }

         if (playerStatus.battleStackTop === '')
         {
            battleStack.style.backgroundImage = '';
         }
         else 
         {
            battleStack.style.backgroundImage = 'url("./img/cards.png")';
            battleStack.style.backgroundPosition = xPos + ' ' + yPos;
         }
      }

      discardStack = document.getElementById(playerStatus.alias + '-discard');
      if (discardStack)
      {
         while(discardStack.firstChild)
         {
            discardStack.removeChild(discardStack.firstChild);
         }
         for (var i = 0; i < playerStatus.discardSize; i++)
         {
            var discardCard = document.createElement('div');
            discardCard.className = 'discard-card';
            discardCard = discardStack.appendChild(discardCard);

            discardCard.style.marginLeft = (i * 20) + 'px';
         }
      }
   }
};

module.exports = SimpleWarUI;

},{"../../CGEActiveEntity.js":2,"./SimpleWarDefs.js":12}],18:[function(require,module,exports){

var SimpleWarGame = require( "../../src/js/games/SimpleWar/SimpleWarGame.js" );
var readLine = require( 'readline' );
var log = require ("../../src/js/Logger.js");

log.mask = 0xFE;

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
      "id": "12345",
      "isPrimary": "true",
   },
   "players": [ 
      { "id": "0010",
        "alias": "Alan",
        "type": "AI"
      },
      { "id": "0020",
        "alias": "David",
        "type": "AI"
      },
      { "id": "0030",
        "alias": "Jordan",
        "type": "USER"
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


function Battle()
{
   cardGame.EventTransaction( '0010', 'SWP_Battle' );
}

function main ()
{
   log.info('Launching game of ' + gameSpec.name + ' with deck type ' + deckSpec.name );

   cardGame = new SimpleWarGame();

   cardGame.Init( gameSpec, deckSpec );

   cardGame.StartGame();

   //log.info( "SWTest : ***** Player 0: Card Stack *****" );
   //cardGame.players[0].rootContainer.containers[0].PrintCards();
   //log.info( "SWTest : ***** Player 1: Card Stack *****" );
   //cardGame.players[1].rootContainer.containers[0].PrintCards();
   //log.info( "SWTest : ***** Player 2: Card Stack *****" );
   //cardGame.players[2].rootContainer.containers[0].PrintCards();
}

if (typeof window === 'undefined')
{
   main();
}
else
{
//   document.addEventListener('deviceready', main, false);
   window.addEventListener('load', main, false);
}

},{"../../src/js/Logger.js":8,"../../src/js/games/SimpleWar/SimpleWarGame.js":13,"readline":19}],19:[function(require,module,exports){

},{}],20:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        throw TypeError('Uncaught, unspecified "error" event.');
      }
      return false;
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      console.trace();
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}]},{},[18])
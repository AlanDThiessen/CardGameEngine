(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){


/******************************************************************************
 *  NodeJS stuff
 ******************************************************************************/
module.exports = ActiveEntity;
var State        = require( "./State.js" );


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
      console.log( "Adding event handler for event %d to state %s", eventId, state.name );
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
   console.log( "Start: transition to %s", this.name );
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


   console.log( "Transition: %s -> %s; ", this.currentState.name, destStateName );

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
      
      console.log( destAncestors );
      console.log( srcAncestors );

      // Now, iterate from the bottom of the source ancestor list to find the 
      // Lowest common denominator of both states.
      // The first one popped off the list should be current state.
      found = -1;
      while( ( found == -1 ) && srcAncestors.length )
      {
         lcAncestor = srcAncestors.pop();
         found = destAncestors.indexOf( lcAncestor );
      }

      console.log( "Common Ancestor: %s", lcAncestor );

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
         console.error( "Could not find common ancestor state" );
      }
   }
   else
   {
      console.log( "Transition to undefined state in ActiveEntity: %s", this.name );
   }
};

},{"./State.js":9}],2:[function(require,module,exports){

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
               toContainer.AddGroup( cards );
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
            debugger;
            var toContainer = this.rootContainer.GetContainerById( transDef.toContainerName );
            var fromContainer = this.rootContainer.GetContainerById( transDef.fromContainerName );
            var cardArray = Array();
           
            if( ( toContainer != undefined ) && ( fromContainer != undefined ) )
            {
               fromContainer.GetGroup( cardArray, cardList );
               toContainer.AddGroup( cardArray );
               success = true;
            } 
         }
      }
   }

   return success;
};


},{"./ActiveEntity.js":1,"./CGEState.js":3,"./CardContainer.js":5,"./TransactionDefinition.js":10,"./games/SimpleWar/SimpleWarDefs.js":11}],3:[function(require,module,exports){

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

},{"./State.js":9}],4:[function(require,module,exports){

module.exports = Card;


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
   console.log( this.id + ' : ' + this.shortName + ' : ' + this.name );
};


},{}],5:[function(require,module,exports){

module.exports = CardContainer;
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
CardContainer.prototype.AddGroup = function( group )
{
   if (this.AcceptGroup(group) == true)
   {
      // TODO: Verify min/max cards
      for( var cntr = 0; cntr < group.length; cntr++ )
      {
         this.cards.push( group[cntr] );
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
   // ADT TODO: Finish this method
   if( this.CanGetGroup(cardList ) == true )
   {
      // TODO: Implement card retrieval other than top
      cardArray.push( this.GetCard( "TOP" ) );
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


/*******************************************************************************
 * 
 * CardContainer.prototype.GetHTML
 * 
 ******************************************************************************/
CardContainer.prototype.GetHTML = function()
{
   var htmlStr = "";
   var cntr;

   htmlStr += '<div id="div_' + this.id + '" cgOId="' + this.id + '">\n';

   for (cntr = 0; cntr < this.containers.length; cntr++)
   {
      htmlStr += this.containers[cntr].GetHTML();
   }

   htmlStr += '</div>\n';

   return htmlStr;
};

},{"./Card.js":4,"./CardGroup.js":7}],6:[function(require,module,exports){

module.exports = CardGame;
var ActiveEntity = require( "./ActiveEntity.js" );
var CGEActiveEntity = require( "./CGEActiveEntity.js" );
var Card = require( "./Card.js" );
var transDef = require( "./TransactionDefinition.js" );
var SWGC     = require( "./games/SimpleWar/SimpleWarDefs.js" );

var TransactionDefinition = transDef.TransactionDefinition;
var AddTransactionDefinition = transDef.AddTransactionDefinition;
var TRANSACTION_TYPE_INBOUND = transDef.TRANSACTION_TYPE_INBOUND;
var TRANSACTION_TYPE_OUTBOUND = transDef.TRANSACTION_TYPE_OUTBOUND;

var CGE_DEALER = "Dealer";
var CGE_TABLE = "Table";

//Outgoing Transactions
AddTransactionDefinition( "CGE_DEAL", CGE_DEALER,    TRANSACTION_TYPE_OUTBOUND,  1, 1 );


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
   console.log( 'Initializing game of ' + gameSpec.name );
   console.log( gameSpec );

   this.gameName = gameSpec.server.name;
   this.id       = gameSpec.server.id;

   // Setup game parameters
   if( gameSpec.server.isPrimary == 'true' )
   {
      this.isHost = true;
   }

   console.log( "Adding players" );
   this.AddPlayers( gameSpec.players );

   this.CreateDeck( deckSpec );
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

   // Now, start the game
   //ActiveEntity.Start.call( this );
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
   console.log( 'Please override virtual function \'CardGame.AddPlayer()\'.' );
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
   console.log( 'Please override virtual function \'CardGame.Deal()\'.' );
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


CardGame.prototype.SendEvent = function( eventId, data )
{
   // First, send all events to the game engine
   this.HandleEvent( eventId, data );

   if( ( data != undefined ) && ( data.ownerId != undefined ) )
   {
       console.log( "Sending event to owner: %s", data.ownerId );
      var entity = this.GetEntityById( data.ownerId );
      entity.HandleEvent( eventId, data );
   }
   else
   {
      this.AllPlayersHandleEvent( eventId, data );
   }
};


CardGame.prototype.EventTransaction = function( destId, destTransName, srcId, srcTransName, cardList )
{
   var   destEntity = this.GetEntityById( destId );
   var   success = false;


   if( destEntity != undefined )
   {
      if( ( srcId != undefined ) && ( srcId != destId ) )
      {
         var srcEntity = this.GetEntityById( srcId );
 
         if( srcEntity != undefined )
         {
            var   cardArray = Array();
            if( srcEntity.ExecuteTransaction( srcTransName, cardList, cardArray ) )
            {
               this.SendEvent( SWGC.CGE_EVENT_TRANSACTION, { ownderId : srcId, transaction: srcTransName } );
               success = destEntity.ExecuteTransaction( destTransName, cardList, cardArray );

               if( success )
               {
                  this.SendEvent( SWGC.CGE_EVENT_TRANSACTION, { ownderId : destId, transaction: destTransName } );
               }
            }
            else
            {
               console.error( "EventTransaction: src transaction failed" );
            }
         }
         else
         {
            console.error( "EventTransaction: srcId Not found!" );
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
};

},{"./ActiveEntity.js":1,"./CGEActiveEntity.js":2,"./Card.js":4,"./TransactionDefinition.js":10,"./games/SimpleWar/SimpleWarDefs.js":11}],7:[function(require,module,exports){

module.exports = CardGroup;


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
   
   console.log( this.id + ' holds ' + this.cards.length + ' cards ' );

   for( i = 0; i < this.cards.length; i++ )
   {
      this.cards[i].Print();
   }
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



},{}],8:[function(require,module,exports){

module.exports = Player;
var CGEActiveEntity = require( "./CGEActiveEntity.js" );


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

   console.log( "New Player: %s", alias );

   this.parentGame      = parent;
   this.id              = id;
   this.alias           = alias;
   this.score           = 0;
}

// Inherit from CGEActiveEntity
Player.prototype = new CGEActiveEntity();
// Correct the constructor pointer
Player.prototype.constructor = Player;


},{"./CGEActiveEntity.js":2}],9:[function(require,module,exports){

/******************************************************************************
 *  NodeJS stuff
 ******************************************************************************/
module.exports = State;


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
   console.log( "Created New State: %s", ancestorList.join(':') );
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
      console.log( "State %s: Initial State set to %s", this.name, state.name );
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
      
      console.log( "Enter State: %s", this.name );

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
      console.log( "Exit State: %s", this.name );
      
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

},{}],10:[function(require,module,exports){

/******************************************************************************
 * Global array of Transaction Definitions
 ******************************************************************************/
//if( TransactionDefs == undefined )
//{
   var TransactionDefs = Array();

   function AddTransactionDefinition( name, from, to, minCards, maxCards )
   {
      if( GetTransactionDefinition( name ) == undefined )
      {
         TransactionDefs.push( new TransactionDefinition( name, from, to, minCards, maxCards ) );
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
function TransactionDefinition( name, from, to, minCards, maxCards )
{
   this.name               = name;
   this.fromContainerName  = from;
   this.toContainerName    = to;
   this.minCards           = minCards;
   this.maxCards           = maxCards;
};



module.exports = {
 TransactionDefinition: TransactionDefinition,
 AddTransactionDefinition: AddTransactionDefinition,
 GetTransactionDefinition: GetTransactionDefinition,
 TRANSACTION_TYPE_INBOUND: TRANSACTION_TYPE_INBOUND,
 TRANSACTION_TYPE_OUTBOUND: TRANSACTION_TYPE_OUTBOUND
};

},{}],11:[function(require,module,exports){


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
   CGE_EVENT_TRANSACTION   :    1,
   
   SW_EVENT_DO_BATTLE      : 1000,
   SW_EVENT_DO_WAR         : 1001,
};

module.exports = SWG_CONSTANTS;

},{}],12:[function(require,module,exports){

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
                             undefined );

      player++;

      if( player >= this.players.length )
      {
         player = 0;
      }
   }
};


},{"../../CardGame.js":6,"../../TransactionDefinition.js":10,"./SimpleWarDefs.js":11,"./SimpleWarPlayer.js":13,"./SimpleWarPlayerAI.js":14}],13:[function(require,module,exports){
module.exports = SimpleWarPlayer;

var SWGC     = require( "./SimpleWarDefs.js" );
var Player   = require( "../../Player.js" );
var transDef = require( "../../TransactionDefinition.js" );

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
var SWP_STATE_WAR             = "War";       // Top:InGame:War
var SWP_STATE_FLOP            = "Flop";      // Top:InGame:War:Flop
var SWP_STATE_DRAW            = "Draw";      // Top:InGame:War:Draw

/******************************************************************************
 * Containers
 ******************************************************************************/
var SWP_CONTAINER_STACK       = "Stack";     // The main stack of cards
var SWP_CONTAINER_BATTLE      = "Battle";    // The location to flip the top card
var SWP_CONTAINER_DISCARD     = "Discard";   // Where all turned cards go before end of turn


// Internal Transactions
AddTransactionDefinition( SWGC.SWP_TRANSACTION_BATTLE,   SWP_CONTAINER_STACK,      SWP_CONTAINER_BATTLE,       1, 1 );
AddTransactionDefinition( SWGC.SWP_TRANSACTION_DICARD,   SWP_CONTAINER_BATTLE,     SWP_CONTAINER_DISCARD,      1, 1 );
AddTransactionDefinition( SWGC.SWP_TRANSACTION_FLOP,     SWP_CONTAINER_STACK,      SWP_CONTAINER_DISCARD,      3, 3 );

// Incoming Transactions
AddTransactionDefinition( SWGC.SWP_TRANSACTION_DEAL,     TRANSACTION_TYPE_INBOUND, SWP_CONTAINER_STACK,        1, 52 );
AddTransactionDefinition( SWGC.SWP_TRANSACTION_COLLECT,  TRANSACTION_TYPE_INBOUND, SWP_CONTAINER_DISCARD,      1, 52 );

// Outgoing Transactions
AddTransactionDefinition( SWGC.SWP_TRANSACTION_GIVEUP,   SWP_CONTAINER_DISCARD,    TRANSACTION_TYPE_OUTBOUND,  1, 52 );


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
   this.AddState( SWP_STATE_WAR,       SWP_STATE_IN_GAME );
   this.AddState( SWP_STATE_FLOP,      SWP_STATE_WAR     );
   this.AddState( SWP_STATE_DRAW,      SWP_STATE_WAR     );

   this.SetInitialState( SWP_STATE_READY );

   this.SetEnterRoutine( SWP_STATE_WAIT,      this.WaitEnter     );

   this.AddEventHandler( SWP_STATE_READY,  SWGC.SW_EVENT_DO_BATTLE,    this.DoBattle );
   this.AddEventHandler( SWP_STATE_BATTLE, SWGC.CGE_EVENT_TRANSACTION, this.BattleTransaction );

   // TODO: Need definitions for Max cards in deck
   this.AddContainer( "Stack",   undefined, 0, 52 );
   this.AddContainer( "Battle",  undefined, 0,  1 );
   this.AddContainer( "Discard", undefined, 0, 52 );

   // Add the valid transactions to the states
   this.AddValidTransaction( SWP_STATE_READY,  SWGC.SWP_TRANSACTION_DEAL    );
   this.AddValidTransaction( SWP_STATE_BATTLE, SWGC.SWP_TRANSACTION_BATTLE  );
   this.AddValidTransaction( SWP_STATE_FLOP,   SWGC.SWP_TRANSACTION_FLOP    );
   this.AddValidTransaction( SWP_STATE_DRAW,   SWGC.SWP_TRANSACTION_BATTLE  );
   this.AddValidTransaction( SWP_STATE_WAIT,   SWGC.SWP_TRANSACTION_COLLECT );
   this.AddValidTransaction( SWP_STATE_WAIT,   SWGC.SWP_TRANSACTION_GIVEUP  );
};

//Inherit from ActiveEntity
SimpleWarPlayer.prototype = new Player();
//Correct the constructor pointer
SimpleWarPlayer.prototype.constructor = SimpleWarPlayer;


SimpleWarPlayer.prototype.DoBattle = function()
{
   console.log( '%s:DoBattle', this.name );
   this.Transition( SWP_STATE_BATTLE );

   return true;
};


SimpleWarPlayer.prototype.BattleTransaction = function( eventId, data )
{
   var eventHandled = false;


   console.log( "%s:BattleTransaction:%s", this.name, data );
   if( data.transaction == SWGC.SWP_TRANSACTION_BATTLE )
   {
      eventHandled = true;
      this.Transition( SWP_STATE_WAIT );
   }

   return eventHandled;
};


SimpleWarPlayer.prototype.WaitEnter = function()
{
   var cont = this.rootContainer.GetContainerById( "Battle" );
   
   if( cont != undefined )
   {
      cont.PrintCards();
   }

   this.Score();
};



SimpleWarPlayer.prototype.Score = function()
{
   var   cont = this.rootContainer.GetContainerById( "Battle" );
   var   score = 0;
 
   function CardScore( element )
   {
      score += parseInt( element.rank );
   }
   
   if( cont != undefined )
   {
      cont.cards.forEach( CardScore );
   }

   console.log( "Score Alert: %s = %d", this.name, score );
   this.score = score;
};

},{"../../Player.js":8,"../../TransactionDefinition.js":10,"./SimpleWarDefs.js":11}],14:[function(require,module,exports){
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

   this.SetEnterRoutine( "Battle", this.BattleEnter );
};

//Inherit from ActiveEntity
SimpleWarPlayerAI.prototype = new SimpleWarPlayer();
//Correct the constructor pointer
SimpleWarPlayerAI.prototype.constructor = SimpleWarPlayerAI;


SimpleWarPlayerAI.prototype.BattleEnter = function()
{
	this.parentGame.EventTransaction( this.id, SWGC.SWP_TRANSACTION_BATTLE );
};


module.exports = SimpleWarPlayerAI;


},{"./SimpleWarDefs.js":11,"./SimpleWarPlayer.js":13}],15:[function(require,module,exports){

var SimpleWarGame = require( "../../src/js/games/SimpleWar/SimpleWarGame.js" );
var readLine = require( 'readline' );

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
        "type": "User"
      },
      { "id": "0020",
        "alias": "David",
        "type": "AI"
      },
      { "id": "0030",
        "alias": "Jordan",
        "type": "AI"
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


console.log('Launching game of ' + gameSpec.name + ' with deck type ' + deckSpec.name );

cardGame = new SimpleWarGame();

cardGame.Init( gameSpec, deckSpec );

cardGame.StartGame();


Battle(); 
console.log( "***** Player 0: Card Stack *****" );
cardGame.players[0].rootContainer.containers[0].PrintCards();
console.log( "***** Player 1: Card Stack *****" );
cardGame.players[1].rootContainer.containers[0].PrintCards();
console.log( "***** Player 2: Card Stack *****" );
cardGame.players[2].rootContainer.containers[0].PrintCards();


},{"../../src/js/games/SimpleWar/SimpleWarGame.js":12,"readline":16}],16:[function(require,module,exports){

},{}]},{},[15])
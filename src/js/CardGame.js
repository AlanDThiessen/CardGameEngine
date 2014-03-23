
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
   if( eventId != SWGC.CGE_EVENT_STATUS_UPDATE )
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


module.exports = CardGame;

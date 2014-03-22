
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



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

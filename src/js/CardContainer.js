
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

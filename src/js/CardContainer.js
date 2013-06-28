

/******************************************************************************
 *
 * CardContainer Class
 * Constructor
 *
 ******************************************************************************/
function CardContainer( id )
{
   this.id           = id;
   this.containers   = Array();

   CardGroup.call( this );
}

// Inherit from CardContainer
CardContainer.prototype = new CardGroup();
// Correct the constructor pointer
CardContainer.prototype.constructor = CardContainer;


/******************************************************************************
 *
 * CardContainer.prototype.AddGroup
 *
 ******************************************************************************/
CardContainer.prototype.AddGroup = function( group )
{
   if( this.AcceptGroup( group ) == true )
   {
      this.cards.push( group );
   }

   return "Added Group " + group;
};


/******************************************************************************
 *
 * CardContainer.prototype.AddContainer
 *
 ******************************************************************************/
CardContainer.prototype.AddContainer = function( container )
{
   this.containers.push( container );

   return "Added container " + container;
};


/******************************************************************************
 *
 * CardContainer.prototype.CanGetGroup
 *
 ******************************************************************************/
CardContainer.prototype.CanGetGroup = function( cardList )
{
   // ADT TODO: Finish this method
   // Verify cardList is an array first...
   if( Object.prototype.toString.call( cardList ) === '[object Array]' )
   {
      
   }
   
   return true;
};


/******************************************************************************
 *
 * CardContainer.prototype.GetGroup
 *
 ******************************************************************************/
CardContainer.prototype.GetGroup = function( cardList )
{
   // ADT TODO: Finish this method
   var cardGroup = Array();
   
   
   if( this.CanGetGroup( cardList ) == true )
   {
      
   }

   return "Get Group " + group;
};


/******************************************************************************
 *
 * CardContainer.prototype.AcceptGroup
 *
 ******************************************************************************/
CardContainer.prototype.AcceptGroup = function( group )
{
   return true;
};


/******************************************************************************
 *
 * CardContainer.prototype.GetContainerById
 *
 ******************************************************************************/
CardContainer.prototype.GetContainerById = function( id )
{
   var   cntr;
   var   returnVal = undefined;


   if( id == this.id )
   {
      returnVal = this;
   }
   else
   {
      cntr = 0;

      do
      {
         returnVal = this.containers[cntr].GetContainerById( id );
      }
      while( ( cntr < this.containers.length ) && ( returnVal == undefined ) )
   }

   return returnVal;
};


/******************************************************************************
 *
 * CardContainer.prototype.GetHTML
 *
 ******************************************************************************/
CardContainer.prototype.GetHTML = function()
{
   var   htmlStr = "";
   var   cntr;


   htmlStr += '<div id="div_' + this.id + '" cgOId="' + this.id + '">\n';

   for( cntr = 0; cntr < this.containers.length; cntr++ )
   {
      htmlStr += this.containers[cntr].GetHTML();
   }

   htmlStr += '</div>\n';

   return htmlStr;
};

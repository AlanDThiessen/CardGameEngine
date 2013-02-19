

function CardContainer( id )
{
   this.id     = id;
   this.containers = Array();

   CardGroup.call( this );
}


// Inherit from CardContainer
CardContainer.prototype = new CardGroup();

// Correct the constructor pointer
CardContainer.prototype.constructor = CardContainer;


CardContainer.prototype.AddGroup = function( group )
{
   if( this.AcceptGroup( group ) == true )
   {
      this.cards.push( group );
   }

   return "Added Group " + group;
}


CardContainer.prototype.AddContainer = function( container )
{
   this.containers.push( container );
   
   return "Added container " + container;
}


CardContainer.prototype.GetGroup = function( group )
{
   return "Get Group " + group;
}


CardContainer.prototype.AcceptGroup = function( group )
{
   return true;
}


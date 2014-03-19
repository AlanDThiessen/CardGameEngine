
module.exports = Player;
var CardContainer = require( "./CardContainer.js" );
var CGEActiveEntity = require( "./CGEActiveEntity.js" );

/******************************************************************************
 *
 * Player Class
 * Constructor
 *
 ******************************************************************************/
function Player( alias )
{
   // Call the parent class constructor
   CGEActiveEntity.call( this, "Player:" + alias );

   this.alias           = alias;
   this.score           =  0;
   this.rootContainer   = new CardContainer( "Player:" + alias );
}

// Inherit from CGEActiveEntity
Player.prototype = new CGEActiveEntity();
// Correct the constructor pointer
Player.prototype.constructor = Player;


Player.prototype.AddContainer = function( name, parent, minCards, maxCards )
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
};



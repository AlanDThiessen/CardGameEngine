
module.exports = Player;
var CGEActiveEntity = require( "./CGEActiveEntity.js" );


/******************************************************************************
 *
 * Player Class
 * Constructor
 *
 ******************************************************************************/
function Player( id, alias )
{
   // Call the parent class constructor
   CGEActiveEntity.call( this, "Player:" + alias );

   console.log( "New Player: %s", alias );

   this.id              = id;
   this.alias           = alias;
   this.score           = 0;
}

// Inherit from CGEActiveEntity
Player.prototype = new CGEActiveEntity();
// Correct the constructor pointer
Player.prototype.constructor = Player;


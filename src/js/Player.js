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

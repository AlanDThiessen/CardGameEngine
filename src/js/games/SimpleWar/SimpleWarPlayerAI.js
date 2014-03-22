var SimpleWarPlayer = require( "./SimpleWarPlayer.js" );

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
};

//Inherit from ActiveEntity
SimpleWarPlayerAI.prototype = new SimpleWarPlayer();
//Correct the constructor pointer
SimpleWarPlayerAI.prototype.constructor = SimpleWarPlayerAI;



module.exports = SimpleWarPlayerAI;


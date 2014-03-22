var SimpleWarPlayer = require( "./SimpleWarPlayer.js" );
var SWGC     = require( "./SimpleWarDefs.js" );

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

   this.SetEnterRoutine( "Battle", this.BattleEnter );
};

//Inherit from ActiveEntity
SimpleWarPlayerAI.prototype = new SimpleWarPlayer();
//Correct the constructor pointer
SimpleWarPlayerAI.prototype.constructor = SimpleWarPlayerAI;


SimpleWarPlayerAI.prototype.BattleEnter = function()
{
	this.parentGame.EventTransaction( this.id, SWGC.SWP_TRANSACTION_BATTLE );
};


module.exports = SimpleWarPlayerAI;

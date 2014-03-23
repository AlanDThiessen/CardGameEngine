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

   this.status.type = "AI";
   this.status.alias = this.alias + "(AI)";
   this.SetEnterRoutine( "Battle", this.BattleEnter );
};

//Inherit from ActiveEntity
SimpleWarPlayerAI.prototype = new SimpleWarPlayer();
//Correct the constructor pointer
SimpleWarPlayerAI.prototype.constructor = SimpleWarPlayerAI;


SimpleWarPlayerAI.prototype.BattleEnter = function()
{
   var that = this;
   var timeout = ((Math.random() * 5) + 1) * 500;

   setTimeout(function () {
      that.parentGame.EventTransaction( that.id,   SWGC.SWP_TRANSACTION_BATTLE,
                                        undefined,	undefined,
                                        ["TOP:1"] );
   }, timeout);
};


module.exports = SimpleWarPlayerAI;


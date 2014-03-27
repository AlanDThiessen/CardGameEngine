var SimpleWarPlayer = require("./SimpleWarPlayer.js");
var SWGC = require("./SimpleWarDefs.js");

/*******************************************************************************
 * CLASS Definition: Simple War Player AI
 ******************************************************************************/

/*******************************************************************************
 * 
 * Class: SimpleWarPlayerAI
 * Inherits From: SimpleWarPlayer
 *
 * This class implements the "Artificial Intelligence" player for the Simple
 * War card game.
 * 
 ******************************************************************************/
function SimpleWarPlayerAI(parent, id, alias) {
   // Call the parent class constructor
   SimpleWarPlayer.call(this, parent, id, alias);

   this.status.type = "AI";
   this.status.alias = this.alias + " (AI)";
   this.SetEnterRoutine("Battle", this.BattleEnter);
};

SimpleWarPlayerAI.prototype = new SimpleWarPlayer();
SimpleWarPlayerAI.prototype.constructor = SimpleWarPlayerAI;

/*******************************************************************************
 * 
 * SimpleWarPlayerAI.prototype.BattleEnter
 * 
 * This method performs the action upon entrance to the Battle state.  It waits
 * a time period, and then sends in a Battle transaction for the player this
 * class represents.
 * 
 ******************************************************************************/
SimpleWarPlayerAI.prototype.BattleEnter = function() {
   var that = this;
   var timeout = ((Math.random() * 2) + 1) * 500;

   setTimeout(function() {
      that.parentGame.EventTransaction(that.id,
                                       SWGC.SWP_TRANSACTION_BATTLE,
                                       undefined,
                                       undefined,
                                       [ "TOP:1" ]);
   }, timeout);
};

module.exports = SimpleWarPlayerAI;


var Status = require("../../engine/Status.js");


function SimpleWarPlayerStatus()
{
   this.stackSize       = 0;
   this.discardSize     = 0;
   this.battleStackTop  = '';
   this.discardList		= [];
}

SimpleWarPlayerStatus.prototype = new Status.PlayerStatus();
SimpleWarPlayerStatus.prototype.constructor = SimpleWarPlayerStatus;


module.exports = {
                  SimpleWarPlayerStatus: SimpleWarPlayerStatus,
                  };

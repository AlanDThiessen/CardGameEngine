

function SimpleWarPlayerStatus()
{
   this.id              = '';
   this.type            = '';
   this.alias           = '';
   this.stackSize       = 0;
   this.discardSize     = 0;
   this.battleStackTop  = '';
   this.discardList		= [];
}


function SimpleWarStatus()
{
   this.players = {};
}


module.exports = {
                  SimpleWarPlayerStatus: SimpleWarPlayerStatus,
                  SimpleWarStatus: SimpleWarStatus };

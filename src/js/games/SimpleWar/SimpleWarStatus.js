

function SimpleWarPlayerStatus()
{
   this.id = '';
   this.alias = '';
   this.stackSize = 0;
   this.battleStackTop = '';
}


function SimpleWarStatus()
{
   this.players = [];
}


module.exports = {
                  SimpleWarPlayerStatus: SimpleWarPlayerStatus,
                  SimpleWarStatus: SimpleWarStatus };

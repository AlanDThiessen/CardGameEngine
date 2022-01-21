

function PlayerStatus()
{
   this.id              = '';
   this.type            = '';
   this.alias           = '';
}


function CardGameStatus()
{
   this.players = {};
}


module.exports = {
                  PlayerStatus: PlayerStatus,
                  CardGameStatus: CardGameStatus };

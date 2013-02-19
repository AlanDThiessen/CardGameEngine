function CardGame()
{
   this.isHost = false;

   this.table  = new Table();
   this.dealer = new Dealer();
   this.players = Array();
}


CardGame.prototype.init = function()
{
}




/******************************************************************************
 *
 * Card Class
 * Constructor
 *
 ******************************************************************************/
function Card( suit, suitShort, rank, color )
{
   this.id        = suitShort + rank;
   this.suit      = suit;
   this.suitShort = suitShort;
   this.rank      = rank;
   this.color     = color;
}


Card.prototype.Print = function()
{
   return this.id;
}


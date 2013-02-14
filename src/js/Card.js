
function Card( cardName, shortName, suit, rank, color )
{
   this.cardName = cardName;
   this.shortName = shortName;
   this.suit = suit;
   this.rank = rank;
   this.color = color;

   this.Print = function()
   {
      return this.shortName;
   };
}


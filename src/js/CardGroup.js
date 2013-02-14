
function CardGroup()
{
   this.cards = Array();


   this.AddCard = function( card )
   {
      this.cards.push( card );
   }

   this.PrintCards = function()
   {
      var output = "";

      for( i = 0; i < this.cards.length; i++ )
      {
         output += this.cards[i].Print() + ' ';
      }

      return output;
   };

   this.SortRank = function( order = 'ascending' )
   {
      if( order.toLowerCase() == 'ascending' )
      {
         this.cards.sort( function(a, b){ return a.rank - b.rank } );
      }
      else
      {
         this.cards.sort( function(a, b){ return b.rank - a.rank } );
      }
   };

   this.SortSuit = function( order = 'ascending' )
   {
      if( order.toLowerCase() == 'ascending' )
      {
         this.cards.sort(  function(a, b)
                           {
                              if( a.suit < b.suit )
                                 return -1;
                              else if( a.suit > b.suit )
                                 return 1;
                              else
                                 return 0;
                           }
                        );
      }
      else
      {
         this.cards.sort(  function(a, b)
                           {
                              if( b.suit < a.suit )
                                 return -1;
                              else if( b.suit > a.suit )
                                 return 1;
                              else
                                 return 0;
                           }
                        );
      }
   };
}


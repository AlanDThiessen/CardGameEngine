
/******************************************************************************
 *
 * CardGroup Class
 * Constructor
 *
 ******************************************************************************/
function CardGroup()
{
   this.cards = Array();
}


/******************************************************************************
 *
 * CardGroup.prototype.AddCard
 *
 ******************************************************************************/
CardGroup.prototype.AddCard = function( card )
{
   this.cards.push( card );
}


/******************************************************************************
 *
 * CardGroup.prototype.PrintCards
 *
 ******************************************************************************/
CardGroup.prototype.PrintCards = function()
{
   for( i = 0; i < this.cards.length; i++ )
   {
      this.cards[i].Print();
   }
}


/******************************************************************************
 *
 * CardGroup.prototype.SortRank
 *
 ******************************************************************************/
CardGroup.prototype.SortRank = function( order )
{
   if( !defined( order ) )
   {
      order = 'ascending';
   }
   
   if( order.toLowerCase() == 'ascending' )
   {
      this.cards.sort( function(a, b){ return a.rank - b.rank } );
   }
   else
   {
      this.cards.sort( function(a, b){ return b.rank - a.rank } );
   }
}


/******************************************************************************
 *
 * CardGroup.prototype.SortSuit
 *
 ******************************************************************************/
CardGroup.prototype.SortSuit = function( order )
{
   if( !defined( order ) )
   {
      order = 'ascending';
   }
   
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
}


/******************************************************************************
 *
 * CardGroup.prototype.SortSuitRank
 *
 ******************************************************************************/
CardGroup.prototype.SortSuitRank = function( order )
{
   if( !defined( order ) )
   {
      order = 'ascending';
   }
   
   if( order.toLowerCase() == 'ascending' )
   {
      this.cards.sort(  function(a, b)
                        {
                           if( a.suit < b.suit )
                              return -1;
                           else if( a.suit > b.suit )
                              return 1;
                           else
                              return a.rank - b.rank;
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
                              return b.rank - a.rank;
                        }
                     );
   }
}


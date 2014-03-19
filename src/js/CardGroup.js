
module.exports = CardGroup;

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
};


/******************************************************************************
 *
 * CardGroup.prototype.GetCard
 *
 ******************************************************************************/
CardGroup.prototype.GetCard = function( cardId )
{
   // ADT TODO: Fill out this method
   this.cards.push( card );
};


/******************************************************************************
 *
 * CardGroup.prototype.PrintCards
 *
 ******************************************************************************/
CardGroup.prototype.PrintCards = function()
{
   var i;
   
   console.log( this.id + ' holds ' + this.cards.length + ' cards ' );

   for( i = 0; i < this.cards.length; i++ )
   {
      this.cards[i].Print();
   }
};


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
      this.cards.sort( function(a, b){ return a.rank - b.rank; } );
   }
   else
   {
      this.cards.sort( function(a, b){ return b.rank - a.rank; } );
   }
};


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
};


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
};


/******************************************************************************
 *
 * CardGroup.prototype.Shuffle
 *
 ******************************************************************************/
CardGroup.prototype.Shuffle = function()
{
   var   numCards = this.cards.length;       // The number of cards in the group
   var   numIter  = numCards * 3;            // The number of iterations to move cards
   var   fromPos;                            // From position
   var   toPos;                              // To position


   while( numIter > 0 )
   {
      fromPos  = Math.floor( Math.random() * numCards );
      toPos    = Math.floor( Math.random() * numCards );
      
      // Move a card from the from position to the to position
      this.cards.splice( toPos, 0, this.cards.splice( fromPos, 1 )[0] );

      numIter--;
   }
};



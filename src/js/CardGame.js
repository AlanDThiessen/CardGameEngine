function CardGame()
{
   this.isHost = false;

   this.table  = new Table();
   this.dealer = new Dealer();
   this.players = Array();
}


CardGame.prototype.Init = function( gameSpec, deckSpec )
{
   console.log( 'Initializing game of ' + gameSpec.name );
   this.CreateDeck( deckSpec );
}


CardGame.prototype.StartGame = function()
{
}


CardGame.prototype.CreateDeck = function( deckSpec )
{
   var suitCntr;
   var valueCntr;
   var qty;

   console.log( deckSpec );

   // Create the suited cards first
   for( suitCntr = 0; suitCntr < deckSpec.suited.suits.suit.length; suitCntr++ )
   {
      for( valueCntr = 0; valueCntr < deckSpec.suited.values.value.length; valueCntr++ )
      {
         for( qty = 0; qty < deckSpec.suited.values.value[valueCntr].quantity; qty++ )
         {
            this.dealer.AddCard( this.CreateSuitedCard( deckSpec.suited.suits.suit[suitCntr],
                                                        deckSpec.suited.values.value[valueCntr],
                                                        qty ) );
         }
      }
   }

   // Now Create the non-suited cards
   for( valueCntr = 0; valueCntr < deckSpec.nonsuited.value.length; valueCntr++ )
   {
      for( qty = 0; qty < deckSpec.nonsuited.value[valueCntr].quantity; qty++ )
      {
         this.dealer.AddCard( this.CreateNonSuitedCard( deckSpec.nonsuited.value[valueCntr],
                                                        qty ) );
      }
   }

   console.log( 'Dealer holds ' + this.dealer.cards.length + ' cards ' );
   this.dealer.PrintCards();
}


CardGame.prototype.CreateSuitedCard = function( suit, value, count )
{
   return new Card( suit.name,
                    suit.name + ' '+ value.name,
                    suit.shortname + value.shortname,
                    value.rank,
                    suit.color,
                    count );
}


CardGame.prototype.CreateNonSuitedCard = function( nonSuited, count )
{
   return new Card( nonSuited.name,
                    nonSuited.name,
                    nonSuited.shortname,
                    nonSuited.rank,
                    nonSuited.color,
                    count );
}



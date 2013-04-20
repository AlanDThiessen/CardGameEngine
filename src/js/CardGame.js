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
   console.log( gameSpec );

   // ADT: Temp code to ensure shuffle
   gameSpec.server.isPrimary = 'true';
   
   // Setup game parameters
   if( gameSpec.server.isPrimary == 'true' )
   {
      this.isHost = true;
   }

   this.CreateDeck( deckSpec );

   if( this.isHost )
   {
      this.dealer.Shuffle();
   }
}


CardGame.prototype.StartGame = function()
{
   if( this.isHost )
   {
      this.Deal();
   }
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
   for( valueCntr = 0; valueCntr < deckSpec.nonsuited.values.value.length; valueCntr++ )
   {
      for( qty = 0; qty < deckSpec.nonsuited.values.value[valueCntr].quantity; qty++ )
      {
         this.dealer.AddCard( this.CreateNonSuitedCard( deckSpec.nonsuited.values.value[valueCntr],
                                                        qty ) );
      }
   }
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


CardGame.prototype.Deal = function()
{
   console.log( 'Please override virtual function \'CardGame.Deal()\'.' );
}


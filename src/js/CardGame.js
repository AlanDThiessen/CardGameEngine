
/******************************************************************************
 *
 * CardGame Class
 * Constructor
 *
 ******************************************************************************/
function CardGame()
{
   this.isHost    = false;
   this.name      = '';
   this.id        = '';

   this.table     = new Table();
   this.dealer    = new Dealer();
   this.players   = Array();
}


/******************************************************************************
 *
 * CardGame.prototype.Init
 *
 ******************************************************************************/
CardGame.prototype.Init = function( gameSpec, deckSpec )
{
   console.log( 'Initializing game of ' + gameSpec.name );
   console.log( gameSpec );

   // ADT: Temp code to ensure shuffle
   gameSpec.server.isPrimary = 'true';
   
   this.name = gameSpec.server.name;
   this.id = gameSpec.server.id;

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
};


/******************************************************************************
 *
 * CardGame.prototype.StartGame
 *
 ******************************************************************************/
CardGame.prototype.StartGame = function()
{
   if( this.isHost )
   {
      this.Deal();
   }
};


/******************************************************************************
 *
 * CardGame.prototype.CreateDeck
 *
 ******************************************************************************/
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
};


/******************************************************************************
 *
 * CardGame.prototype.CreateSuitedCard
 * 
 ******************************************************************************/
CardGame.prototype.CreateSuitedCard = function( suit, value, count )
{
   return new Card( suit.name,
                    suit.name + ' '+ value.name,
                    suit.shortname + value.shortname,
                    value.rank,
                    suit.color,
                    count );
};


/******************************************************************************
 *
 * CardGame.prototype.CreateNonSuitedCard
 *
 ******************************************************************************/
CardGame.prototype.CreateNonSuitedCard = function( nonSuited, count )
{
   return new Card( nonSuited.name,
                    nonSuited.name,
                    nonSuited.shortname,
                    nonSuited.rank,
                    nonSuited.color,
                    count );
};


/******************************************************************************
 *
 * CardGame.prototype.Deal
 *
 ******************************************************************************/
CardGame.prototype.Deal = function()
{
   console.log( 'Please override virtual function \'CardGame.Deal()\'.' );
};


/******************************************************************************
 *
 * CardGame.prototype.ValidateTransferDest
 *
 ******************************************************************************/
CardGame.prototype.ValidateTransferDest = function( containerId, cardList )
{
   var container  = this.GetContainerById( containerId );
   var valid      = false;


   if( container != undefined )
   {
      valid = container.AcceptGroup( cardList );
   }

   return valid;
};


/******************************************************************************
 *
 * CardGame.prototype.Transfer
 *
 ******************************************************************************/
CardGame.prototype.Transfer = function( fromContainer, toContainer, cardList )
{
   // ADT TODO: perform transfer
   // ADT TODO: Log transfer in sequence log (create sequence log first)
};


/******************************************************************************
 *
 * CardGame.prototype.GetContainerById
 *
 ******************************************************************************/
CardGame.prototype.GetContainerById = function( id )
{
   var   cntr;
   var   returnVal = undefined;


   // Check to see if the dealer has this container
   returnVal = this.dealer.GetContainerById( id );

   if( returnVal == undefined )
   {
      // Otherwise, check if the table has this contianer
      returnVal = this.table.GetContainerById( id );
   }

   // Otherwise, check all the players
   if( returnVal == undefined )
   {
      cntr = 0;

      do
      {
         returnVal = this.players[cntr].GetContainerById( id );
      }
      while( ( cntr < this.players.length ) && ( returnVal == undefined ) )
   }

   return returnVal;
};



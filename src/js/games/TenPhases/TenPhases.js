
function TenPhasesGame()
{
   CardGame.call( this );

   this.table.AddContainer( new CardContainer( 'draw' ) );
   this.table.AddContainer( new CardContainer( 'discard' ) );
}


// Inherit from CardGame
TenPhasesGame.prototype = new CardGame();

// Correct the constructor pointer
TenPhasesGame.prototype.constructor = CardGame;



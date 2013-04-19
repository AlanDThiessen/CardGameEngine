
function TenPhasesGame()
{
}


// Inherit from CardGame
TenPhasesGame.prototype = new CardGame();

// Correct the constructor pointer
TenPhasesGame.prototype.constructor = CardGame;



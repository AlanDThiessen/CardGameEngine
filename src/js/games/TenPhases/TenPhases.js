
function TenPhasesGame()
{
}


// Inherit from CardContainer
TenPhasesGame.prototype = new CardGame();

// Correct the constructor pointer
TenPhasesGame.prototype.constructor = CardGame;


function StartGame()
{
}


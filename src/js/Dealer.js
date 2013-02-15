function Dealer()
{
   CardContainer.call( this, "Dealer" );
}

// Inherit from CardContainer
Dealer.prototype = new CardContainer();

// Correct the constructor pointer
Dealer.prototype.constructor = Dealer;


Dealer.prototype.init = function()
{
}



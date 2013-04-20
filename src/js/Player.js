function Player( id, alias )
{
   this.alias = alias;
   this.score =  0;

   CardContainer.call( this, id );
}

// Inherit from CardContainer
Player.prototype = new CardContainer();

// Correct the constructor pointer
Player.prototype.constructor = Player;


Player.prototype.init = function()
{
};



/******************************************************************************
 *
 * Player Class
 * Constructor
 *
 ******************************************************************************/
function Player( id, alias )
{
   // Call the parent class constructor
   ActiveEntity.call( this, "Player:" + alias );

   this.alias = alias;
   this.score =  0;
   this.rootContainer = new CardContainer( id );
}

//Inherit from ActiveEntity
Player.prototype = new ActiveEntity();
//Correct the constructor pointer
Player.prototype.constructor = Player;

// Inherit from CardContainer
Player.prototype = new CardContainer();
// Correct the constructor pointer
Player.prototype.constructor = Player;


/******************************************************************************
 *
 * Player.prototype.init
 *
 ******************************************************************************/
Player.prototype.init = function()
{
};



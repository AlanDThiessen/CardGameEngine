
var Player = require( "../../Player.js" );


/******************************************************************************
 * States
 ******************************************************************************/
var PLAYER_STATE_IN_GAME   = "InGame";
var PLAYER_STATE_OUT       = "Out";
var PLAYER_STATE_READY     = "Ready";
var PLAYER_STATE_BATTLE    = "Battle";
var PLAYER_STATE_WAIT      = "Wait";
var PLAYER_STATE_WAR       = "War";
var PLAYER_STATE_FLOP      = "Flop";
var PLAYER_STATE_DRAW      = "Draw";


/******************************************************************************
 * CLASS Definition: Simple War Player
 ******************************************************************************/

/******************************************************************************
 *
 * Class: SimpleWarPlayer
 * Inherits From: Player
 * Constructor
 *
 ******************************************************************************/
function SimpleWarPlayer( id, alias )
{
   // Call the parent class constructor
   Player.call( this, id, alias );
   
   // Create the State Machine
   this.AddState( PLAYER_STATE_IN_GAME,   undefined            );
   this.AddState( PLAYER_STATE_OUT,       undefined            );
   this.AddState( PLAYER_STATE_READY,     PLAYER_STATE_IN_GAME );
   this.AddState( PLAYER_STATE_BATTLE,    PLAYER_STATE_IN_GAME );
   this.AddState( PLAYER_STATE_WAIT,      PLAYER_STATE_IN_GAME );
   this.AddState( PLAYER_STATE_WAR,       PLAYER_STATE_IN_GAME );
   this.AddState( PLAYER_STATE_FLOP,      PLAYER_STATE_WAR     );
   this.AddState( PLAYER_STATE_DRAW,      PLAYER_STATE_WAR     );

   this.SetInitialState( PLAYER_STATE_READY );
};

//Inherit from ActiveEntity
SimpleWarPlayer.prototype = new Player();
//Correct the constructor pointer
SimpleWarPlayer.prototype.constructor = SimpleWarPlayer;

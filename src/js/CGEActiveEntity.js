
var CGEState      = require( "./CGEState.js" );
var ActiveEntity  = require( "./ActiveEntity.js" );

/******************************************************************************
 *  CLASS: CGEActiveEntity
 ******************************************************************************/

/******************************************************************************
 *
 * Class: CGEActiveEntity
 * Constructor
 *
 ******************************************************************************/
function CGEActiveEntity( owner, name, parent )
{
   ActiveEntity.call( this, owner, name, parent );
};


//Inherit from ActiveEntity
CGEActiveEntity.prototype = new ActiveEntity();
//Correct the constructor pointer
CGEActiveEntity.prototype.constructor = CGEActiveEntity;


CGEActiveEntity.prototype.AddState = function( name, parentName )
{
   ActiveEntity.call( this, name, parentName );
};

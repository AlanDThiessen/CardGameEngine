
var State = require( "./State.js" );

/******************************************************************************
 *  CLASS: CGEState
 ******************************************************************************/

/******************************************************************************
 *
 * Class: CGEState
 * Constructor
 *
 ******************************************************************************/
function CGEState( owner, name, parent )
{
   State.call( this, owner, name, parent );

   // Array of definition names that are valid for this state
   this.validTransitions = Array();
};


//Inherit from State
CGEState.prototype = new State();
//Correct the constructor pointer
CGEState.prototype.constructor = CGEState;


CGEState.prototype.AddTransitionDefinition = function( transDefName )
{
   this.validTransitions.push( transDefName );
};


CGEState.prototype.IsTransitionValid = function( transDefName )
{
   isValid = false;

   if( this.validTransitions.indexOf( transDefName ) != -1 )
   {
      isValid = true;
   }
   else if( this.parent != undefined )
   {
      isValid = this.parent.IsTransitionValid( transDefName );
   }
   
   return isValid;
};

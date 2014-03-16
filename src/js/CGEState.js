
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
   this.validTransactions = Array();
};


//Inherit from State
CGEState.prototype = new State();
//Correct the constructor pointer
CGEState.prototype.constructor = CGEState;


CGEState.prototype.AddValidTransaction = function( transDefName )
{
   this.validTransactions.push( transDefName );
};


CGEState.prototype.IsTransactionValid = function( transDefName )
{
   isValid = false;

   if( this.validTransactions.indexOf( transDefName ) != -1 )
   {
      isValid = true;
   }
   else if( this.parent != undefined )
   {
      isValid = this.parent.IsTransactionValid( transDefName );
   }

   return isValid;
};

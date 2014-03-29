var State = require("./State.js");

/*******************************************************************************
 * CLASS: CGEState
 ******************************************************************************/

/*******************************************************************************
 * 
 * Class: CGEState Constructor
 * 
 ******************************************************************************/
function CGEState(owner, name, parent) {
   State.call(this, owner, name, parent);

   // Array of definition names that are valid for this state
   this.validTransactions = Array();
};

CGEState.prototype = new State();
CGEState.prototype.constructor = CGEState;

/*******************************************************************************
 * 
 * CGEState.prototype.AddValidTransaction
 * 
 * This method adds the name of the specified transaction definition to the
 * list of transactions that are valid in this state.
 * 
 ******************************************************************************/
CGEState.prototype.AddValidTransaction = function(transDefName) {
   this.validTransactions.push(transDefName);
};

/*******************************************************************************
 * 
 * CGEState.prototype.IsTransactionValid
 * 
 * This method checks the list of transaction definition names for this state
 * to see if the specified transDefName is valid.
 * 
 * Note: This method is recursive.  Parent states are checked as well.
 * 
 ******************************************************************************/
CGEState.prototype.IsTransactionValid = function(transDefName) {
   var isValid = false;

   if (this.validTransactions.indexOf(transDefName) != -1) {
      isValid = true;
   } else if (    (this.parent != undefined)
               && (this.parent.IsTransactionValid != undefined)) {
      isValid = this.parent.IsTransactionValid(transDefName);
   }

   return isValid;
};

module.exports = CGEState;

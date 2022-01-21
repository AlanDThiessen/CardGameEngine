
var CGEState = require("./CGEState.js");
var ActiveEntity = require("./ActiveEntity.js");
var CardContainer = require("./CardContainer.js");
var TransDef = require("./TransactionDefinition.js");

var TransactionDefinition = TransDef.TransactionDefinition;
var AddTransactionDefinition = TransDef.AddTransactionDefinition;
var GetTransactionDefinition = TransDef.GetTransactionDefinition;
var TRANSACTION_TYPE_INBOUND = TransDef.TRANSACTION_TYPE_INBOUND;
var TRANSACTION_TYPE_OUTBOUND = TransDef.TRANSACTION_TYPE_OUTBOUND;

/*******************************************************************************
 * CLASS: CGEActiveEntity
 ******************************************************************************/

/*******************************************************************************
 * 
 * Class: CGEActiveEntity Constructor
 * 
 ******************************************************************************/
function CGEActiveEntity(owner, name, parent) {
   ActiveEntity.call(this, owner, name, parent);

   this.rootContainer = new CardContainer(name);
}

CGEActiveEntity.prototype = new ActiveEntity();
CGEActiveEntity.prototype.constructor = CGEActiveEntity;

/*******************************************************************************
 * 
 * CGEActiveEntity.prototype.AddContainer
 * 
 * This method adds a container with the specified name, minimum number of cards,
 * and maximum number of cards to the container specified by 'parent'.  If
 * parent is undefined, then it adds it to the root container.
 * 
 ******************************************************************************/
CGEActiveEntity.prototype.AddContainer = function(name, parent, minCards, maxCards) {
   var parentContainer;
   var container = new CardContainer(name, minCards, maxCards);

   if (parent !== undefined) {
      parentContainer = this.rootContainer.GetContainerById(parent);
   } else {
      parentContainer = this.rootContainer;
   }

   parentContainer.AddContainer(container);

   return container;
};

/*******************************************************************************
 * 
 * CGEActiveEntity.prototype.AddState
 * 
 * This method adds a CGEState substate to the state with the specified parent
 * name.  If the parentName is undefined, then the state is added as a top state
 * 
 ******************************************************************************/
CGEActiveEntity.prototype.AddState = function(name, parentName) {
   var parent;

   if (parentName !== undefined) {
      parent = this.topState.FindState(parentName, true);
   }

   // If we didn't find the state name, or it's undefined, then set the topState
   // as the parent of the new state.
   if (parent === undefined) {
      parent = this.topState;
   }

   // For now, assume they are valid
   var state = new CGEState(this, name, parent);
   parent.AddState(state);

   return (state);
};

/*******************************************************************************
 * 
 * CGEActiveEntity.prototype.AddValidTransaction
 * 
 * This method adds the specified transaction defintion to the specified state.
 * If the state is undefined, then the transaction definition is not added
 * 
 ******************************************************************************/
CGEActiveEntity.prototype.AddValidTransaction = function(stateName, transDefName) {
   var state;

   if (stateName !== undefined) {
      state = this.topState.FindState(stateName, true);
   }

   if (state !== undefined) {
      state.AddValidTransaction(transDefName);
   }
};

/*******************************************************************************
 * 
 * CGEActiveEntity.prototype.IsTransactionValid
 * 
 * This method checks to see if the specified transaction definition is in the
 * list of valid transactions for the current state.
 * 
 * Note: This is recursive.  If it is valid in a state, then it is valid in all
 * of that state's substates as well.
 * 
 ******************************************************************************/
CGEActiveEntity.prototype.IsTransactionValid = function(transDefName) {
   var isValid = false;

   if (this.currentState !== undefined) {
      isValid = this.currentState.IsTransactionValid(transDefName);
   }

   return isValid;
};

/*******************************************************************************
 * 
 * CGEActiveEntity.prototype.ExecuteTransaction
 * 
 * This method executes the specified transaction given the name, the list of
 * cards to transfer, and the array of cards.
 * 
 ******************************************************************************/
CGEActiveEntity.prototype.ExecuteTransaction = function(transName, cardList, cards) {
   var success = false;
   var toContainer;
   var fromContainer;

   // First, make sure the transaction is valid in this state or any parent states
   if (this.IsTransactionValid(transName)) {
      var transDef = GetTransactionDefinition(transName);

      if (transDef !== undefined) {
         if (transDef.fromContainerName == TRANSACTION_TYPE_INBOUND) {
            // The Transaction is inbound, meaning take cards from the provided
            // cards array parameter and send them to the container specified
            // by the transaction.
            toContainer = this.rootContainer.GetContainerById(transDef.toContainerName);

            if (toContainer !== undefined) {
               toContainer.AddGroup(cards, transDef.location);
               success = true;
            }
         } else if (transDef.toContainerName == TRANSACTION_TYPE_OUTBOUND) {
            // The Transaction is outbound, meaning take cards from the
            // container specified by the transaction and place them in the 
            // cards array parameter
            fromContainer = this.rootContainer.GetContainerById(transDef.fromContainerName);

            if (fromContainer !== undefined) {
               fromContainer.GetGroup(cards, cardList);
               success = true;
            }
         } else {
            // If the transaction is neither inbound or outbound, then it is
            // between two containers within this active entity.
            toContainer = this.rootContainer.GetContainerById(transDef.toContainerName);
            fromContainer = this.rootContainer.GetContainerById(transDef.fromContainerName);
            var cardArray = Array();

            if ((toContainer !== undefined) && (fromContainer !== undefined)) {
               fromContainer.GetGroup(cardArray, cardList);
               toContainer.AddGroup(cardArray, transDef.location);
               success = true;
            }
         }
      }
   }

   return success;
};

module.exports = CGEActiveEntity;

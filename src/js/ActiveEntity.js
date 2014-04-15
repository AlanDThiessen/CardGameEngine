/*******************************************************************************
 * NodeJS stuff
 ******************************************************************************/
var State = require("./State.js");
var log = require("./Logger.js");

var TOP_STATE = "TOP";

/*******************************************************************************
 * CLASS: ActiveEntity
 ******************************************************************************/

/*******************************************************************************
 * 
 * Class: ActiveEntity Constructor
 * 
 ******************************************************************************/
function ActiveEntity(name) {
   this.name = name;
   this.initial = undefined;
   this.currentState = undefined;
   this.topState = new State(this, this.name);
}

/*******************************************************************************
 * 
 * ActiveEntity.prototype.AddState
 * 
 * This method creates a state, and adds it to the parent state. If the parent
 * state is not defined, then the state is added to the topState.
 * 
 ******************************************************************************/
ActiveEntity.prototype.AddState = function(name, parentName) {
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
   var state = new State(this, name, parent);
   parent.AddState(state);

   return (state);
};

ActiveEntity.prototype.AddEventHandler = function(stateName, eventId, routine) {
   var state = this.topState.FindState(stateName, true);

   if (state !== undefined) {
      log.debug("Adding event handler for event %d to state %s", eventId, state.name);
      state.AddEventHandler(eventId, routine);
   }
};

ActiveEntity.prototype.SetEnterRoutine = function(stateName, routine) {
   var state = this.topState.FindState(stateName, true);

   if (state !== undefined) {
      state.SetEnterRoutine(routine);
   }
};

ActiveEntity.prototype.SetExitRoutine = function(stateName, routine) {
   var state = this.topState.FindState(stateName, true);

   if (state !== undefined) {
      state.SetExitRoutine(routine);
   }
};

/*******************************************************************************
 * 
 * ActiveEntity.prototype.SetInitialState
 * 
 * This method sets the initial state of the Active Entity (i.e. the initial
 * substate of the topState)
 * 
 ******************************************************************************/
ActiveEntity.prototype.SetInitialState = function(initialStateName, parentName) {
   var state;

   if (parentName !== undefined) {
      state = this.topState.FindState(parentName, true);
   } else {
      state = this.topState;
   }

   state.SetInitialState(initialStateName);
};

/*******************************************************************************
 * 
 * ActiveEntity.prototype.Start
 * 
 * This method starts the state machine. i.e. It performs the initial transition
 * to the topState. Note: If the topState does not have an initial substate
 * defined, then the state machine is never really started.
 * 
 ******************************************************************************/
ActiveEntity.prototype.Start = function() {
   log.debug("Start: transition to %s", this.name);
   this.currentState = this.topState;
   this.Transition(this.name);
};

/*******************************************************************************
 * 
 * ActiveEntity.prototype.HandleEvent
 * 
 ******************************************************************************/
ActiveEntity.prototype.HandleEvent = function(eventId, data) {
   if (this.currentState !== undefined) {
      this.currentState.HandleEvent(eventId, data);
   }
};

/*******************************************************************************
 * 
 * ActiveEntity.prototype.Transition
 * 
 * This method performs a recursive transition from the current state to the
 * specified destination state.
 * 
 ******************************************************************************/
ActiveEntity.prototype.Transition = function(destStateName) {
   var destAncestors = Array();
   var srcAncestors = Array();
   var found;
   var lcAncestor = this.name; // The Lowest Common Ancestor
   var destState = this.topState.FindState(destStateName, true);

   log.debug("Transition: %s -> %s; ", this.currentState.name, destStateName);

   if (destState !== undefined) {
      // If we are coming from outside the destination state, then we need to
      // change the destination state to the initial substate.
      while ((!destState.inState) && (destState.initial !== undefined)) {
         destState = destState.initial;
      }

      // First, get the ancestors of the source and destination states.
      destState.GetAncestors(destAncestors);
      this.currentState.GetAncestors(srcAncestors);

      log.debug(destAncestors);
      log.debug(srcAncestors);

      // Now, iterate from the bottom of the source ancestor list to find the
      // Lowest common denominator of both states.
      // The first one popped off the list should be current state.
      found = -1;
      while ((found == -1) && srcAncestors.length) {
         lcAncestor = srcAncestors.pop();
         found = destAncestors.indexOf(lcAncestor);
      }

      log.debug("Common Ancestor: %s", lcAncestor);

      // Did we find a common ancestor?
      if (found != -1) {
         // Exit the current state, all the way up to the common ancestor
         this.currentState.ExitState(lcAncestor);

         // TODO: If/when we add transition actions, we need to perform it
         // between states

         // Update our current state variable
         this.currentState = destState;

         // Now, Enter the destination state, all the way from the common
         // ancestor
         destState.EnterState(lcAncestor);
      } else {
         // We should never get here because every state should have the
         // topState as it's ancestor
         log.error("Could not find common ancestor state");
      }
   } else {
      log.error("Transition to undefined state in ActiveEntity: %s", this.name);
   }
};

module.exports = ActiveEntity;

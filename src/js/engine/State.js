/*******************************************************************************
 * NodeJS stuff
 ******************************************************************************/
var log = require('./Logger.js');

/*******************************************************************************
 * CLASS: State
 ******************************************************************************/

/*******************************************************************************
 * 
 * Class: State Constructor
 * 
 ******************************************************************************/
function State(owner, name, parent) {
   this.name = name;
   this.owner = owner;
   this.parent = parent;
   this.inState = false;
   this.initial = undefined;
   this.enter = undefined;
   this.exit = undefined;
   this.states = Array();
   this.handlers = {};

   // Logging/Debug
   var ancestorList = Array();
   this.GetAncestors(ancestorList);
   log.debug("Created New State: %s", ancestorList.join(':'));
}

/*******************************************************************************
 * 
 * State.prototype.AddState
 * 
 ******************************************************************************/
State.prototype.AddState = function(state) {
   this.states.push(state);
};

/*******************************************************************************
 * 
 * State.prototype.AddEventHandler
 * 
 ******************************************************************************/
State.prototype.AddEventHandler = function(eventId, routine) {
   // TODO: Need to verify routine is a real function
   this.handlers[eventId] = routine;
};

/*******************************************************************************
 * 
 * State.prototype.SetInitialState
 * 
 ******************************************************************************/
State.prototype.SetInitialState = function(stateName) {
   var state = this.FindState(stateName, true);

   if (state !== undefined) {
      log.debug("State %s: Initial State set to %s", this.name, state.name);
      this.initial = state;
   }
};

/*******************************************************************************
 * 
 * State.prototype.SetEnterRoutine
 * 
 ******************************************************************************/
State.prototype.SetEnterRoutine = function(routine) {
   // TODO: Need to verify this is a valid routine
   this.enter = routine;
};

/*******************************************************************************
 * 
 * State.prototype.SetExitRoutine
 * 
 ******************************************************************************/
State.prototype.SetExitRoutine = function(routine) {
   // TODO: Need to verify this is a valid routine
   this.exit = routine;
};

/*******************************************************************************
 * 
 * State.prototype.EnterState
 * 
 * This method performs recursive entrance to this state, starting with the
 * common ancestor (the common ancestor is not entered).
 * 
 ******************************************************************************/
State.prototype.EnterState = function(commonAncestor) {
   // If we are the common ancestor, then our state doesn't get entered
   if (commonAncestor != this.name) {
      // First, enter our parent state
      if (this.parent !== undefined) {
         this.parent.EnterState(commonAncestor);
      }

      this.inState = true;

      log.debug("Enter State: %s", this.name);

      if (this.enter !== undefined) {
         this.enter.call(this.owner);
      }
   }
};

/*******************************************************************************
 * 
 * State.prototype.ExitState
 * 
 * This method performs recursive exit from this state, all the way up to the
 * common ancestor (the common ancestor is not exited).
 * 
 ******************************************************************************/
State.prototype.ExitState = function(commonAncestor) {
   // If we are the common ancestor, then our state doesn't get exited.
   if (commonAncestor != this.name) {
      log.debug("Exit State: %s", this.name);

      this.inState = false;

      if (this.exit !== undefined) {
         this.exit.call(this.owner);
      }

      // Now, attempt to exit our parent state
      if (this.parent !== undefined) {
         this.parent.ExitState(commonAncestor);
      }
   }
};

/*******************************************************************************
 * 
 * State.prototype.HandleEvent
 * 
 ******************************************************************************/
State.prototype.HandleEvent = function(eventId, data) {
   var eventHandled = false;

   if (this.handlers.hasOwnProperty(eventId)) {
      eventHandled = this.handlers[eventId].call(this.owner, eventId, data);
   }

   // We didn't handle the event, so pass it to our parent state
   if ((eventHandled === false) && (this.parent !== undefined)) {
      this.parent.HandleEvent(eventId, data);
   }
};

/*******************************************************************************
 * 
 * State.prototype.GetAncestors
 * 
 * This method builds a top -> down list of ancestors to this state
 * 
 ******************************************************************************/
State.prototype.GetAncestors = function(ancestorList) {
   // TODO: Verify ancestorList is an array

   // First, get our parent state
   if (this.parent !== undefined) {
      this.parent.GetAncestors(ancestorList);
   }

   // Finally, put our name on the list
   ancestorList.push(this.name);
};

/*******************************************************************************
 * 
 * State.prototype.FindState
 * 
 ******************************************************************************/
State.prototype.FindState = function(name, goDeep) {
   var stateFound;

   if (goDeep === undefined) {
      goDeep = false;
   }

   if (name == this.name) {
      stateFound = this;
   } else {
      for ( var cntr = 0; cntr < this.states.length; cntr++) {
         if (this.states[cntr].name == name) {
            stateFound = this.states[cntr];
            break;
         }
      }

      if (goDeep && (stateFound === undefined)) {
         cntr = 0;

         while (!stateFound && (cntr < this.states.length)) {
            stateFound = this.states[cntr].FindState(name, true);
            cntr++;
         }
      }
   }

   return (stateFound);
};

module.exports = State;

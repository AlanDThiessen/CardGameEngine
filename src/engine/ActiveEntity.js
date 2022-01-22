/******************************************************************************
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2022 Alan Thiessen
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 ******************************************************************************/

'use strict';

const State = require("./State.js");
const log = require("../utils/Logger.js");

let TOP_STATE = "TOP";

class ActiveEntity {
   constructor(name) {
      this.name = name;
      this.initial = undefined;
      this.currentState = undefined;
      this.topState = new State(this, this.name);
   }

   /*******************************************************************************
    * This method creates a state, and adds it to the parent state. If the parent
    * state is not defined, then the state is added to the topState.
    ******************************************************************************/
   AddState(name, parentName) {
      let parent;

      if(parentName !== undefined) {
         parent = this.topState.FindState(parentName, true);
      }

      // If we didn't find the state name, or it's undefined, then set the topState
      // as the parent of the new state.
      if(parent === undefined) {
         parent = this.topState;
      }

      // For now, assume they are valid
      let state = new State(this, name, parent);
      parent.AddState(state);

      return (state);
   }

   AddEventHandler(stateName, eventId, routine) {
      let state = this.topState.FindState(stateName, true);

      if(state !== undefined) {
         log.debug("Adding event handler for event %d to state %s", eventId, state.name);
         state.AddEventHandler(eventId, routine);
      }
   }

   SetEnterRoutine(stateName, routine) {
      let state = this.topState.FindState(stateName, true);

      if(state !== undefined) {
         state.SetEnterRoutine(routine);
      }
   }

   SetExitRoutine(stateName, routine) {
      let state = this.topState.FindState(stateName, true);

      if(state !== undefined) {
         state.SetExitRoutine(routine);
      }
   }

   /*******************************************************************************
    * This method sets the initial state of the Active Entity (i.e. the initial
    * substate of the topState)
    ******************************************************************************/
   SetInitialState(initialStateName, parentName) {
      let state;

      if(parentName !== undefined) {
         state = this.topState.FindState(parentName, true);
      }
      else {
         state = this.topState;
      }

      state.SetInitialState(initialStateName);
   }

   /*******************************************************************************
    * This method starts the state machine. i.e. It performs the initial transition
    * to the topState. Note: If the topState does not have an initial substate
    * defined, then the state machine is never really started.
    ******************************************************************************/
   Start() {
      log.debug("Start: transition to %s", this.name);
      this.currentState = this.topState;
      this.Transition(this.name);
   }

   HandleEvent(eventId, data) {
      if(this.currentState !== undefined) {
         this.currentState.HandleEvent(eventId, data);
      }
   }

   /*******************************************************************************
    * This method performs a recursive transition from the current state to the
    * specified destination state.
    ******************************************************************************/
   Transition(destStateName) {
      let destAncestors = Array();
      let srcAncestors = Array();
      let found;
      let lcAncestor = this.name; // The Lowest Common Ancestor
      let destState = this.topState.FindState(destStateName, true);

      log.debug("Transition: %s -> %s; ", this.currentState.name, destStateName);

      if(destState !== undefined) {
         // If we are coming from outside the destination state, then we need to
         // change the destination state to the initial substate.
         while((!destState.inState) && (destState.initial !== undefined)) {
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

         while((found === -1) && srcAncestors.length) {
            lcAncestor = srcAncestors.pop();
            found = destAncestors.indexOf(lcAncestor);
         }

         log.debug("Common Ancestor: %s", lcAncestor);

         // Did we find a common ancestor?
         if(found !== -1) {
            // Exit the current state, all the way up to the common ancestor
            this.currentState.ExitState(lcAncestor);

            // TODO: If/when we add transition actions, we need to perform it
            // between states

            // Update our current state variable
            this.currentState = destState;

            // Now, Enter the destination state, all the way from the common
            // ancestor
            destState.EnterState(lcAncestor);
         }
         else {
            // We should never get here because every state should have the
            // topState as it's ancestor
            log.error("Could not find common ancestor state");
         }
      }
      else {
         log.error("Transition to undefined state in ActiveEntity: %s", this.name);
      }
   }
}

module.exports = ActiveEntity;

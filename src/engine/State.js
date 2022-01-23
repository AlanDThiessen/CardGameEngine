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

const log = require('../utils/Logger.js');

class State {
   constructor(owner, name, parent) {
      this.name = name;
      this.owner = owner;
      this.parent = parent;
      this.inState = false;
      this.initial = undefined;
      this.enter = undefined;
      this.exit = undefined;
      this.states = [];
      this.handlers = {};

      // Logging/Debug
      let ancestorList = [];
      this.GetAncestors(ancestorList);
      log.debug("Created New State: %s", ancestorList.join(':'));
   }

   AddState(state) {
      this.states.push(state);
   }

   AddEventHandler(eventId, routine) {
      // TODO: Need to verify routine is a real function
      this.handlers[eventId] = routine;
   }

   SetInitialState(stateName) {
      let state = this.FindState(stateName, true);

      if(state !== undefined) {
         log.debug("State %s: Initial State set to %s", this.name, state.name);
         this.initial = state;
      }
   }

   SetEnterRoutine(routine) {
      // TODO: Need to verify this is a valid routine
      this.enter = routine;
   }

   SetExitRoutine(routine) {
      // TODO: Need to verify this is a valid routine
      this.exit = routine;
   }

   /*******************************************************************************
    *
    * State.prototype.EnterState
    *
    * This method performs recursive entrance to this state, starting with the
    * common ancestor (the common ancestor is not entered).
    *
    ******************************************************************************/
   EnterState(commonAncestor) {
      // If we are the common ancestor, then our state doesn't get entered
      if(commonAncestor !== this.name) {
         // First, enter our parent state
         if(this.parent !== undefined) {
            this.parent.EnterState(commonAncestor);
         }

         this.inState = true;
         log.debug("Enter State: %s", this.name);

         if(this.enter !== undefined) {
            this.enter.call(this.owner);
         }
      }
   }

   /*******************************************************************************
    *
    * State.prototype.ExitState
    *
    * This method performs recursive exit from this state, all the way up to the
    * common ancestor (the common ancestor is not exited).
    *
    ******************************************************************************/
   ExitState(commonAncestor) {
      // If we are the common ancestor, then our state doesn't get exited.
      if(commonAncestor !== this.name) {
         log.debug("Exit State: %s", this.name);

         this.inState = false;

         if(this.exit !== undefined) {
            this.exit.call(this.owner);
         }

         // Now, attempt to exit our parent state
         if(this.parent !== undefined) {
            this.parent.ExitState(commonAncestor);
         }
      }
   }

   HandleEvent(eventId, data) {
      let eventHandled = false;

      if(this.handlers.hasOwnProperty(eventId)) {
         eventHandled = this.handlers[eventId].call(this.owner, eventId, data);
      }

      // We didn't handle the event, so pass it to our parent state
      if((eventHandled === false) && (this.parent !== undefined)) {
         this.parent.HandleEvent(eventId, data);
      }
   }

   GetAncestors(ancestorList) {
      // TODO: Verify ancestorList is an array

      // First, get our parent state
      if(this.parent !== undefined) {
         this.parent.GetAncestors(ancestorList);
      }

      // Finally, put our name on the list
      ancestorList.push(this.name);
   }


   FindState(name, goDeep) {
      let stateFound;

      if(goDeep === undefined) {
         goDeep = false;
      }

      if(name === this.name) {
         stateFound = this;
      }
      else {
         for(let cntr = 0; cntr < this.states.length; cntr++) {
            if(this.states[cntr].name === name) {
               stateFound = this.states[cntr];
               break;
            }
         }

         if(goDeep && (stateFound === undefined)) {
            let cntr = 0;

            while(!stateFound && (cntr < this.states.length)) {
               stateFound = this.states[cntr].FindState(name, true);
               cntr++;
            }
         }
      }

      return(stateFound);
   }
}

module.exports = State;

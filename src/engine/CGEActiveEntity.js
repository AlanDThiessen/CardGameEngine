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

const CGEState = require("./CGEState.js");
const ActiveEntity = require("./ActiveEntity.js");
const CardContainer = require("./CardContainer.js");
const TransDef = require("./TransactionDefinition.js");

const TransactionDefinition = TransDef.TransactionDefinition;
const AddTransactionDefinition = TransDef.AddTransactionDefinition;
const GetTransactionDefinition = TransDef.GetTransactionDefinition;
const TRANSACTION_TYPE_INBOUND = TransDef.TRANSACTION_TYPE_INBOUND;
const TRANSACTION_TYPE_OUTBOUND = TransDef.TRANSACTION_TYPE_OUTBOUND;

class CGEActiveEntity extends ActiveEntity {
   constructor(owner, name, parent) {
      super(owner, name, parent);

      this.rootContainer = new CardContainer(name);
   }

   /*******************************************************************************
    * This method adds a container with the specified name, minimum number of cards,
    * and maximum number of cards to the container specified by 'parent'.  If
    * parent is undefined, then it adds it to the root container.
    ******************************************************************************/
   AddContainer(name, parent, minCards, maxCards) {
      let parentContainer;
      let container = new CardContainer(name, minCards, maxCards);

      if(parent !== undefined) {
         parentContainer = this.rootContainer.GetContainerById(parent);
      }
      else {
         parentContainer = this.rootContainer;
      }

      parentContainer.AddContainer(container);

      return container;
   }

   /*******************************************************************************
    * This method adds a CGEState substate to the state with the specified parent
    * name.  If the parentName is undefined, then the state is added as a top state
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
      let state = new CGEState(this, name, parent);
      parent.AddState(state);

      return (state);
   }

   /*******************************************************************************
    * This method adds the specified transaction defintion to the specified state.
    * If the state is undefined, then the transaction definition is not added
    ******************************************************************************/
   AddValidTransaction(stateName, transDefName) {
      let state;

      if(stateName !== undefined) {
         state = this.topState.FindState(stateName, true);
      }

      if(state !== undefined) {
         state.AddValidTransaction(transDefName);
      }
   }

   /*******************************************************************************
    * This method checks to see if the specified transaction definition is in the
    * list of valid transactions for the current state.
    *
    * Note: This is recursive.  If it is valid in a state, then it is valid in all
    * of that state's substates as well.
    ******************************************************************************/
   IsTransactionValid(transDefName) {
      let isValid = false;

      if(this.currentState !== undefined) {
         isValid = this.currentState.IsTransactionValid(transDefName);
      }

      return isValid;
   }

   /*******************************************************************************
    * This method executes the specified transaction given the name, the list of
    * cards to transfer, and the array of cards.
    ******************************************************************************/
   ExecuteTransaction(transName, cardList, cards) {
      let numCards = 0;
      let toContainer;
      let fromContainer;

      // First, make sure the transaction is valid in this state or any parent states
      if(this.IsTransactionValid(transName)) {
         let transDef = GetTransactionDefinition(transName);

         if(transDef !== undefined) {
            if(transDef.fromContainerName === TRANSACTION_TYPE_INBOUND) {
               // The Transaction is inbound, meaning take cards from the provided
               // cards array parameter and send them to the container specified
               // by the transaction.
               toContainer = this.rootContainer.GetContainerById(transDef.toContainerName);

               if(toContainer !== undefined) {
                  numCards = toContainer.AddGroup(cards, transDef.location);
               }
            }
            else if(transDef.toContainerName === TRANSACTION_TYPE_OUTBOUND) {
               // The Transaction is outbound, meaning take cards from the
               // container specified by the transaction and place them in the
               // cards array parameter
               fromContainer = this.rootContainer.GetContainerById(transDef.fromContainerName);

               if(fromContainer !== undefined) {
                  numCards = fromContainer.GetGroup(cards, cardList);
               }
            }
            else {
               // If the transaction is neither inbound or outbound, then it is
               // between two containers within this active entity.
               toContainer = this.rootContainer.GetContainerById(transDef.toContainerName);
               fromContainer = this.rootContainer.GetContainerById(transDef.fromContainerName);
               let cardArray = [];

               if((toContainer !== undefined) && (fromContainer !== undefined)) {
                  numCards  = fromContainer.GetGroup(cardArray, cardList);
                  toContainer.AddGroup(cardArray, transDef.location);
               }
            }
         }
      }

      return numCards;
   }
}

module.exports = CGEActiveEntity;

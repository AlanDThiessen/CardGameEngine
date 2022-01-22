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

class CGEState extends State {
   constructor(owner, name, parent) {
      super(owner, name, parent);

      // Array of definition names that are valid for this state
      this.validTransactions = [];
   }

   /*******************************************************************************
    * This method adds the name of the specified transaction definition to the
    * list of transactions that are valid in this state.
    ******************************************************************************/
   AddValidTransaction(transDefName) {
      this.validTransactions.push(transDefName);
   }

   /*******************************************************************************
    * This method checks the list of transaction definition names for this state
    * to see if the specified transDefName is valid.
    *
    * Note: This method is recursive.  Parent states are checked as well.
    ******************************************************************************/
   IsTransactionValid(transDefName) {
      let isValid = false;

      if(this.validTransactions.indexOf(transDefName) !== -1) {
         isValid = true;
      }
      else if((this.parent !== undefined) &&
              (this.parent.IsTransactionValid !== undefined)) {
         isValid = this.parent.IsTransactionValid(transDefName);
      }

      return isValid;
   }
}

module.exports = CGEState;

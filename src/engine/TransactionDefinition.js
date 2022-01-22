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

/******************************************************************************
 * Global array of Transaction Definitions
 ******************************************************************************/
let TransactionDefs = [];

function AddTransactionDefinition(name, from, to, minCards, maxCards, location) {
   if(GetTransactionDefinition(name) === undefined) {
      TransactionDefs.push(new TransactionDefinition(name, from, to, minCards, maxCards, location));
   }
}

function GetTransactionDefinition(name) {
   let transDef;

   for(let cntr = 0; cntr < TransactionDefs.length; cntr++) {
      if(TransactionDefs[cntr].name == name) {
         transDef = TransactionDefs[cntr];
         break;
      }
   }

   return transDef;
}

let TRANSACTION_TYPE_INBOUND  = "InBound";
let TRANSACTION_TYPE_OUTBOUND = "Outbound";


class TransactionDefinition {
   constructor(name, from, to, minCards, maxCards, location) {
      this.name = name;
      this.fromContainerName = from;
      this.toContainerName = to;
      this.minCards = minCards;
      this.maxCards = maxCards;
      this.location = location;
   }
}

module.exports = {
   TransactionDefinition: TransactionDefinition,
   AddTransactionDefinition: AddTransactionDefinition,
   GetTransactionDefinition: GetTransactionDefinition,
   TRANSACTION_TYPE_INBOUND: TRANSACTION_TYPE_INBOUND,
   TRANSACTION_TYPE_OUTBOUND: TRANSACTION_TYPE_OUTBOUND
};

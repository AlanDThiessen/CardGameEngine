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

class CardGroup {
   constructor() {
      this.cards = []
   }

   AddCard(card) {
      this.cards.push(card);
   }

   Empty() {
      this.cards = [];
   }

   GetCard(cardId) {
      let card;

      if(cardId === "TOP") {
         card = this.cards.shift();
      }
      else if(cardId === "BOTTOM") {
         card = this.cards.pop();
      }

      return card;
   }

   NumCards() {
      return this.cards.length;
   }

   GetList() {
      let cardList = [];

      for(let cntr = 0; cntr < this.cards.length; cntr++) {
         cardList.push(this.cards[cntr].shortName);
      }

      return cardList;
   }

   PrintCards() {
      let i;

      log.info("CGroup : ****************************************");
      log.info("CGroup :    '" + this.id + "' holds " + this.cards.length + ' cards ');

      for(i = 0; i < this.cards.length; i++) {
         this.cards[i].Print();
      }

      log.info("CGroup : ****************************************");
   }

   SortRank(order) {
      if(!defined(order)) {
         order = 'ascending';
      }

      if(order.toLowerCase() === 'ascending') {
         this.cards.sort(function (a, b) {
            return a.rank - b.rank;
         });
      }
      else {
         this.cards.sort(function (a, b) {
            return b.rank - a.rank;
         });
      }
   }

   SortSuit(order) {
      if(!defined(order)) {
         order = 'ascending';
      }

      if(order.toLowerCase() === 'ascending') {
         this.cards.sort(function (a, b) {
            if(a.suit < b.suit) {
               return -1;
            }
            else if(a.suit > b.suit) {
               return 1;
            }
            else {
               return 0;
            }
         });
      }
      else {
         this.cards.sort(function (a, b) {
            if(b.suit < a.suit) {
               return -1;
            }
            else if(b.suit > a.suit) {
               return 1;
            }
            else {
               return 0;
            }
         });
      }
   }

   SortSuitRank(order) {
      if(!defined(order)) {
         order = 'ascending';
      }

      if(order.toLowerCase() === 'ascending') {
         this.cards.sort(function (a, b) {
            if(a.suit < b.suit) {
               return -1;
            }
            else if(a.suit > b.suit) {
               return 1;
            }
            else {
               return a.rank - b.rank;
            }
         });
      }
      else {
         this.cards.sort(function (a, b) {
            if(b.suit < a.suit) {
               return -1;
            }
            else if(b.suit > a.suit) {
               return 1;
            }
            else {
               return b.rank - a.rank;
            }
         });
      }
   }

   Shuffle() {
      let numCards = this.cards.length;   // The number of cards in the group
      let numIter = numCards * 5;         // The number of iterations to move cards
      let fromPos;                        // From position
      let toPos;                          // To position

      while(numIter > 0) {
         fromPos = Math.floor(Math.random() * numCards);
         toPos = Math.floor(Math.random() * numCards);

         // Move a card from the from position to the to position
         this.cards.splice(toPos, 0, this.cards.splice(fromPos, 1)[0]);

         numIter--;
      }
   }
}

module.exports = CardGroup;

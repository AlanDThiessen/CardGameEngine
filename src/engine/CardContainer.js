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

const CardGroup = require("./CardGroup.js");
const log = require('../utils/Logger.js');

class CardContainer extends CardGroup {
    constructor(id, minCards = 0, maxCards = 0) {
        super();

        this.id = id;
        this.containers = [];
        this.minCards = minCards;
        this.maxCards = maxCards;
    }

    AddGroup(group, location) {
        let numCards = 0;

        if (this.AcceptGroup(group) === true) {
            numCards = group.length;

            while (group.length) {
                this.cards.splice(this.cards.length, 0, group.shift());
            }
        }

        return numCards;
    }

    AddContainer(container) {
        this.containers.push(container);
    }

    CanGetGroup(cardList) {
        // ADT TODO: Finish this method
        // Verify cardList is an array first...
        if (Object.prototype.toString.call(cardList) === '[object Array]') {
        }

        return true;
    }

    GetGroup(cardArray, cardList) {
        let numCards = 0;

        if (this.CanGetGroup(cardList) === true) {
            for (let cntr = 0; cntr < cardList.length; cntr++) {
                let action = cardList[cntr].split(':', 2);

                if ((action[0] === "TOP") || (action[0] === "BOTTOM")) {
                    if (action[1] === "ALL") {
                        numCards = this.cards.length;
                    }
                    else {
                        numCards = parseInt(action[1], 10);

                        if (isNaN(numCards)) {
                            numCards = 0;
                        }

                        if (numCards > this.cards.length) {
                            log.warn("CGCntnr: '%s' Out of Cards", this.id);
                            numCards = this.cards.length;
                        }
                    }

                    while (numCards--) {
                        cardArray.push(this.GetCard(action[0]));
                    }
                }
            }
        }

        return numCards;
    }

    AcceptGroup(group) {
        return true;
    }

    GetContainerById(id) {
        let cntr;
        let returnVal;

        if (id === this.id) {
            returnVal = this;
        } else {
            cntr = 0;

            for (cntr = 0; cntr < this.containers.length; cntr++) {
                returnVal = this.containers[cntr].GetContainerById(id);

                if (returnVal !== undefined) {
                    break;
                }
            }
        }

        return returnVal;
    }

    IsEmpty() {
        let isEmpty = true;

        // First check if we are empty.
        if (this.cards.length === 0) {
            // If we are empty, then check our children containers
            for (let cntr = 0; cntr < this.containers.length; cntr++) {
                if (!this.containers[cntr].IsEmpty()) {
                    isEmpty = false;
                    break;
                }
            }
        } else {
            isEmpty = false;
        }

        return isEmpty;
    }

    IsFull(id) {
        return (this.cards.length >= this.maxCards);
    }
}

module.exports = CardContainer;

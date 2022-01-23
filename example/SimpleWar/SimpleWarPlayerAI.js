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

const SimpleWarPlayer = require("./SimpleWarPlayer.js");
const SWGC = require("./SimpleWarDefs.js");


/*******************************************************************************
 * This class implements the "Artificial Intelligence" player for the Simple
 * War card game.
 ******************************************************************************/
class SimpleWarPlayerAI extends SimpleWarPlayer {
    constructor(parent, id, alias) {
        // Call the parent class constructor
        super(parent, id, alias);

        this.status.type = "AI";
        this.status.alias = this.alias + " (AI)";
        this.SetEnterRoutine("Battle", this.BattleEnter.bind(this));
    }

    /*******************************************************************************
     * This method performs the action upon entrance to the Battle state.  It waits
     * a time period, and then sends in a Battle transaction for the player this
     * class represents.
     ******************************************************************************/
    BattleEnter() {
        let player = this;
        // let timeout = ((Math.random() * 2) + 1) * 500;
        let timeout = 15;

        setTimeout(function () {
            player.parentGame.ProcessTransaction(player.id,
                SWGC.SWP_TRANSACTION_BATTLE,
                undefined,
                undefined,
                ["TOP:1"]);
        },
        timeout);
    }
}

module.exports = SimpleWarPlayerAI;

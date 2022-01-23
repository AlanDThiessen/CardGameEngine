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

const CGE = require('../../index.js').Defs;
const Player = require("../../index.js").Player;
const transDef = require("../../index.js").TransactionDefinition;
const log = require("../../index.js").Logger;
const SWGC = require("./SimpleWarDefs.js");
const PlayerStatus = require("./SimpleWarStatus.js").SimpleWarPlayerStatus;

const TransactionDefinition = transDef.TransactionDefinition;
const AddTransactionDefinition = transDef.AddTransactionDefinition;
const TRANSACTION_TYPE_INBOUND = transDef.TRANSACTION_TYPE_INBOUND;
const TRANSACTION_TYPE_OUTBOUND = transDef.TRANSACTION_TYPE_OUTBOUND;

/*******************************************************************************
 * States
 ******************************************************************************/
const SWP_STATE_IN_GAME = "InGame";         // Top:InGame
const SWP_STATE_OUT = "Out";                // Top:Out
const SWP_STATE_READY = "Ready";            // Top:InGame:Ready
const SWP_STATE_BATTLE = "Battle";          // Top:InGame:Battle
const SWP_STATE_WAIT = "Wait";              // Top:InGame:Wait

/*******************************************************************************
 * Containers
 ******************************************************************************/
const SWP_CONTAINER_STACK = "Stack";        // The main stack of cards
const SWP_CONTAINER_BATTLE = "Battle";      // The location to flip the top card
const SWP_CONTAINER_DISCARD = "Discard";    // Where all turned cards go before end of turn

// Internal Transactions
AddTransactionDefinition(SWGC.SWP_TRANSACTION_BATTLE,  SWP_CONTAINER_STACK,      SWP_CONTAINER_BATTLE,      1, 1, "TOP");
AddTransactionDefinition(SWGC.SWP_TRANSACTION_DICARD,  SWP_CONTAINER_BATTLE,     SWP_CONTAINER_DISCARD,     1, 1, "TOP");
AddTransactionDefinition(SWGC.SWP_TRANSACTION_FLOP,    SWP_CONTAINER_STACK,      SWP_CONTAINER_DISCARD,     3, 3, "TOP");

// Incoming Transactions
AddTransactionDefinition(SWGC.SWP_TRANSACTION_DEAL,    TRANSACTION_TYPE_INBOUND, SWP_CONTAINER_STACK,       1, 52, "TOP");
AddTransactionDefinition(SWGC.SWP_TRANSACTION_COLLECT, TRANSACTION_TYPE_INBOUND, SWP_CONTAINER_STACK,       1, 52, "BOTTOM");

// Outgoing Transactions
AddTransactionDefinition(SWGC.SWP_TRANSACTION_GIVEUP,  SWP_CONTAINER_DISCARD,    TRANSACTION_TYPE_OUTBOUND, 1, 52, "TOP");


class SimpleWarPlayer extends Player {
    constructor(parent, id, alias) {
        // Call the parent class constructor
        super(parent, id, alias);

        this.inGame = true;
        this.status = new PlayerStatus();

        this.status.id = this.id;
        this.status.type = 'USER';
        this.status.alias = this.alias;

        // Create the State Machine
        this.AddState(SWP_STATE_IN_GAME, undefined);
        this.AddState(SWP_STATE_OUT, undefined);
        this.AddState(SWP_STATE_READY, SWP_STATE_IN_GAME);
        this.AddState(SWP_STATE_BATTLE, SWP_STATE_IN_GAME);
        this.AddState(SWP_STATE_WAIT, SWP_STATE_IN_GAME);

        this.SetInitialState(SWP_STATE_READY);

        this.SetEnterRoutine(SWP_STATE_IN_GAME, this.InGameEnter.bind(this));
        this.SetEnterRoutine(SWP_STATE_WAIT, this.WaitEnter.bind(this));
        this.SetExitRoutine(SWP_STATE_IN_GAME, this.InProgressExit.bind(this));

        this.AddEventHandler(SWP_STATE_IN_GAME, CGE.CGE_EVENT_TRANSACTION, this.InGameTransaction.bind(this)); // Catch-all to update status after a // transaction
        this.AddEventHandler(SWP_STATE_READY, SWGC.SW_EVENT_DO_BATTLE, this.DoBattle.bind(this));
        this.AddEventHandler(SWP_STATE_BATTLE, CGE.CGE_EVENT_TRANSACTION, this.BattleTransaction.bind(this));
        this.AddEventHandler(SWP_STATE_WAIT, CGE.CGE_EVENT_TRANSACTION, this.WaitTransaction.bind(this));
        this.AddEventHandler(SWP_STATE_WAIT, SWGC.SW_EVENT_DO_WAR, this.DoWar.bind(this));

        // TODO: Need definitions for Max cards in deck
        this.stack = this.AddContainer("Stack", undefined, 0, 52);
        this.battle = this.AddContainer("Battle", undefined, 0, 1);
        this.discard = this.AddContainer("Discard", undefined, 0, 52);

        // Add the valid transactions to the states
        this.AddValidTransaction(SWP_STATE_IN_GAME, SWGC.SWP_TRANSACTION_DICARD);
        this.AddValidTransaction(SWP_STATE_IN_GAME, SWGC.SWP_TRANSACTION_COLLECT);
        this.AddValidTransaction(SWP_STATE_IN_GAME, SWGC.SWP_TRANSACTION_GIVEUP);
        this.AddValidTransaction(SWP_STATE_OUT, SWGC.SWP_TRANSACTION_GIVEUP);
        this.AddValidTransaction(SWP_STATE_READY, SWGC.SWP_TRANSACTION_DEAL);
        this.AddValidTransaction(SWP_STATE_BATTLE, SWGC.SWP_TRANSACTION_BATTLE);
        this.AddValidTransaction(SWP_STATE_WAIT, SWGC.SWP_TRANSACTION_FLOP);
    }

    InGameEnter() {
        this.UpdateStatus();
    }

    InGameTransaction(eventId, data) {
        // Update our status anytime we perform a transcation
        if (data.ownerId === this.id) {
            this.UpdateStatus();
        }

        return true;	// Event was handled
    }

    InProgressExit() {
        // Discard our Battle stack
        this.ExecuteTransaction(SWGC.SWP_TRANSACTION_DISCARD, ["TOP:ALL"], undefined);
        this.inGame = false;
        this.UpdateStatus();
        log.info("SwPlay : %s is Out", this.name);
    }

    DoBattle() {
        this.score = 0;
        this.Transition(SWP_STATE_BATTLE);

        return true;
    }

    /*******************************************************************************
     * This method handles the Transaction in the Battle state.  The event
     * is only handled if it is for this player, and it is a Battle transaction.
     ******************************************************************************/
    BattleTransaction(eventId, data) {
        let eventHandled = false;

        if ((data.ownerId === this.id) &&
            (data.transaction === SWGC.SWP_TRANSACTION_BATTLE)) {

            this.UpdateStatus();
            this.Transition(SWP_STATE_WAIT);
            eventHandled = true;
        }

        return eventHandled;
    }

    WaitEnter() {
        this.Score();
    }

    WaitTransaction(eventId, data) {
        let eventHandled = false;

        if ((data.transaction === SWGC.SWP_TRANSACTION_GIVEUP) &&
            (data.ownerId === this.id)) {

            // TODO: Fix bug where player will go out even if he just won the battle
            if (this.stack.IsEmpty()) {
                this.ExecuteTransaction(SWGC.SWP_TRANSACTION_DISCARD, ["TOP:ALL"], undefined);
                this.Transition(SWP_STATE_OUT);
            }
            else {
                this.Transition(SWP_STATE_READY);
            }

            this.UpdateStatus();
            eventHandled = true;
        }

        return eventHandled;
    }

    DoWar(eventId, data) {
        let eventHandled = false;

        if (data.ownerId === this.id) {
            if (data.gotoWar) {
                if(this.stack.NumCards() < 3) {
                    log.info(`${this.alias}: Not enough cards to go to war.`);
                }

                this.ExecuteTransaction(SWGC.SWP_TRANSACTION_FLOP, ["TOP:3"], undefined);
                this.Transition(SWP_STATE_READY);
            }
            else {
                this.score = 0;
            }

            this.UpdateStatus();
            eventHandled = true;
        }

        return eventHandled;
    }

    /*******************************************************************************
     * This method calculates the score for this player based on the rank of the
     * card on the Battle stack
     ******************************************************************************/
    Score() {
        let score = 0;

        function CardScore(element) {
            score += parseInt(element.rank, 10);
        }

        this.battle.cards.forEach(CardScore);

        log.info("SWPlay : %s: Score: = %d", this.name, score);
        this.score = score;
    }

    /*******************************************************************************
     * This method returns true if the player is still in the game (i.e. Not out of
     * cards)
     ******************************************************************************/
    IsInGame() {
        return this.inGame;
    }

    /*******************************************************************************
     * This method updates the status of the this player for feedback to the UI.
     ******************************************************************************/
    UpdateStatus() {
        // Indicate what our stack size is
        this.status.stackSize = this.stack.NumCards();
        this.status.discardSize = this.discard.NumCards();
        this.status.discardList = this.discard.GetList(); // Get the list of cards

        // Prune the list so only visible cards are shown
        for (let cntr = 0; cntr < this.status.discardList.length; cntr++) {
            // Only every 4th card should be visible, starting with the first one
            if (cntr % 4 > 0) {
                this.status.discardList[cntr] = "";
            }
        }

        // If our battle stack has a card on it, then indicate what that card is
        if (this.battle.NumCards() > 0) {
            this.status.battleStackTop = this.battle.cards[0].shortName;
        }
        else {
            this.status.battleStackTop = '';
        }

        // Now, notify the game engine of our updated status
        this.parentGame.UpdatePlayerStatus(this.id, this.status);
    }
}

module.exports = SimpleWarPlayer;

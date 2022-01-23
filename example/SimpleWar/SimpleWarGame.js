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

const CardGame = require("../../index.js").Game;
const CGE = require("../../index.js").Defs;
const log = require("../../index.js").Logger;
const SimpleWarPlayer = require("./SimpleWarPlayer.js");
const SimpleWarPlayerAI = require("./SimpleWarPlayerAI.js");
const SWGC = require("./SimpleWarDefs.js");
const DeckSpec = require('../decks/DeckStandardNoJokers.json');

/*******************************************************************************
 * States
 ******************************************************************************/
const SIMPLE_WAR_STATE_IN_PROGRESS = "InProgress";
const SIMPLE_WAR_STATE_GAME_OVER   = "GameOver";
const SIMPLE_WAR_STATE_BATTLE      = "Battle";
const SIMPLE_WAR_STATE_SCORE       = "Score";


class SimpleWarGame extends CardGame {
    constructor(gameSpec) {
        // Call the parent class constructor
        super("Simple War", DeckSpec, gameSpec);

        this.hasBattled = [];
        this.atBattle = [];
        this.atWar = false;

        // Create the State Machine
        this.AddState(SIMPLE_WAR_STATE_IN_PROGRESS, undefined);
        this.AddState(SIMPLE_WAR_STATE_GAME_OVER, undefined);
        this.AddState(SIMPLE_WAR_STATE_BATTLE, SIMPLE_WAR_STATE_IN_PROGRESS);
        this.AddState(SIMPLE_WAR_STATE_SCORE, SIMPLE_WAR_STATE_IN_PROGRESS);

        this.SetInitialState(SIMPLE_WAR_STATE_BATTLE);

        this.SetEnterRoutine(SIMPLE_WAR_STATE_IN_PROGRESS, this.InProgressEnter.bind(this));
        this.SetEnterRoutine(SIMPLE_WAR_STATE_BATTLE, this.BattleEnter.bind(this));
        this.SetEnterRoutine(SIMPLE_WAR_STATE_SCORE, this.ScoreEnter.bind(this));

        this.AddEventHandler(SIMPLE_WAR_STATE_BATTLE, CGE.CGE_EVENT_TRANSACTION, this.BattleTransaction.bind(this));
        this.AddEventHandler(SIMPLE_WAR_STATE_IN_PROGRESS, SWGC.SW_EVENT_DEAL, this.Deal.bind(this));
        this.AddEventHandler(SIMPLE_WAR_STATE_SCORE, CGE.CGE_EVENT_SCORE, this.EventScore.bind(this));

        // Add the valid transactions to the states
        this.AddValidTransaction(SIMPLE_WAR_STATE_IN_PROGRESS, "CGE_DEAL");

        this.Listen(CGE.CGE_EVENT_ADD_PLAYER, this.OnPlayerAdd.bind(this));
    }

    /*******************************************************************************
     * This method creates either a SimpleWarPlayer or a SimpleWarPlayer AI based on
     * the type of the player passed in, and adds the player to the game.
     ******************************************************************************/
    OnPlayerAdd(playerInfo) {
        if (playerInfo.type === "AI") {
            this.players.push(new SimpleWarPlayerAI(this, playerInfo.id, playerInfo.alias));
        }
        else {
            this.players.push(new SimpleWarPlayer(this, playerInfo.id, playerInfo.alias));
        }
    }

    /*******************************************************************************
     * This method performs the action upon entrance to the In Progress state.
     * It shuffles the cards and sends the event to deal.
     ******************************************************************************/
    InProgressEnter() {
        if (this.isHost) {
            this.dealer.Shuffle();
            this.SendEvent(SWGC.SW_EVENT_DEAL);
        }

        // Advance to the first player
        this.AdvancePlayer();		// Current player is not really used in this game.
        this.ResetBattleList();
    }

    /*******************************************************************************
     * This method performs the action upon entrance to the Battle state.  It sends
     * a Do Battle event to all players.
     ******************************************************************************/
    BattleEnter() {
        log.info("SWGame : ************************* BATTLE *************************");
        this.hasBattled = [];
        this.SendEvent(SWGC.SW_EVENT_DO_BATTLE);
    }

    /*******************************************************************************
     * This method handles the Battle transaction in the Battle state.  If every
     * player has performed the transaction, then the state transitions to the
     * Score state.
     ******************************************************************************/
    BattleTransaction(eventId, data) {
        let eventHandled = false;

        if ((data !== undefined) &&
            (data.ownerId !== undefined) &&
            (data.transaction !== undefined)) {

            if (data.transaction === SWGC.SWP_TRANSACTION_BATTLE) {
                this.hasBattled.push(data.ownerId);

                // If all players have done battle, then let's do score!
                if (this.hasBattled.length >= this.atBattle.length) {
                    this.Transition(SIMPLE_WAR_STATE_SCORE);
                }

                eventHandled = true;
            }
        }

        return eventHandled;
    }

    /*******************************************************************************
     * This method performs the action upon entrance to the Score state.
     * It delays for a period before sending the score event.  This delay is so the
     * user has time to observe the cards.
     ******************************************************************************/
    ScoreEnter() {
        let game = this;
        let timeout;

        if (typeof window !== 'undefined') {
            timeout = 2000;
        }
        else {
            timeout = 20;
        }

        this.atBattle = this.ScoreBattle();

        setTimeout(function () {
            game.SendEvent(CGE.CGE_EVENT_SCORE);
        }, timeout);
    }

    /*******************************************************************************
     * This method handles the Score event.  It Scores the battle, determines the
     * result.  It transitions to the Game Over state if only one player is left.
     * Otherwise, it transitions back to the battle state.
     ******************************************************************************/
    EventScore() {
        this.LogPlayerStatus();
        this.DetermineBattleResult(this.atBattle);

        if (this.atBattle.length === 1) {
            let alias = this.players[this.atBattle[0]].alias;
            this.Notify(alias + ' Wins the Game!');
            this.Transition(SIMPLE_WAR_STATE_GAME_OVER);
            this.SendEvent(CGE.CGE_EVENT_EXIT, undefined);
        }
        else {
            this.Transition(SIMPLE_WAR_STATE_BATTLE);
        }
    }

    /*******************************************************************************
     * This method schedules the transactions to deal the cards from the dealer
     * to each individual player.  Note: Each player is dealt an even number of
     * cards.  The remainder of the cards is left in the dealer container.
     ******************************************************************************/
    Deal() {
        log.info("SWGame : Deal");

        // Ensure players get an even number of cards
        let cardRemainder = this.dealer.NumCards() % this.NumPlayers();

        log.debug("SWGame : Card Remainder: %d", cardRemainder);

        let player = 0;
        let numCards = this.dealer.NumCards() - cardRemainder;

        while (numCards) {
            this.ProcessTransaction(this.players[player].id,
                                    SWGC.SWP_TRANSACTION_DEAL,
                                    this.id,
                        "CGE_DEAL",
                             ["TOP:1"]);

            player++;

            if (player >= this.players.length) {
                player = 0;
            }

            numCards--;
        }
    }

    /*******************************************************************************
     * This method builds a list of indices to the array of players with the
     * highest score.  If there is a winner, then there is only one on the list.
     * If it is tied, there could be up to the number of players on the list
     ******************************************************************************/
    ScoreBattle() {
        let topPlayers = [];
        let topScore = 0;

        for (let cntr = 0; cntr < this.atBattle.length; cntr++) {
            let score = this.players[this.atBattle[cntr]].GetScore();

            if (score > topScore) {
                topPlayers = [];
                topPlayers.push(this.atBattle[cntr]);
                topScore = score;
            }
            else if (score == topScore) {
                // There's a tie situation here!
                topPlayers.push(this.atBattle[cntr]);
            }
        }

        if (topPlayers.length === 1) {
            log.info("SWGame : Battle Winner: %s", this.players[topPlayers[0]].name);

            if (this.atWar) {
                this.Notify(this.players[topPlayers[0]].alias + ' Wins the War!');
            }
            else {
                this.Notify(this.players[topPlayers[0]].alias + ' Wins the Battle!');
            }
        }
        else {
            this.Notify("Going to War!");
            log.info("SWGame : Tie between:");

            for (let cntr = 0; cntr < topPlayers.length; cntr++) {
                log.info("SWGame :   - %s", this.players[topPlayers[cntr]].name);
            }
        }

        return topPlayers;
    }

    /*******************************************************************************
     * This method determines whether the battle has been won or if the game needs
     * to go to war.
     ******************************************************************************/
    DetermineBattleResult(topPlayers) {
        let numPlayers = this.NumPlayers();

        // Tell all players to discard
        for (let cntr = 0; cntr < numPlayers; cntr++) {
            this.ProcessTransaction(this.players[cntr].id,
                                    SWGC.SWP_TRANSACTION_DICARD,
                               undefined,
                        undefined,
                            ["TOP:ALL"]);
        }

        // If there is a tie, we need to go to War!
        if (topPlayers.length > 1) {
            log.info("SWGame : ************************* WAR!!! *************************");
            this.atWar = true;

            for (let cntr = 0; cntr < numPlayers; cntr++) {
                let doWar = false;

                // If the current player index is in the list of winners, then signal
                // war
                if (topPlayers.indexOf(cntr) !== -1) {
                    doWar = true;
                }

                this.SendEvent(SWGC.SW_EVENT_DO_WAR, {
                    ownerId: this.players[cntr].id,
                    gotoWar: doWar
                });
            }
        }
        else {
            let winnerIndex = topPlayers.pop();
            this.atWar = false;

            for (let cntr = 0; cntr < numPlayers; cntr++) {
                this.ProcessTransaction(this.players[winnerIndex].id,
                                        SWGC.SWP_TRANSACTION_COLLECT,
                                        this.players[cntr].id,
                                        SWGC.SWP_TRANSACTION_GIVEUP,
                                 ["TOP:ALL"]);
            }

            this.LogPlayerStatus();
            this.ResetBattleList();
        }
    }

    /*******************************************************************************
     * This method builds a list of all the players still in the game who are
     * eligible to do battle.
     ******************************************************************************/
    ResetBattleList() {
        this.atBattle = [];

        for (let cntr = 0; cntr < this.NumPlayers(); cntr++) {
            if (this.players[cntr].IsInGame()) {
                this.atBattle.push(cntr);
            }
        }
    }

    /*******************************************************************************
     * This method logs the status data from a player's structure
     ******************************************************************************/
    LogPlayerStatus(playerId) {
        let playerIds = [];

        if (playerId !== undefined) {
            playerId.push(playerId);
        }
        else {
            playerIds = this.GetPlayerIds();
        }

        for (let cntr = 0; cntr < playerIds.length; cntr++) {
            log.info("SWGame :   - %s : %d %d %s",
                this.status[playerIds[cntr]].alias,
                this.status[playerIds[cntr]].stackSize,
                this.status[playerIds[cntr]].discardSize,
                this.status[playerIds[cntr]].battleStackTop);
        }
    }
}

module.exports = SimpleWarGame;

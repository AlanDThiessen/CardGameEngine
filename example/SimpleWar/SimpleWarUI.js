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

const CGEActiveEntity = require ('../../index.js').ActiveEntity;
const CGE = require("../../index.js").Defs;
const SWGC = require('./SimpleWarDefs.js');

const MAIN_STATE = "MAIN_STATE";

module.exports = SimpleWarUI;

class SimpleWarUI extends CGEActiveEntity {
    constructor(parentGame) {
        super("SimpleWarUI");

        log.info("Creating SimpleWarUI");

        this.AddState(MAIN_STATE);
        this.SetEnterRoutine(MAIN_STATE, this.MainEnter.bind(this));
        this.SetInitialState(MAIN_STATE);

        this.parentGame = parentGame;
        this.playerId = null;
    }

    MainEnter() {
        if (typeof window === 'undefined') return;

        let ui = this;
        let eventStr;

        if (!!document.createTouch) {
            eventStr = 'touchend';
        }
        else {
            eventStr = 'mouseup';
        }

        let gameDiv,
            noteDiv,
            playerIds,
            playerStatus,
            playerStack,
            discardStack;

        if (typeof window === 'undefined') return;

        document.getElementById('revision').innerHTML = 'Ver. ' + CGE.REVISION;
        gameDiv = document.getElementById('game');

        playerIds = this.parentGame.GetPlayerIds();
        for (let i = 0; i < playerIds.length; i++) {
            playerStatus = this.parentGame.GetPlayerStatus(playerIds[i]);

            let infoDiv = document.createElement('div');
            infoDiv.id = playerStatus.alias + '-info';
            infoDiv.appendChild(document.createTextNode(playerStatus.alias));
            infoDiv.className = 'info';
            gameDiv.appendChild(infoDiv);

            playerStack = document.createElement('div');
            playerStack.id = playerStatus.alias + '-stack';
            playerStack.className = 'stack';
            gameDiv.appendChild(playerStack);

            let battleStack = document.createElement('div');
            battleStack.id = playerStatus.alias + '-battle';
            battleStack.className = 'card-up';
            gameDiv.appendChild(battleStack);

            discardStack = document.createElement('div');
            discardStack.id = playerStatus.alias + '-discard';
            discardStack.className = 'discard';
            gameDiv.appendChild(discardStack);

            if (playerStatus.type !== 'AI') {
                this.playerId = playerStatus.id;
                this.playerAlias = playerStatus.alias;
            }
        }

//      window.addEventListener(eventStr, function () {
        document.getElementById(this.playerAlias + '-stack').addEventListener(eventStr, function () {
            if (ui.playerId) {
                ui.parentGame.ProcessTransaction(that.playerId, SWGC.SWP_TRANSACTION_BATTLE,
                    undefined, undefined,
                    ["TOP:1"]);
            }
        });

        noteDiv = document.createElement('div');
        noteDiv.id = 'note';
        gameDiv.appendChild(noteDiv);
    }

    HandleEvent(eventId, data) {
        let playerStatus,
            playerStack,
            battleStack,
            infoDiv,
            noteDiv,
            timer = null;

        if (eventId === CGE.CGE_EVENT_NOTIFY) {
            if (typeof window === 'undefined') return;

            noteDiv = document.getElementById('note');
            if (noteDiv) {
                noteDiv.style.display = 'block';
                noteDiv.innerHTML = data.msg;

                noteDiv.style.opacity = 0;

                $('#note').animate(
                    {opacity: 1.0}, 250,
                    function () {
                        clearTimeout(timer);
                        timer = setTimeout(function () {
                            $('#note').animate({opacity: 0}, 500);
                        }, 1000);
                    });

            }
        } else if (eventId === CGE.CGE_EVENT_STATUS_UPDATE) {
            playerStatus = this.parentGame.GetPlayerStatus(data.ownerId);
            log.debug('StatusUpdateEvent: %s, %s', playerStatus.id, playerStatus.battleStackTop);

            if (typeof window === 'undefined') return;

            playerStack = document.getElementById(playerStatus.alias + '-stack');
            if (playerStack) {
                if (playerStatus.stackSize > 0) {
                    playerStack.className = 'stack';
                }
                else {
                    playerStack.className = 'stack-empty';
                }
            }

            infoDiv = document.getElementById(playerStatus.alias + '-info');
            if (infoDiv) {
                infoDiv.innerHTML = playerStatus.alias + '<br>' + playerStatus.stackSize + ' cards';
            }

            battleStack = document.getElementById(playerStatus.alias + '-battle');
            if (battleStack) {
                this.setCardFace(battleStack, playerStatus.battleStackTop);
            }

            let discardStack = document.getElementById(playerStatus.alias + '-discard');
            if (discardStack) {
                while (discardStack.firstChild) {
                    discardStack.removeChild(discardStack.firstChild);
                }

                for (let i = 0; i < playerStatus.discardSize; i++) {
                    let discardCard = document.createElement('div');
                    discardCard.className = 'discard-card';
                    discardCard = discardStack.appendChild(discardCard);

                    this.setCardFace(discardCard, playerStatus.discardList[i]);

                    discardCard.style.marginLeft = (i * 20) + 'px';
                }
            }
        }
    }

    setCardFace(element, rank) {
        let xPos = '0';
        let yPos = '0';

        switch (rank.charAt(0)) {
            case 'H':
                yPos = '-140px';
                break;

            case 'S':
                yPos = '-280px';
                break;

            case 'D':
                yPos = '-420px';
                break;
        }

        switch (rank.charAt(1)) {
            case 'A':
                break;

            case 'K':
                xPos = '-1200px';
                break;

            case 'Q':
                xPos = '-1100px';
                break;

            case 'J':
                xPos = '-1000px';
                break;

            default:
                let x = (parseInt(rank.slice(1), 10) - 1) * 100;
                xPos = '-' + x + 'px';
                break;
        }

        if (rank === '') {
            element.style.backgroundImage = '';
        }
        else {
            element.style.backgroundImage = 'url("./img/cards.png")';
            element.style.backgroundPosition = xPos + ' ' + yPos;
        }
    }
}

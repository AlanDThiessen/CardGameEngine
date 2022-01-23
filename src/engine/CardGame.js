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

const CGEActiveEntity = require("./CGEActiveEntity.js");
const Card = require("./Card.js");
const transDef = require("./TransactionDefinition.js");
const CGE = require("./CardGameDefs.js");
const Events = require('events');
const CardGameStatus = require("./Status.js").CardGameStatus;

const TransactionDefinition = transDef.TransactionDefinition;
const AddTransactionDefinition = transDef.AddTransactionDefinition;
const TRANSACTION_TYPE_INBOUND = transDef.TRANSACTION_TYPE_INBOUND;
const TRANSACTION_TYPE_OUTBOUND = transDef.TRANSACTION_TYPE_OUTBOUND;

const CGE_DEALER = "Dealer";
const CGE_TABLE = "Table";

const log = require("../utils/Logger.js");
const {CGE_EVENT_ADD_DECK} = require("./CardGameDefs");

// Outgoing Transactions
AddTransactionDefinition("CGE_DEAL", CGE_DEALER, TRANSACTION_TYPE_OUTBOUND, 1, 1, "TOP");

class CardGame extends CGEActiveEntity {
    constructor(name, deckSpec, gameSpec) {
        super('CardGame:' + name);

        this.id = Date.now();
        this.name = 'CardGame:' + name;
        this.isHost = false;
        this.players = []
        this.gameName = '';
        this.deckSpec = deckSpec;
        this.currPlayerIndex = -1; // Index to current player
        this.currPlayer = undefined; // Reference to current player
        this.status = new CardGameStatus();
        this.emitter = new Events.EventEmitter();

        // TODO: Bug: generic card games can't have card limits
        this.table = this.AddContainer(CGE_TABLE, undefined, 0, 52);
        this.dealer = this.AddContainer(CGE_DEALER, undefined, 1, 52);

        if(typeof gameSpec !== 'undefined') {
            // this.gameName = gameSpec.server.name;
            // this.id = gameSpec.server.id;

            if (gameSpec.hasOwnProperty('host') && (gameSpec.host === true)) {
                this.isHost = true;
            }

            if(gameSpec.hasOwnProperty('players') && Array.isArray(gameSpec.players)) {
                this.AddPlayers(gameSpec.players);
            }
        }
    }

    /*******************************************************************************
     * Send an add player event
     ******************************************************************************/
    AddPlayer(playerInfo) {
        this.SendEvent(CGE.CGE_EVENT_ADD_PLAYER, playerInfo);
    }

    Listen(event, listener) {
        this.emitter.addListener(event, listener);
    }

    /*******************************************************************************
     * This method goes through the deck specification JSON data and creates the
     * actual card objects represented by the data.
     ******************************************************************************/
    CreateDeck(deckSpec) {
        // Create the suited cards first
        for (let suitCntr = 0; suitCntr < deckSpec.suited.suits.length; suitCntr++) {
            for (let valueCntr = 0; valueCntr < deckSpec.suited.values.length; valueCntr++) {
                for (let qty = 0; qty < deckSpec.suited.values[valueCntr].quantity; qty++) {
                    this.dealer.AddCard(this.CreateSuitedCard(deckSpec.suited.suits[suitCntr],
                        deckSpec.suited.values[valueCntr],
                        qty));
                }
            }
        }

        // Now Create the non-suited cards
        for (let valueCntr = 0; valueCntr < deckSpec.nonsuited.values.length; valueCntr++) {
            for (let qty = 0; qty < deckSpec.nonsuited.values[valueCntr].quantity; qty++) {
                this.dealer.AddCard(this.CreateNonSuitedCard(deckSpec.nonsuited.values[valueCntr], qty));
            }
        }
    }

    /*******************************************************************************
     * This method creates and returns a new Card object with the given suit, value,
     * and count
     ******************************************************************************/
    CreateSuitedCard(suit, value, count) {
        return new Card(suit.name,
            suit.name + ' ' + value.name,
            suit.shortname + value.shortname,
            value.rank,
            suit.color,
            count);
    }

    /*******************************************************************************
     * this method creates and returns a new Card object given the count
     ******************************************************************************/
    CreateNonSuitedCard(nonSuited, count) {
        return new Card(nonSuited.name,
            nonSuited.name,
            nonSuited.shortname,
            nonSuited.rank,
            nonSuited.color,
            count);
    }

    /*******************************************************************************
     * This method goes through the Game JSON data that is passed in and creates
     * the players for this game.
     ******************************************************************************/
    AddPlayers(players) {
        for(let cntr = 0; cntr < players.length; cntr++) {
            this.AddPlayer(players[cntr]);
        }
    }

    /*******************************************************************************
     * This method advances the current player index and the reference to the
     * current player.
     ******************************************************************************/
    AdvancePlayer() {
        if(++this.currPlayerIndex > this.NumPlayers()) {
            this.currPlayerIndex = 0;
        }

        this.currPlayer = this.players[this.currPlayerIndex];
        this.SendEvent(CGE.CGE_EVENT_NEXT_PLAYER, this.currPlayer);
    }

    /*******************************************************************************
     *
     ******************************************************************************/
    StartGame() {
        this.CreateDeck(this.deckSpec);

        // First, Start all the players
        for(let cntr = 0; cntr < this.players.length; cntr++) {
            this.players[cntr].Start();
        }

        // Now, start the game
        this.Start();
        this.SendEvent(CGE.CGE_EVENT_STARTED);
    }

    /*******************************************************************************
     * This method searches the game and the players for the given id and returns
     * a reference to the object.  If none is found, it returns undefined.
     ******************************************************************************/
    GetEntityById(id) {
        let cntr = 0;
        let entity;

        if(this.id === id) {
            entity = this;
        }
        else {
            while(cntr < this.players.length) {
                if(this.players[cntr].id == id) {
                    entity = this.players[cntr];
                    break;
                }

                cntr++;
            }
        }

        return entity;
    }

    /*******************************************************************************
     * This method searches the Containers of the game for the container with the
     * specified id and returns a reference to that object.  If none is found, then
     * it returns undefined.
     ******************************************************************************/
    GetContainerById(id) {
        let cntr;
        let returnVal;

        // Check to see if the dealer has this container
        returnVal = this.rootContainer.GetContainerById(id);

        // Otherwise, check all the players
        if(returnVal === undefined) {
            cntr = 0;

            do {
                returnVal = this.players[cntr].GetContainerById(id);
            }
            while ((cntr < this.players.length) && (returnVal === undefined));
        }

        return returnVal;
    }

    /*******************************************************************************
     * This method sends the given eventId with the specified data to all of the
     * player objects in the game.
     ******************************************************************************/
    AllPlayersHandleEvent(eventId, data) {
        for(let cntr = 0; cntr < this.players.length; cntr++) {
            this.players[cntr].HandleEvent(eventId, data);
        }
    }

    /*******************************************************************************
     * This method sends the specified event to the owner of the event (if specified)
     * or to all players.  Then it sends it to the game engine, and finally the UI.
     *
     * Note:  The following events are sent to the UI only:
     *           - CGE_EVENT_STATUS_UPDATE
     *           - CGE_EVENT_NOTIFY
     ******************************************************************************/
    DispatchEvent(eventId, data) {
        if((eventId !== CGE.CGE_EVENT_STATUS_UPDATE) && (eventId !== CGE.CGE_EVENT_NOTIFY)) {
            if((data !== undefined) && (data.ownerId !== undefined)) {
                let entity = this.GetEntityById(data.ownerId);
                entity.HandleEvent(eventId, data);
            }
            else {
                this.AllPlayersHandleEvent(eventId, data);
            }

            // Send all events to the game engine
            this.HandleEvent(eventId, data);
        }
    }

    /*******************************************************************************
     * Parameters:
     *    destId - The id of the destination entity (game or player), where the
     *               cards will end up.
     *    destTransName - The name of the transaction to perform on the
     *                      destination entity.
     *
     * Optional Parameters:
     *    srcId - The id of the source entity (game or player), where the cards
     *              will originiate.  If left blank, it indicates the transaction
     *              is internal to the destination entity only.
     *    srcTransName - The name of the transaction to perform on the source
     *                     entity.
     *    ccardList - A list of cards to perform in the transaction.  This is an
     *                 array of short card names (i.e. "D4" for Four of Diamonds).
     *
     *                 Special Values:
     *                 "TOP:x" - Indicates take the cards from the Top, where x is
     *                           the number of cards, or "ALL"
     *                 "BOTTOM:x" - Indicates take the cards from the bottom, where
     *                              x is the number of cards, or "ALL"
     ******************************************************************************/
    ProcessTransaction(destId, destTransName, srcId, srcTransName, cardList) {
        let destEntity = this.GetEntityById(destId);
        let success = false;

        // log.info( "CGame : Process Transaction Event" );
        if(destEntity !== undefined) {
            if(srcId !== undefined) {
                let srcEntity = this.GetEntityById(srcId);

                if(srcEntity !== undefined) {
                    let cardArray = [];

                    if(srcEntity.ExecuteTransaction(srcTransName, cardList, cardArray)) {
                        this.SendEvent(CGE.CGE_EVENT_TRANSACTION, {
                            ownerId: srcId,
                            transaction: srcTransName
                        });

                        success = destEntity.ExecuteTransaction(destTransName, cardList, cardArray);

                        if(success) {
                            this.SendEvent(CGE.CGE_EVENT_TRANSACTION, {
                                ownerId: destId,
                                transaction: destTransName
                            });
                        }
                    }
                    else {
                        log.error("CGame  : EventTransaction: src transaction failed");
                    }
                }
                else {
                    log.error("CGame  : EventTransaction: srcId Not found!");
                }
            }
            else {
                success = destEntity.ExecuteTransaction(destTransName, cardList, undefined);

                if(success) {
                    this.SendEvent(CGE.CGE_EVENT_TRANSACTION, {
                        ownerId: destId,
                        transaction: destTransName
                    });
                }
            }
        }

        return success;
    }

    /*******************************************************************************
     * Interface Methods
     ******************************************************************************/

    /*******************************************************************************
     * This method sends an event with the given id and data to the game engine.
     * The event is placed in a queue, and a Javascript event is signaled.
     ******************************************************************************/
    SendEvent(eventId, eventData) {
        this.DispatchEvent(eventId, eventData);
        this.emitter.emit(eventId, eventData);
    }

    /*******************************************************************************
     * This method sends a Notify Event with the given message
     * Note: This event is only sent to the UI.
     ******************************************************************************/
    Notify(message) {
        log.info("Notify : %s", message);
        this.SendEvent(CGE.CGE_EVENT_NOTIFY, {msg: message});
    }

    /*******************************************************************************
     * this method returns the number of players in the game.
     ******************************************************************************/
    NumPlayers() {
        return this.players.length;
    }

    /*******************************************************************************
     * This method returns a list of the ids of all the players in the game
     ******************************************************************************/
    GetPlayerIds() {
        let ids = [];

        for(let cntr = 0; cntr < this.NumPlayers(); cntr++) {
            ids.push(this.players[cntr].id);
        }

        return ids;
    }

    /*******************************************************************************
     * This method adds the specified player status to the hash of statuses.
     ******************************************************************************/
    UpdatePlayerStatus(playerId, status) {
        this.status[playerId] = status;
        this.SendEvent(CGE.CGE_EVENT_STATUS_UPDATE, {ownerId: playerId});
    }

    /*******************************************************************************
     * This method returns the status structure of the requested player
     ******************************************************************************/
    GetPlayerStatus(playerId) {
        return this.status[playerId];
    }
}

module.exports = CardGame;

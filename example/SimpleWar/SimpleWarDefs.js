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

module.exports = {
    /***************************************************************************
     * SimpleWarPlayer Transaction Definitions
     ***************************************************************************/
    'SWP_TRANSACTION_DEAL': 'SWP_Deal',         // All inbound cards to Stack
    'SWP_TRANSACTION_BATTLE': 'SWP_Battle',     // 1 card from Stack to Battle
    'SWP_TRANSACTION_DICARD': 'SWP_Discard',    // 1 card from Battle to Discard
    'SWP_TRANSACTION_FLOP': 'SWP_Flop',         // 3 cards from Stack to Discard
    'SWP_TRANSACTION_COLLECT': 'SWP_Collect',   // All inbound cards to Stack
    'SWP_TRANSACTION_GIVEUP': 'SWP_GiveUp',     // All outbound cards from Discard

    /***************************************************************************
     * SimpleWar Events
     ***************************************************************************/
    'SW_EVENT_DEAL': 'Deal',
    'SW_EVENT_DO_BATTLE': 'Battle',
    'SW_EVENT_DO_WAR': 'War'
};

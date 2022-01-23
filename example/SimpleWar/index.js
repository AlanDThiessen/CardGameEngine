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

const SimpleWarGame = require('./SimpleWarGame.js');
const Logger = require('../../index.js').Logger;

main();


function main() {
    let flags = Logger.GetDebugFlags();
    Logger.SetLogMask(flags.INFO | flags.ERROR);

    let game = new SimpleWarGame({
        'host': true
    });

    game.AddPlayer({
        'type': 'AI',
        'alias': 'Player 1',
        'id': 'player1'
    });

    game.AddPlayer({
        'type': 'AI',
        'alias': 'Player 2',
        'id': 'player2'
    });

    game.AddPlayer({
        'type': 'AI',
        'alias': 'Player 3',
        'id': 'player3'
    });

    game.AddPlayer({
        'type': 'AI',
        'alias': 'Player 4',
        'id': 'player4'
    });

    game.StartGame();
}

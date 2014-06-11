var log = require('./Logger.js');

/*******************************************************************************
 * 
 * Card Class Constructor
 * 
 ******************************************************************************/
function Card(suit, name, shortName, rank, color, count) {
   this.id = shortName + '-' + rank + '-' + count;
   this.suit = suit;
   this.name = name;
   this.shortName = shortName;
   this.rank = rank;
   this.color = color;
}

/*******************************************************************************
 * 
 * Card.prototype.Print
 * 
 ******************************************************************************/
Card.prototype.Print = function() {
   log.info("CGCard :    " + this.id + ' : ' + this.shortName + ' : ' + this.name);
};

module.exports = Card;

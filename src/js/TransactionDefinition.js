
module.exports = TransactionDefinition;


/******************************************************************************
 *  CLASS: TransactionDefinition
 ******************************************************************************/

var TRANSACTION_TYPE_INBOUND  = "InBound";
var TRANSACTION_TYPE_OUTBOUND = "Outbound";


/******************************************************************************
 *
 * Class: TransactionDefinition
 * Constructor
 *
 ******************************************************************************/
function TransactionDefinition( name, from, to, minCards, maxCards )
{
   this.name               = name;
   this.fromContainerName  = from;
   this.toContainerName    = to;
   this.minCards           = minCards;
   this.maxCards           = maxCards;
};

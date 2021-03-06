
/******************************************************************************
 * Global array of Transaction Definitions
 ******************************************************************************/
//if( TransactionDefs == undefined )
//{
   var TransactionDefs = Array();

   function AddTransactionDefinition( name, from, to, minCards, maxCards, location )
   {
      if( GetTransactionDefinition( name ) === undefined )
      {
         TransactionDefs.push( new TransactionDefinition( name, from, to, minCards, maxCards, location ) );
      }
   }

   function GetTransactionDefinition( name )
   {
      var transDef;
      
      for( var cntr = 0; cntr < TransactionDefs.length; cntr++ )
      {
         if( TransactionDefs[cntr].name == name )
         {
            transDef = TransactionDefs[cntr];
            break;
         }
      }
      
      return transDef;
   }
//}

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
function TransactionDefinition( name, from, to, minCards, maxCards, location )
{
   this.name               = name;
   this.fromContainerName  = from;
   this.toContainerName    = to;
   this.minCards           = minCards;
   this.maxCards           = maxCards;
   this.location           = location;
}



module.exports = {
 TransactionDefinition: TransactionDefinition,
 AddTransactionDefinition: AddTransactionDefinition,
 GetTransactionDefinition: GetTransactionDefinition,
 TRANSACTION_TYPE_INBOUND: TRANSACTION_TYPE_INBOUND,
 TRANSACTION_TYPE_OUTBOUND: TRANSACTION_TYPE_OUTBOUND
};

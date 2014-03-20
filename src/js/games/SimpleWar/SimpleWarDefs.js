

var SWG_CONSTANTS = {

   /***************************************************************************
    * SimpleWarPlayer Transaction Definitions
    ***************************************************************************/
   SWP_TRANSACTION_DEAL     : "SWP_Deal",      // All inbound cards to Stack
   SWP_TRANSACTION_BATTLE   : "SWP_Battle",    // 1 card from Stack to Battle
   SWP_TRANSACTION_DICARD   : "SWP_Discard",   // 1 card from Battle to Discard
   SWP_TRANSACTION_FLOP     : "SWP_Flop",      // 3 cards from Stack to Discard
   SWP_TRANSACTION_COLLECT  : "SWP_Collect",   // All inbound cards to Stack
   SWP_TRANSACTION_GIVEUP   : "SWP_GiveUp"     // All outbound cards from Discard 

};

module.exports = SWG_CONSTANTS;

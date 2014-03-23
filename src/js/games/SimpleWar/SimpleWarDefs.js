

var SWG_CONSTANTS = {

   /***************************************************************************
    * SimpleWarPlayer Transaction Definitions
    ***************************************************************************/
   SWP_TRANSACTION_DEAL    : "SWP_Deal",     // All inbound cards to Stack
   SWP_TRANSACTION_BATTLE  : "SWP_Battle",   // 1 card from Stack to Battle
   SWP_TRANSACTION_DICARD  : "SWP_Discard",  // 1 card from Battle to Discard
   SWP_TRANSACTION_FLOP    : "SWP_Flop",     // 3 cards from Stack to Discard
   SWP_TRANSACTION_COLLECT : "SWP_Collect",  // All inbound cards to Stack
   SWP_TRANSACTION_GIVEUP  : "SWP_GiveUp",   // All outbound cards from Discard 

   /***************************************************************************
    * SimpleWar Events
    ***************************************************************************/
   // TODO: This needs to go somewhere else
   CGE_EVENT_EXIT             :    0,
   CGE_EVENT_DO_TRANSACTION   :    1,
   CGE_EVENT_TRANSACTION      :    2,
   CGE_EVENT_DEAL             :   10,
   CGE_EVENT_SCORE            :   11,
   CGE_EVENT_STATUS_UPDATE    :  100,

   SW_EVENT_DO_BATTLE         : 1000,
   SW_EVENT_DO_WAR            : 1001
};

module.exports = SWG_CONSTANTS;

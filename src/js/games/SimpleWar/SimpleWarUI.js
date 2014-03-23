var CGEActiveEntity = require ('../../CGEActiveEntity.js');
var SWGC = require('./SimpleWarDefs.js');

var MAIN_STATE = "MAIN_STATE";

function SimpleWarUI(parentGame)
{
   CGEActiveEntity.call(this, "SimpleWarUI");

   log.info("Creating SimpleWarUI");

   this.AddState(MAIN_STATE);
   this.SetEnterRoutine(MAIN_STATE, this.MainEnter);
   this.SetInitialState(MAIN_STATE);

   this.parentGame = parentGame;
   this.playerId = null;
};

SimpleWarUI.prototype = new CGEActiveEntity();
SimpleWarUI.prototype.constructor = SimpleWarUI;

SimpleWarUI.prototype.MainEnter = function ()
{
   if (typeof window === 'undefined') return;

   var that = this;
   window.addEventListener('click', function () {
      if (that.playerId)
      {
         that.parentGame.EventTransaction(that.playerId,   SWGC.SWP_TRANSACTION_BATTLE,
                                          undefined,	undefined,
                                          ["TOP:1"] );
      }
   });

   var   gameDiv,
         playerIds,
         playerStatus,
         playerStack;

   if (typeof window === 'undefined') return;

   gameDiv = document.getElementById('game');

   playerIds = this.parentGame.GetPlayerIds();
   for (var i = 0; i < playerIds.length; i++)
   {
      playerStatus = this.parentGame.GetPlayerStatus(playerIds[i]);

      playerStack = document.createElement('div');
      playerStack.id = playerStatus.alias + '-stack';
      playerStack.appendChild(document.createTextNode(playerStatus.alias + ' Stack'));
      gameDiv.appendChild(playerStack);

      battleStack = document.createElement('div');
      battleStack.id = playerStatus.alias + '-battle';
      battleStack.appendChild(document.createTextNode(playerStatus.alias + ' Battle'));
      gameDiv.appendChild(battleStack);

      infoDiv = document.createElement('div');
      infoDiv.id = playerStatus.alias + '-info';
      infoDiv.appendChild(document.createTextNode(playerStatus.alias + ' Info'));
      gameDiv.appendChild(infoDiv);

      if (playerStatus.type !== 'AI')
      {
         this.playerId = playerStatus.id;
      }
   }
};

SimpleWarUI.prototype.HandleEvent = function (eventId, data)
{
   var   playerStatus,
         playerStack,
         battleStack,
         infoDiv;

   if (eventId === SWGC.CGE_EVENT_STATUS_UPDATE)
   {
      playerStatus = this.parentGame.GetPlayerStatus(data.ownerId);
      log.info('StatusUpdateEvent: %s, %s', playerStatus.id, playerStatus.battleStackTop);

      if (typeof window === 'undefined') return;

      playerStack = document.getElementById(playerStatus.alias + '-stack');
      if (playerStack)
      {
         playerStack.innerHTML = playerStatus.alias + ' Stack ' + playerStatus.stackSize;
      }

      battleStack = document.getElementById(playerStatus.alias + '-battle');
      if (battleStack)
      {
         battleStack.innerHTML = playerStatus.alias + ' Battle ' + playerStatus.battleStackTop;
      }
   }
};

module.exports = SimpleWarUI;

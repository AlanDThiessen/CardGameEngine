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

      infoDiv = document.createElement('div');
      infoDiv.id = playerStatus.alias + '-info';
      infoDiv.appendChild(document.createTextNode(playerStatus.alias));
      infoDiv.className = 'info';
      gameDiv.appendChild(infoDiv);

      playerStack = document.createElement('div');
      playerStack.id = playerStatus.alias + '-stack';
      playerStack.className = 'card-down';
      gameDiv.appendChild(playerStack);

      battleStack = document.createElement('div');
      battleStack.id = playerStatus.alias + '-battle';
      battleStack.className = 'card-up';
      gameDiv.appendChild(battleStack);

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
         infoDiv,
         x,
         xPos,
         yPos;

   if (eventId === SWGC.CGE_EVENT_STATUS_UPDATE)
   {
      playerStatus = this.parentGame.GetPlayerStatus(data.ownerId);
      log.info('StatusUpdateEvent: %s, %s', playerStatus.id, playerStatus.battleStackTop);

      if (typeof window === 'undefined') return;

      playerStack = document.getElementById(playerStatus.alias + '-stack');
      if (playerStack)
      {
         if (playerStatus.stackSize > 0)
         {
            playerStack.style.backgroundImage = 'url("./img/cards.png")';
         }
         else
         {
            playerStack.style.backgroundImage = '';
         }
      }

      infoDiv = document.getElementById(playerStatus.alias + '-info');
      if (infoDiv)
      {
         infoDiv.innerHTML = playerStatus.alias + '<br>' + playerStatus.stackSize + ' cards';
      }

      battleStack = document.getElementById(playerStatus.alias + '-battle');
      if (battleStack)
      {
         xPos = '0';
         yPos = '0';

         switch (playerStatus.battleStackTop.charAt(0))
         {
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

         switch (playerStatus.battleStackTop.charAt(1))
         {
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
               x = (parseInt(playerStatus.battleStackTop.charAt(1), 10) - 1) * 100;
               xPos = '-' + x + 'px';
               break;
         }

         if (playerStatus.battleStackTop === '')
         {
            battleStack.style.backgroundImage = '';
         }
         else 
         {
            battleStack.style.backgroundImage = 'url("./img/cards.png")';
            battleStack.style.backgroundPosition = xPos + ' ' + yPos;
         }
      }
   }
};

module.exports = SimpleWarUI;
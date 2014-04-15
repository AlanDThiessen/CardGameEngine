var CGEActiveEntity = require ('../../CGEActiveEntity.js');
var CGE = require("../../CardGameDefs.js");
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
}

SimpleWarUI.prototype = new CGEActiveEntity();
SimpleWarUI.prototype.constructor = SimpleWarUI;

SimpleWarUI.prototype.MainEnter = function ()
{
   if (typeof window === 'undefined') return;

   var that = this;
   var eventStr;

   if (!!document.createTouch) {
      eventStr = 'touchend';
   } else {
      eventStr = 'mouseup';
   }

   window.addEventListener(eventStr, function () {
      if (that.playerId)
      {
         that.parentGame.EventTransaction(that.playerId,   SWGC.SWP_TRANSACTION_BATTLE,
                                          undefined,	undefined,
                                          ["TOP:1"] );
      }
   });

   var   gameDiv,
         noteDiv,
         playerIds,
         playerStatus,
         playerStack,
         discardStack;

   if (typeof window === 'undefined') return;

   document.getElementById('revision').innerHTML = 'Ver. ' + CGE.REVISION;
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
      playerStack.className = 'stack';
      gameDiv.appendChild(playerStack);

      battleStack = document.createElement('div');
      battleStack.id = playerStatus.alias + '-battle';
      battleStack.className = 'card-up';
      gameDiv.appendChild(battleStack);

      discardStack = document.createElement('div');
      discardStack.id = playerStatus.alias + '-discard';
      discardStack.className = 'discard';
      gameDiv.appendChild(discardStack);

      if (playerStatus.type !== 'AI')
      {
         this.playerId = playerStatus.id;
      }
   }

   noteDiv = document.createElement('div');
   noteDiv.id = 'note';
   gameDiv.appendChild(noteDiv);
};

SimpleWarUI.prototype.HandleEvent = function (eventId, data)
{
   var   playerStatus,
         playerStack,
         battleStack,
         infoDiv,
         noteDiv,
         x,
         timer = null;

   if (eventId === CGE.CGE_EVENT_NOTIFY)
   {
      if (typeof window === 'undefined') return;

      noteDiv = document.getElementById('note');
      if (noteDiv)
      {
         noteDiv.style.display = 'block';
         noteDiv.innerHTML = data.msg;

         noteDiv.style.opacity = 0;

         $('#note').animate(
            {opacity: 1.0}, 250,
            function () {
               clearTimeout(timer);
               timer = setTimeout(function () {
                  $('#note').animate({opacity: 0}, 500);
                  }, 1000);
            });
         
      }
   }
   else if (eventId === CGE.CGE_EVENT_STATUS_UPDATE)
   {
      playerStatus = this.parentGame.GetPlayerStatus(data.ownerId);
      log.debug('StatusUpdateEvent: %s, %s', playerStatus.id, playerStatus.battleStackTop);

      if (typeof window === 'undefined') return;

      playerStack = document.getElementById(playerStatus.alias + '-stack');
      if (playerStack)
      {
         if (playerStatus.stackSize > 0)
         {
            playerStack.className = 'stack';
         }
         else
         {
            playerStack.className = 'stack-empty';
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
         this.setCardFace(battleStack, playerStatus.battleStackTop);
      }

      discardStack = document.getElementById(playerStatus.alias + '-discard');
      if (discardStack)
      {
         while(discardStack.firstChild)
         {
            discardStack.removeChild(discardStack.firstChild);
         }

         for (var i = 0; i < playerStatus.discardSize; i++)
         {
            var discardCard = document.createElement('div');
            discardCard.className = 'discard-card';
            discardCard = discardStack.appendChild(discardCard);

            this.setCardFace(discardCard, playerStatus.discardList[i]);

            discardCard.style.marginLeft = (i * 20) + 'px';
         }
      }
   }
};

SimpleWarUI.prototype.setCardFace = function (element, rank) {
   var xPos = '0';
   var yPos = '0';

   switch (rank.charAt(0))
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

   switch (rank.charAt(1))
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
         x = (parseInt(rank.slice(1), 10) - 1) * 100;
         xPos = '-' + x + 'px';
         break;
   }

   if (rank === '')
   {
      element.style.backgroundImage = '';
   }
   else 
   {
      element.style.backgroundImage = 'url("./img/cards.png")';
      element.style.backgroundPosition = xPos + ' ' + yPos;
   }
};

module.exports = SimpleWarUI;

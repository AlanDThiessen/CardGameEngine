var CGEActiveEntity = require ('../../CGEActiveEntity.js');
var SWGC = require('./SimpleWarDefs.js');

var MAIN_STATE = "MAIN_STATE";

function SimpleWarUI(parentGame, id)
{
   CGEActiveEntity.call(this, "SimpleWarUI");

   log.info("Creating SimpleWarUI");

   this.AddState(MAIN_STATE);
   this.SetEnterRoutine(MAIN_STATE, this.MainEnter);
   this.SetInitialState(MAIN_STATE);
   this.parentGame = parentGame;
   this.id = id;
};

SimpleWarUI.prototype = new CGEActiveEntity();
SimpleWarUI.prototype.constructor = SimpleWarUI;

SimpleWarUI.prototype.MainEnter = function ()
{
   if (typeof window !== 'undefined')
   {
      var that = this;
      document.addEventListener('touchend', function () {
         that.parentGame.EventTransaction(that.id,   SWGC.SWP_TRANSACTION_BATTLE,
                                          undefined,	undefined,
                                          ["TOP:1"] );
      });
   }
};

SimpleWarUI.prototype.HandleEvent = function (eventId, data)
{
   var textBox;

// Call super how?
//   CGEActiveEntity.HandleEvent.call(this, eventId, data);

   log.warn("SimpleWarUI.HandleEvent: %s %s", eventId, data);

   if (typeof window !== 'undefined')
   {
      textBox = document.getElementById('log');
      textBox.innerHTML = "\nSimpleWarUI.HandleEvent: " + eventId + " " + data + textBox.innerHTML;
   }
};

module.exports = SimpleWarUI;

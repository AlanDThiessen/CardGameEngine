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

let logger;

const DEBUG_FLAGS = {
   DEBUG: 0x01,
   INFO: 0x02,
   WARN: 0x04,
   ERROR: 0x08
}

function StartLogger() {
   if(typeof logger === 'undefined') {
      logger = new Log();
   }

   return logger;
}

class Log {
   constructor() {
      this.logMask = 0;
      this.toConsole = true;
      this.toFile = false;
   }

   SetLogMask(mask) {
      this.logMask = mask;
   }

   GetDate() {
      let date = new Date();
      let dateStr = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
      dateStr += " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + "." + date.getMilliseconds();
      return dateStr;
   }

   debug(format) {
      let args = Array.prototype.slice.call(arguments, 0);
      args.unshift(DEBUG_FLAGS.DEBUG);

      if(this.logMask & DEBUG_FLAGS.DEBUG) {
         this._out.apply(this, args);
      }
   }

   info(format) {
      let args = Array.prototype.slice.call(arguments, 0);
      args.unshift(DEBUG_FLAGS.INFO);

      if(this.logMask & DEBUG_FLAGS.INFO) {
         this._out.apply(this, args);
      }
   }

   warn(format) {
      let args = Array.prototype.slice.call(arguments, 0);
      args.unshift(DEBUG_FLAGS.WARN);

      if(this.logMask & DEBUG_FLAGS.WARN) {
         this._out.apply(this, args);
      }
   }

   error(format) {
      let args = Array.prototype.slice.call(arguments, 0);
      args.unshift(DEBUG_FLAGS.ERROR);

      if(this.logMask & DEBUG_FLAGS.ERROR) {
         this._out.apply(this, args);
      }
   }

   _out(level, format) {
      let i = -1;
      let args = Array.prototype.slice.call(arguments, 2);
      let str;

      let dateStr = this.GetDate();
      dateStr = "[" + dateStr + "] ";
      format = "" + format;

      str = format.replace(/\%[sd]/g, function () {
         i++;
         return args[i];
      });

      switch (level) {
         case DEBUG_FLAGS.DEBUG:
            if(this.toConsole) { console.log(dateStr + "DEBUG: " + str); }
            if(this.toFile)    { this._ToFile(dateStr + "DEBUG: " + str); }
            break;

         case DEBUG_FLAGS.INFO:
            if(this.toConsole) { console.log(dateStr + " INFO: " + str); }
            if(this.toFile)    { this._ToFile(dateStr + " INFO: " + str); }
            break;

         case DEBUG_FLAGS.WARN:
            if(this.toConsole) { console.warn(dateStr + " WARN: " + str); }
            if(this.toFile)    { this._ToFile(dateStr + " WARN: " + str);  }
            break;

         case DEBUG_FLAGS.ERROR:
            if(this.toConsole) { console.error(dateStr + "ERROR: " + str); }
            if(this.toFile)    { this._ToFile(dateStr + "ERROR: " + str); }
            break;
      }
   }

   _ToFile(str) {
      // TODO: Replace original code with file?
   }
}

module.exports = StartLogger();

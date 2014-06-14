/*******************************************************************************
 * 
 * main.js
 * 
 * This file provides the main entry point for the application!
 * 
 ******************************************************************************/

var FS = require('./utils/FileSystem.js');
//var config = require('./utils/config.js');


function main ()
{
   document.addEventListener('deviceready', OnDeviceReady, false);
}


function OnDeviceReady() {
   FS.InitFileSystem(FileSystemReady);
}

function BrowserMain() {
   FS.InitFileSystem(FileSystemReady);
}


function FileSystemReady() {
   FS.OpenLogFile(LogFileReady, LogFileWriteComplete);
}

function LogFileReady(ready) {
   var date = new Date();
   dateStr  = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
   dateStr += " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + "." + date.getMilliseconds();
   var logEntry = "[" + dateStr + "] First Entry in the log\n";
   FS.WriteLogFile("This is the CGE Log file!\n" + logEntry);
}

function LogFileWriteComplete() {
   alert("Write to log file success!");
}


if (typeof window === 'undefined') {
   main();
}
else {
   window.addEventListener('load', BrowserMain, false);
}

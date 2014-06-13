/*******************************************************************************
 * 
 * main.js
 * 
 * This file provides the main entry point for the application!
 * 
 ******************************************************************************/

var FS = require('./utils/FileSystem.js');
var config = require('./utils/config.js');


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
   alert("WooHoo! FileSystem is Ready");
   //FS.OpenLogFile(LogFileReady, LogFileWriteComplete);
}

function LogFileReady(ready) {
   alert("LogFileReady: " + ready);
}

function LogFileWriteComplete() {
   alert("LogFileWriteComplete");
}


if (typeof window === 'undefined') {
   main();
}
else {
   window.addEventListener('load', BrowserMain, false);
}

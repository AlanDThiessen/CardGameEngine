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
   alert("Filesystem ready!");
//   FS.OpenLogFile(LogFileReady, LogFileWriteComplete);
   log.FileSystemReady();
}


if (typeof window === 'undefined') {
   main();
}
else {
   window.addEventListener('load', BrowserMain, false);
}

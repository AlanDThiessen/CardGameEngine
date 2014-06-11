/*******************************************************************************
 * 
 * main.js
 * 
 * This file provides the main entry point for the application!
 * 
 ******************************************************************************/

var FS = require('utils/FileSystem.js');


function main ()
{
   document.addEventListener('deviceready', OnDeviceReady, false);
}


function OnDeviceReady() {
   FS.InitFileSystem();
}


if (typeof window === 'undefined') {
   main();
}
else {
   window.addEventListener('load', main, false);
}

/*******************************************************************************
 * 
 * main.js
 * 
 * This file provides the main entry point for the application!
 * 
 ******************************************************************************/

var FS = require('./utils/FileSystem.js');
var config = require('./utils/config.js');
var log = require('./utils/Logger.js');
var server = require('./utils/Server.js');


function main ()
{
   document.addEventListener('deviceready', OnDeviceReady, false);
}


function OnDeviceReady() {
   FS.InitFileSystem(FileSystemReady);
}

function BrowserMain() {
//   FS.InitFileSystem(FileSystemReady);
   FileSystemReady();   // Not really
}


function FileSystemReady() {
   //alert("Filesystem ready!");
   log.FileSystemReady();
  
   setTimeout(LoginToServer, 1000);
}

function LoginToServer() {
   server.LoginUser(config.GetUserName(), config.GetPassword());
}


if (typeof window === 'undefined') {
   main();
}
else {
   window.addEventListener('load', BrowserMain, false);
}

#!/usr/bin/env node

//========================================================================
// cordova-create
//
// A node command for creating a simple Cordova project with a couple 
// of common plugins.
//
// by John M. Wargo (www.johnwargo.com)
//========================================================================
var colors = require('colors'),
  fs = require('fs'),
  path = require('path'),
  os = require('os'),
  shelljs = require('shelljs');

//*************************************
//some constants
//*************************************
var cmdStr = 'cva_create folder app_id app_name [platform list]';
var debug = false;
var default_platforms_ios = ['android', 'firefoxos', 'ios'];
var default_platforms_win = ['android', 'firefoxos', 'wp8'];
var helpFile = 'cordova-create-help.txt';
var plugin_list = ['org.apache.cordova.console', 'org.apache.cordova.dialogs', 'org.apache.cordova.device'];
var theStars = '********************';
var space = ' ';

colors.setTheme({
  verbose: 'cyan',
  info: 'grey',
  help: 'green',
  warn: 'yellow',
  debug: 'blue',
  error: 'red'
});

function listArray(theName, theArray) {
  //Write the contents of an array to the console
  console.log("\n%s Array Contents", theName);
  for (var i = 0; i < theArray.length; i++) {
    console.log("%s[%s]: '%s'", theName, i, theArray[i]);
  }
}

function showHelp() {
  //Show the help page
  var raw = fs.readFileSync(path.join(__dirname, helpFile)).toString('utf8');
  console.log(raw.help);
}

//========================================================================
//Write out what we're running
//========================================================================
console.log("\n%s".info, theStars);
console.log("Cordova Create".info);
console.log(theStars.info);

//========================================================================
//Sort out the command line arguments
//========================================================================
var userArgs;
//Is the first item 'node'? then we're testing
if (process.argv[0].toLowerCase() == 'node') {
  //whack the first two items off of the list of arguments
  //This removes the node entry as well as the cordova-create entry (the
  //program we're running)
  userArgs = process.argv.slice(2);
} else {
  //whack the first item off of the list of arguments
  //This removes just the cva-create entry
  userArgs = process.argv.slice(1);
}
//What's left at this point is just all of the parameters
if (debug) {
  listArray('Arguments', userArgs);
}

if (userArgs.length > 2) {
  //Grab the target folder
  var targetFolder = userArgs[0];
  //Get the app ID
  var appID = userArgs[1];
  //grab the app name
  var appName = userArgs[2];
  //now whack off the initial (first three) arguments
  var userArgs = userArgs.slice(3);
  //What's left is any target platforms (if we have any)
  var targetPlatforms = [];
  //Do we have any platforms on the command line?
  if (userArgs.length > 0) {
    //Then use them
    targetPlatforms = userArgs;
  } else {
    //just use the default platforms
    if (os.type().indexOf('Win') === 0) {
      //Set the default target list for Windows
      targetPlatforms = default_platforms_win;
    } else {
      //OS X I'm assuming
      targetPlatforms = default_platforms_ios;
    }
  }

} else {
  console.error("\nMissing one or more parameters, the proper command format is: ".error);
  console.error("\n  %s".error, cmdStr);
  process.exit(1);
}

//========================================================================
//Check to make sure that the target folder does not already exist
//========================================================================
if (fs.existsSync(targetFolder)) {
  console.error("\nTarget folder %s already exists".error, targetFolder);
  process.exit(1);
}

//========================================================================
//Tell the user what we're about to do
//========================================================================
console.log("\nApplication Name: %s", appName);
console.log("Application ID: %s", appID);
console.log("Target folder: %s", targetFolder);
console.log("Target platforms: %s\n", targetPlatforms.join(' '));

//========================================================================
//create the Cordova project
//========================================================================
console.log("Creating project".warn);
shelljs.exec('cordova create ' + targetFolder + ' ' + appID + ' "' + appName + '"');

//========================================================================
//Change to the target folder directory
//========================================================================
console.log("\nChanging to target folder %s".warn, targetFolder);
shelljs.pushd(targetFolder);

//========================================================================
// Platforms
//========================================================================
console.log('\nAdding platforms [%s] to the project'.warn, targetPlatforms);
shelljs.exec('cordova platform add ' + targetPlatforms.join(' '));

//========================================================================
// Plugins
//========================================================================
// Loop through plugins array rather than hard-coding this list
console.log("\nAdding Cordova Core Plugins".info);
plugin_list.forEach(function (plugin) {
  console.log("\nAdding %s plugin to project".warn, plugin);
  shelljs.exec('cordova plugin add ' + plugin);
});

console.log("\nAll done!\n");
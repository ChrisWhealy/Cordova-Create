#!/usr/bin/env node

//========================================================================
// cordova-create
//
// A node command for creating a simple Cordova project with a couple 
// of common plugins.
//
// by John M. Wargo (www.johnwargo.com)
//========================================================================
var appConfig = require('./app_config.js'),
  colors = require('colors'),
  fs = require('fs'),
  path = require('path'),
  shelljs = require('shelljs');

//*************************************
//some constants
//*************************************
var cmdStr = 'cva_create folder app_id app_name [platform list]';
var debug = false;
var helpFile = 'cordova-create-help.txt';
var plugin_list;
var theStars = "***************************************";
var space = ' ';

colors.setTheme({
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
  //read the help file
  var raw = fs.readFileSync(path.join(__dirname, helpFile)).toString('utf8');
  //write the contents of the help file to the console
  console.log(raw.help);
}

function executeCordovaCommand(commandStr) {
  //Build the base command
  var theCmd = 'cordova ';
  //do we want to enable debug mode?
  if (theConfig.enableDebug) {
    //Then append the -d to the cordova command
    console.log("Enabling debug mode");
    theCmd += '-d ';
  }
  //Now add the rest of the command to the string
  theCmd += commandStr;
  console.log('Command string: %s', theCmd);
  var resCode = shelljs.exec(theCmd).code;
  if (resCode !== 0) {
    console.error("Unable to execute command (error code: %s)".error, resCode);
    process.exit(1);
  }
}

//========================================================================
//Write out what we're running
//========================================================================
console.log("\n%s".help, theStars);
console.log("Cordova Create".help);
console.log(theStars.help);

//Get the app's configuration settingds
var theConfig = appConfig();
//Write them to the log while we're testing this thing...
//console.log('App Config: %s'.error, JSON.stringify(theConfig));

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
    targetPlatforms = theConfig.platformList;
  }
} else {
  console.error("\nMissing one or more parameters, the proper command format is: ".error);
  console.error("\n  %s".error, cmdStr);
  showHelp();
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
//Read the plugin list from the config
//========================================================================
plugin_list = theConfig.pluginList;

//========================================================================
//Tell the user what we're about to do
//========================================================================
console.log("Application Name: %s", appName);
console.log("Application ID: %s", appID);
console.log("Target folder: %s", targetFolder);
console.log("Target platforms: %s", targetPlatforms.join(', '));
console.log('Plugins: %s', plugin_list.join(', '));

//========================================================================
//create the Cordova project
//========================================================================
console.log("\nCreating project".warn);
console.log(theStars);
var cmdStr = 'create ' + targetFolder + ' ' + appID + ' "' + appName + '"';
var copyFromPath = theConfig.copyFrom;
//Do we have a copyFromPath property?
if (copyFromPath === undefined) {
  //If no, blank it out
  copyFromPath = '';
}
//Do we have a copyFrom path?
if (copyFromPath.length > 0) {
  //Then add it to the end of the create command
  console.log('Enabling --copy-from option (file path: %s)', copyFromPath);
  //Then add it to the command string we're executing
  cmdStr += ' --copy-from "' + copyFromPath + '"';
}
executeCordovaCommand(cmdStr);

//========================================================================
//Change to the target folder directory
//========================================================================
console.log("\nChanging to project folder (%s)".warn, targetFolder);
console.log(theStars);
//TODO: Should I do some error checking here?
shelljs.pushd(targetFolder);

//========================================================================
// Platforms
//========================================================================
console.log('\nAdding platforms [%s] to the project'.warn, targetPlatforms.join(', '));
console.log(theStars);
if (targetPlatforms.length > 0) {
  executeCordovaCommand('platform add ' + targetPlatforms.join(' '));
} else {
  //I guess we're not adding any platforms
  //warn, but don't fail
  console.log("No platforms specified, skipping".warn);
}

//========================================================================
// Plugins
//========================================================================
console.log("\nAdding Cordova Core Plugins".warn);
console.log(theStars);
if (plugin_list.length > 0) {
  // Loop through plugins array rather than hard-coding this list
  plugin_list.forEach(function (plugin) {
    console.log("Adding %s plugin to project".info, plugin);
    executeCordovaCommand('plugin add ' + plugin);
  });
} else {
  //I guess we're not adding any plugins
  //warn, but don't fail
  console.log("No plugins specified in the configuration file, skipping...".warn);
}

//========================================================================
// Finished
//========================================================================
console.log("\nAll done!\n".help);
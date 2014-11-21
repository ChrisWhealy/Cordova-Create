#!/usr/bin/env node

/* jshint browser: true */

var colors = require('colors'),
  fs = require('fs'),
  path = require('path'),
  os = require('os');

//Set the following to true to write status
//to the console as it runs
var debugMode = false;
//Some string constants
var blankStr = '';
var stars = "***************************************";

colors.setTheme({
  info: 'grey',
  help: 'green',
  warn: 'yellow',
  debug: 'blue',
  error: 'red'
});

//Some values we need to execute
var theOS = os.type();
var isWindows = (theOS.indexOf('Win') === 0);
var isLinux = (theOS.indexOf('Linux') === 0);

function doLog(msgText) {
  if (debugMode) {
    console.log(msgText);
  }
}

//========================================================================
// Validate the contents of the config file
//========================================================================
function checkConfig(configFile, theConfig) {

  //Track whether the config file has been changed
  var configChanged = false;

  //Some default values
  var default_platforms_linux = ['ubuntu'];
  var default_platforms_osx = ['android', 'ios'];
  var default_platforms_win = ['android', 'windows'];
  var default_plugin_list = ['org.apache.cordova.console', 'org.apache.cordova.dialogs', 'org.apache.cordova.device'];

  //Are all of the properties we need there?
  //populate them with the ones we need
  console.log("Validing configuration");

  //First check the platform list
  if (theConfig.platformList === undefined) {
    configChanged = true;
    //Set a default platform list in case this runs on some other platform
    //not likely, but possible.
    theConfig.platformList = [];
    if (isWindows) {
      //Set defaults for Windows
      console.log("Setting Windows default platform list");
      theConfig.platformList = default_platforms_win;
    } else if (isLinux) {
      //Set defaults for Linux
      console.log("Setting Linux default platform list");
      theConfig.platformList = default_platforms_linux;
    } else {
      //when all else fails, pick OS X
      console.log("Setting Macintosh default platform list");
      theConfig.platformList = default_platforms_osx;
    }
  }

  //Now check the plugin list
  if (theConfig.pluginList === undefined) {
    configChanged = true;
    doLog("Adding default plugin list to config");
    theConfig.pluginList = default_plugin_list;
  }

  //debug mode controls whether the -d is passed
  //on the command line to the cordova command
  if (theConfig.enableDebug === undefined) {
    doLog("Adding debug mode to config");
    theConfig.enableDebug = false;
    configChanged = true;
  }

  //Add support for the --copy-from switch
  //Note: can't have both copyTo and linkTo
  if (theConfig.copyFrom === undefined) {
    doLog("Adding copy-from to config");
    theConfig.copyFrom = blankStr;
    configChanged = true;
  }

  //linkTo: Added 10/26/2014
  //Add support for the --linkto switch when creating new projects
  //Note: can't have both copyTo and linkTo
  if (theConfig.linkTo === undefined) {
    doLog("Adding copy-from to config");
    theConfig.linkTo = blankStr;
    configChanged = true;
  }

  //createParms: Added 10/26/2014
  //Used to pass additional commands to the create command
  //specifically added to support passing a searchPath string when
  //creating a new project
  if (theConfig.createParms === undefined) {
    doLog("Adding createParms to config");
    theConfig.createParms = blankStr;
    configChanged = true;
  }

  // Did we make any changes to the config?
  if (configChanged) {
    console.log("Writing configuration file");
    try {
      console.log("Writing configuration to " + configFile);
      fs.writeFileSync(configFile, JSON.stringify(theConfig, null, 4));
      //if on Linux variant...set the file permissions
      if (!isWindows) {
        console.log("Setting file permissions");
        try {
          fs.chmodSync(configFile, 0777);
        } catch (err) {
          console.error("Unable to set file permissions: %s".error, err.code);
          console.error("Error object: %s".error, JSON.stringify(err));
          process.exit(1);
        }
      }
    } catch (err) {
      console.error("Unable to write to file: %s".error, err.code);
      console.error("Error object: %s".error, JSON.stringify(err));
      process.exit(1);
    }
  }
  //Return the updated configuation object to the calling function
  return theConfig;
}

//========================================================================
// isWindowsPlatform()
//========================================================================
var isWindowsPlatform = function () {
  return isWindows;
};

//========================================================================
// getConfigFile()
//========================================================================
var getConfigFile = function () {
  //----------------------------------------------------------------------
  //Determine the user's home folder, varies per OS.
  //----------------------------------------------------------------------
  var configFile = "cordova-create.json";
  var configPath;

  var theEnv = process.env;
  if (isWindows) {
    console.log("Running on Windows");
    //Set the default home folder for Windows
    configPath = theEnv.USERPROFILE;
  } else {
    console.log("Runnning on a Linux variant");
    //Home folder for OS X and Linux
    configPath = theEnv.HOME;
  }
  //Do we have a value?
  if (configPath.length > 0) {
    console.log('Home folder: ' + configPath);
    configPath = path.join(configPath, configFile);
    console.log('Configuration file: ' + configPath);
  } else {
    console.error("Unable to determine home folder".error);
    process.exit(1);
  }
  //Return whatever result we got
  return configPath;
};

//========================================================================
// getConfig()
//========================================================================
var getConfig = function () {
  console.log("Getting configuration");
  //Object to hold the config information
  var theConfig;
  //Figure out where the config file is located
  var configPath = getConfigFile();
  // Does the configuration file exist?
  if (fs.existsSync(configPath)) {
    //Read the file
    console.log("Reading configuation file");
    var theData = fs.readFileSync(configPath, 'utf8');
    //Make sure the config has all of the options it should
    theConfig = checkConfig(configPath, JSON.parse(theData));
  } else {
    //Don't have a config file, so lets create one
    console.log("Creating configuration file");
    theConfig = checkConfig(configPath, {});
  }
  //Return the app's config to the calling program
  return theConfig;
};

//========================================================================
// Exports
//========================================================================
//export the function that returns the config object
module.exports.getConfig = getConfig;
//Return the file path for the app's configuration file
module.exports.getConfigFile = getConfigFile;
//Returns true if the script is running on the Windows platform
module.exports.isWindows = isWindowsPlatform;
#!/usr/bin/env node

/* jshint browser: true */

var colors = require('colors'),
  fs = require('fs'),
  path = require('path'),
  os = require('os');


//Set the following to true to write status
//to the console as it runs
var debugMode = false;
//Create a variable to hold the path name pointing to the configuration file
var config_path;
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

function doLog(msgText) {
  if (debugMode) {
    console.log(msgText);
  }
}
//========================================================================
// Validate the contents of the config file
//========================================================================
function checkConfig(theConfig) {
  //Some default values
  var default_platforms_osx = ['android', 'firefoxos', 'ios'];
  var default_platforms_win = ['android', 'firefoxos', 'wp8'];
  var default_plugin_list = ['org.apache.cordova.console', 'org.apache.cordova.dialogs', 'org.apache.cordova.device'];

  doLog("Validing configuration");
  //Track whether the config file has been changed
  var configChanged = false;
  //Are all of the properties we need there?
  //populate them with the ones we need
  //First check the platform list
  if (theConfig.platformList === undefined) {
    configChanged = true;
    doLog("Adding default platform list to config");
    if (isWindows) {
      theConfig.platformList = default_platforms_win;
    } else {
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
    //Add the value to the config
    theConfig.enableDebug = false;
    configChanged = true;
  }

  // Did we make any changes to the config?
  if (configChanged) {
    doLog("Writing configuation file");
    try {
      doLog("Writing configuration to " + config_path);
      fs.writeFileSync(config_path, JSON.stringify(theConfig, null, 4));
      //if on Linux variant...set the file permissions
      if (!isWindows) {
        doLog("Setting file permissions");
        try {
          fs.chmodSync(config_path, 0777);
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
// The config object
//========================================================================
var Config = function () {

  var theConfig;
  var config_file = "cordova-create.json";

  //Write some stuff to the screen
  doLog("\n" + stars);
  doLog("Getting configuration");
  //----------------------------------------------------------------------
  //Determine the user's home folder, varies per OS.
  //----------------------------------------------------------------------
  var theEnv = process.env;
  if (isWindows) {
    doLog("Running on Windows");
    //Set the default home folder for Windows
    config_path = theEnv.USERPROFILE;
  } else {
    doLog("Runnning on a Linux variant");
    //Home folder for OS X and Linux
    config_path = theEnv.HOME;
  }
  //Do we have a value?
  if (config_path.length > 0) {
    doLog('Home folder: ' + config_path);
    config_path = path.join(config_path, config_file);
    doLog('Configuration file: ' + config_path);
  } else {
    console.error("Unable to determine home folder".error);
    process.exit(1);
  }

  //--------------------------------------------------------------------
  // Does file exist?
  //--------------------------------------------------------------------
  if (fs.existsSync(config_path)) {
    //Read the file
    doLog("Reading configuation file");
    var theData = fs.readFileSync(config_path, 'utf8');
    //Make sure the config has all of the options it should
    theConfig = checkConfig(JSON.parse(theData));
  } else {
    //Don't have a config file, so lets create one
    doLog("Creating configuration file");
    theConfig = checkConfig({});
  }
  doLog(stars);
  //Return the app's config to the calling program
  return theConfig;
};
module.exports = Config;
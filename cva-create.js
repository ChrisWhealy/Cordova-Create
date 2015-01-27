#!/usr/bin/env node

/**
 * ============================================================================
 * @fileOverview cva-create
 * 
 * A node command for creating an entire Cordova project based on configurable
 * parameters
 * 
 * Author      : Chris Whealy (www.whealy.com)
 * Forked from : Cordova-Create by John M. Wargo (www.johnwargo.com)
 * ============================================================================
 **/

/**
 * @param {String} The first parameter is either:
 *                 a) The target folder name into which the Cordova project is
 *                    to be written, or
 *                 b) A cva-create directive such as:
 *                      "gen_config"
 *                      "update_config"
 *                      "restart"
 *                    
 *                 If any of the above the directives are supplied, no other
 *                 parameters are needed or will be processed, neither will a
 *                 Cordova project be built.
 *
 * @param {String} appId
 *                 The application id used to identify the Cordova application.
 *                 This value is used for all target platforms
 *
 * @param {String} appName
 *                 The name of the final application
 *
 * @param {String} 0..n Cordova platform names separated by spaces.  Any values
 *                 specified here override the values in both the global and
 *                 local configuration files.
 * 
 **/

/**
 * Processing sequence:
 *
 * 1) Examine the execution arguments to determine whether we have enough
 *    information to work with.
 *
 *    1.1) If any arguments are missing, throw toys out of pram and inform the
 *         user that they need to read the documentation before using this tool!
 *    1.2) If all the arguments are present, then store them for later use
 *
 * 2) If we need to do anything other than a build, then do that now.
 *    Actions other than build are:
 *      o gen_config      One-time use after first installing cva-creates
 *                        Generates a default cva-create.json in the user's home
 *                        directory
 *      o update_config   One-time use after an upgrade.
 *                        Merges new config properties (set to default values)
 *                        into an existing cva-create.json file in the user's
 *                        home directory 
 *      o restart         Attempts to restart a build after a previous build
 *                        failed.  The user must manually rectify the error
 *                        before attempting a restart.
 *
 * 3) Read the global configuration parameters. If local configuration parameters
 *    also exist, then update the global values with the local ones.
 *
 *    3.1) Look for cva-create.json in the user's home directory.
 *    
 *         If it exists, this file will contain the global configuration values
 *         applicable to all Cordova projects such as a list of default plugins
 *         and possibly proxy server settings.
 *
 *         3.1.1) If the user's home directory cannot be identified, then throw
 *                toys out pram and give up.
 *         3.1.2) If the global configuration file does not exist in the user's
 *                home directory, then create this file using the default values
 *                hard-coded in this program and continue.
 *
 *    3.2) Look for cva-create.json in the current directory.
 *    
 *         If it exists, this file will contain local configuration values
 *         applicable only to the current project.
 *
 *         3.2.1) If the local configuration file does not exist, no problem,
 *                just run with the default values found in the global
 *                configuration file.
 *         3.2.2) If a local configuration file does exist, then merge the
 *                values found in this file with the global configuration values
 *
 *                RULES:
 *                o Local string and Boolean property value overwrite the
 *                  corresponding global property values
 *                o Local platform list overwrites global platform list
 *                o Any platforms listed on the command line overwrite the local
 *                  platform list
 *                o The local and global plugin lists are added and duplicate
 *                  entries are removed.  The order in which the plugins are
 *                  added is preserved - global first, local second.
 *
 *    3.3) If the user has specified any platforms as command line parameters,
 *         use these values in preference to the values from the configuration
 *         files
 * 
 * 4) Switch the proxy server settings on or off as required
 *
 * 5) Now that we have a merged set of configuration parameters specific to the
 *    requirements of the current project, assemble the build instructions for
 *    this Cordova project
 *
 *    3.1) Run "cordova create" using the command line arguments as parameters
 *    3.2) Run "cordova platform add" for the required platforms
 *    3.3) Run "cordova plugin add" for each of the specified plugins
 *    3.4) Optionally adjust the config.xml file
 *    3.5) Optionally run "cordova prepare" 
 *
 **/

var utils  = require('./utils.js');
var app    = require('./Config.js');
var proxy  = require('./proxy.js');
var colors = require('colors');

var path    = utils.wrapLib(require('path'));
var fs      = utils.wrapLib(require('fs'));
var shelljs = utils.wrapLib(require('shelljs'));

var cmdStr    = 'cva-create app_dir app_id app_name [platform list]';
var shhhh     = {silent:true};
var startTime = Date.now();

colors.setTheme({info:'grey',help:'green',warn:'yellow',debug:'blue',error:'red',none:'white'});

var buildInstructions = [];
buildInstructions.addInstruction = addInstruction;

// ============================================================================
// Chop off the node command(s) that might be present at the start of the
// list of arguments
// ============================================================================
var userArgs = process.argv.slice((process.argv[0].toLowerCase() == 'node') ? 2 : 1);

var targetFolder, fqTargetFolder, appId, appName = '';
var platformArgs, targetPlatforms = [];

// The action variable will default to build unless the first parameter is one
// of 'gen_config', 'update_config' or 'restart'
var action = (userArgs[0] !== 'gen_config' &&
              userArgs[0] !== 'upgrade_config' &&
              userArgs[0] !== 'restart')
             ? "build"
             : userArgs[0];

// ============================================================================
// Get the configuration settings to build this app
// ============================================================================
var theConfig = new app.Config(action);

// ============================================================================
// Write out start banner, OS type, build environment flags
// ============================================================================
  utils.writeStartBanner();
  utils.writeToConsole('log',[["Running on " + utils.OSStr],
                              ["\n%s",utils.separator.warn],
                              ["  Checking local build environment".warn],
                              [utils.separator.warn],
                              ['git is' + (theConfig.buildEnv.hasGit ? ' ' : 'not ') + 'installed'],
                              ['npm is' + (theConfig.buildEnv.hasNpm ? ' ' : 'not ') + 'installed'],
                              ["\nCordova debug mode is " + ((theConfig.cordovaDebug) ? "en" : "dis") + "abled"]]);

// ============================================================================
// Define how to execute a Cordova command
// ============================================================================
var cordovaCmd = 'cordova' + (theConfig.cordovaDebug ? ' -d ' : ' ');

// If we've just done a gen_config or an upgrade_config, then we're done
// 'build' is assumed to be the default action
  switch (action) {
   case 'gen_config':
   case 'upgrade_config':
     // Does the global config file already exist?
     if (action === 'gen_config' && this.configFiles.globalConfig.exists) {
       // Yup, so in the case of gen_config, there's nothing to do
       utils.writeToConsole('log',[["Global configuration file %s already exists", this.configFiles.globalConfig.path],
                                   ["No further action taken.\n"]]);
     }
     else {
       // Either generate or upgrade the global config file depending on
       // whether or not the file already exists
       theConfig[(this.configFiles.globalConfig.exists ? 'upgrade' : 'generate') + 'GlobalConfig'](theConfig,this);
     }

     break;
   case 'restart':
     utils.writeToConsole('log',[["Restart functionality not implemented yet"]]);
     break;
   default:
     // Check that we've got enough parameters to work with
     if (userArgs.length > 2) {
       targetFolder    = userArgs[0];
       appId           = userArgs[1];
       appName         = userArgs[2];      
       platformArgs    = userArgs.slice(3);
       targetPlatforms = (platformArgs.length > 0) ? platformArgs : theConfig.platformList;
       
       // Check the target folder
       fqTargetFolder = path.join(process.env.PWD, targetFolder);
       
       if (fs.existsSync(fqTargetFolder)) {
         if (theConfig.replaceTargetDir) {
           utils.writeToConsole('log',[["\nReplacing target folder %s".warn, fqTargetFolder]]);
           shelljs.rm('-rf',targetFolder);
         }
         else {
           utils.writeToConsole('error',[["\nTarget folder %s already exists\n".error, fqTargetFolder]]);
           process.exit(1);
         }
       }
       
       doBuild(theConfig,targetFolder,appId,appName,targetPlatforms);
       
       // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
       // Write build instructions to file and then execute
       // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
//       utils.writeBuildInstructionsToFile(buildInstructions);
       buildInstructions.map(instructionHandler);       
     }
     else {
       utils.writeToConsole('error',[["\nMissing one or more parameters!".error],
                                     ["\nUsage: %s".warn, cmdStr]]);
       utils.showHelp();
     }
  }

// ============================================================================
// Pack up and go home
// ============================================================================
  var elapseTime = utils.interval(startTime);
  
  utils.writeToConsole('log',[["\nElapse time (min:sec) = %s:%s\nAll done!\n".help, elapseTime.minutes, elapseTime.seconds]]);


  
  
  
  
  
  
  
  

// ============================================================================
// Private API functions
// ============================================================================
function noOp() {};

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Define build instructions object
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
function instructionHandler(inst) { inst.fn.apply(this,inst.p); };
function addInstruction(lib,fn,p,c) { this.push({lib:lib, fn:fn, p:p, c:c || -1}) };

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Adjust config.xml file
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
function adjustConfigXmlFile(inFolder,newWidget) {
  var xmlHandler    = require('./XmlHandler.js');
  var xmlConfigFile = new xmlHandler.XmlConfigFile(inFolder);
  xmlConfigFile.update(newWidget);
}

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Execute a generic Cordova command
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
function execCvaCmd(commandStr) {
  var thisCmd = cordovaCmd + commandStr;
  utils.writeToConsole('log',[['Executing command: %s', thisCmd]]);
  var resCode = shelljs.exec(thisCmd).code;

  if (resCode !== 0) {
    utils.writeToConsole('error', [["Unable to execute command (error code: %s)".error, resCode]]);
    process.exit(1);
  }
};



// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Assemble the instructions to build the current project
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
function doBuild(theConfig,targetFolder,appId,appName,targetPlatforms) {
// Define npm and GIT proxy settings
  var proxySettings = new proxy.Handler(theConfig.proxy,
                                        theConfig.buildEnv.hasGit,
                                        theConfig.buildEnv.hasNpm);
  
// If both the copyFrom and linkTo properties are set to valid directories,
// then apart from being a nonsensical combination of configuration values,
// we will arbitrarily use copyFrom in preference to linkTo
  var copyFromExists = fs.existsSync(theConfig.copyFrom);
  var linkToExists   = fs.existsSync(theConfig.linkTo);
  var logMsg = [];
  var cmdSuffix = (copyFromExists) 
                  ? ' --copy-from "' + theConfig.copyFrom + '"'
                  : (linkToExists)
                      ? ' --link-to "' + theConfig.linkTo + '"'
                      : '';

  if (theConfig.copyFrom && !copyFromExists)
    logMsg.push(['Ignoring the value of the copyFrom property. %s does not exist',theConfig.copyFrom]);
  if (theConfig.linkTo && !linkToExists)
    logMsg.push(['Ignoring the value of the linkTo property. %s does not exist.',theConfig.linkTo]);
  
  if (logMsg.length > 0)
    buildInstructions.addInstruction('utils',utils.writeToConsole,[['warn',logMsg]]);
  
// Switch proxy server settings on or off as required
  buildInstructions.addInstruction('proxySettings',proxySettings.npmProxy, [(theConfig.proxy.useProxy) ? 'on' : 'off']);
  buildInstructions.addInstruction('proxySettings',proxySettings.gitProxy, [(theConfig.proxy.useProxy) ? 'on' : 'off']);

// Create Cordova project
  buildInstructions.addInstruction('utils',utils.writeToConsole,
                                   ['log',[["\n\n%s",utils.separator.warn],
                                           ["  Creating project".warn],
                                           [utils.separator.warn]]]);
  buildInstructions.addInstruction(null,execCvaCmd,
                                   ['create '+targetFolder+' '+appId+' "'+appName+'" '+theConfig.createParms+cmdSuffix]);

// Change into the target folder directory
  buildInstructions.addInstruction('utils',utils.writeToConsole,
                                   ['log',[["\n\nChanging to project folder (%s)".warn, targetFolder]]]);
  buildInstructions.addInstruction('shelljs',shelljs.pushd,[targetFolder, shhhh]);

// Add platforms
  buildInstructions.addInstruction('utils',utils.writeToConsole,
                                   ['log',[["\n\n%s",utils.separator.warn],
                                           ['  Adding platforms [%s] to the project'.warn, targetPlatforms.join(', ')],
                                           [utils.separator.warn]]]);
  buildInstructions.addInstruction(null,execCvaCmd,['platform add ' + targetPlatforms.join(' ')]);

// Add plugins
  buildInstructions.addInstruction('utils',utils.writeToConsole,
                                   ['log',[["\n\n%s",utils.separator.warn],
                                           ["  Adding Cordova Plugins".warn],
                                           [utils.separator.warn]]]);

  theConfig.pluginList.forEach(function(plugin) {
    buildInstructions.addInstruction('utils',utils.writeToConsole,
                                     ['log',[["\nAdding plugin %s to project".warn, plugin]]]);
    buildInstructions.addInstruction(null,execCvaCmd,['plugin add ' + plugin]);
  });


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Optional steps
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  buildInstructions.addInstruction(null, (theConfig.adjustConfigXml) ? adjustConfigXmlFile : noOp,
                                   [fqTargetFolder,theConfig.configXmlWidget]);
  
// Run "cordova prepare"?
  if (theConfig.runPrepare) {
    buildInstructions.addInstruction('utils',utils.writeToConsole,
                                     ['log',[["\nRunning cordova prepare".warn]]]);
    buildInstructions.addInstruction(null,execCvaCmd,['prepare']);
  }
}



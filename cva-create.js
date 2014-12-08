#!/usr/bin/env node

/**
 * ============================================================================
 * @fileOverview cva-create
 * 
 * A node command for creating an entire Cordova project based on configurable
 * parameters
 * 
 * Author      : Chris Whealy (www.whealy.com)
 * Forked from : cordova-create by John M. Wargo (www.johnwargo.com)
 * ============================================================================
 **/

/**
 * @param {String} The first parameter is either:
 *                 a) The target folder name into which the Cordova project is
 *                    to be written, or
 *                 b) The string "gen_gonfig".  This will cause the default
 *                    parameter settings to be written to a file called
 *                    "create-cordova.json" in the user's home directory.
 *                    This file can then be edited to supply values common to
 *                    all Cordova projects. Secondly, the file can be copied
 *                    into the current project directory (I.E. the one from
 *                    which cva-create is executed) and used to hold values
 *                    specific to the current project. 
 *                 
 *                 If "gen_config" is supplied, no other parameters are needed
 *                 or will be processed.
 *
 * @param {String} appId
 *                 The application id used to identify the Cordova application.
 *                 This value is used for all target platforms
 *
 * @param {String} appName
 *                 The name of the final application
 *
 * @param {String} 0..n Cordova platform names separated by spaces
 * 
 **/

/**
 * Processing sequence:
 *
 * 1) Examine the execution arguments to determine whether we have enough
 *    information to work with.
 *
 *    1.1) If any arguments are missing, throw toys out of pram and inform the
 *         user that they need to read the documentation before using this tool
 *    1.2) If all the arguments are present, then store them for later use
 *
 * 2) Read the global configuration parameters. If local configuration parameters
 *    also exist, then update the global values with the local ones.
 *
 *    2.1) Look for cva-create.json in the user's home directory.
 *         If it exists, this file will contain the global configuration values
 *         applicable to all Cordova projects such as a list of default plugins
 *         and possibly proxy server settings.
 *
 *         2.1.1) If the global configuration file cannot be found due to the
 *                fact that the user's home directory cannot be identified,
 *                then throw toys out pram and give up.
 *         2.1.2) If the global configuration file does not exist in the user's
 *                home directory, then create this file using the default values
 *                hard-coded in this program.
 *
 *    2.2) Look for cva-create.json in the current directory.
 *         If it exists, this file will contain local configuration values
 *         applicable only to the current project.
 *
 *         2.2.1) If the local configuration file does not exist, no problem,
 *                just run with the defaults found in the global configuration
 *                file.
 *         2.2.2) If a local configuration file does exist, then merge these
 *                values with the global configuration values.
 *
 *                RULES:
 *                o Local string and Boolean property value overwrite the
 *                  corresponding global property values
 *                o Local platform list overwrites global platform list
 *                o Local plugin list is added to the global plugin list.
 *                  Duplicate entries are removed and the plugin order is
 *                  preserved based on global first, local second.
 *
 *    2.3) If the user has specified any platforms as command line parameters,
 *         use these values in preference to the values from the configuration
 *         files
 * 
 * 3) Now that we have a merged set of configuration parameters specific to the
 *    requirements of the current project, start the process of building the
 *    Cordova project
 *
 *    3.1) Run "cordova create" using the command line arguments as parameters
 *    3.2) Run "cordova platform add" for the required platforms
 *    3.3) Run "cordova plugin add" for each of the specified plugins
 *    3.4) Optionally run "cordova prepare" 
 *
 **/

var app     = require('./Config.js');
var utils   = require('./utils.js');
var colors  = require('colors')
var fs      = require('fs')
var shelljs = require('shelljs');

var cmdStr = 'cva-create app_dir app_id app_name [platform list]';

var checkNpmHttpProxy  = 'npm config get proxy';
var checkNpmHttpsProxy = 'npm config get https-proxy';

var shhhh = {silent:true};
var noop  = function(){};

colors.setTheme({info:'grey',help:'green',warn:'yellow',debug:'blue',error:'red',none:'white'});

// ============================================================================
// Write out start banner
// ============================================================================
  utils.writeToConsole('log', [[utils.separator.help],
                               ["Cordova Create".help],
                               [utils.separator.help]]);

// ============================================================================
// Chop off the node command(s) that might be present at the start of the
// list of arguments
// ============================================================================
var userArgs = process.argv.slice((process.argv[0].toLowerCase() == 'node') ? 2 : 1);

var targetFolder, appID, appName = '';
var platformArgs, targetPlatforms = [];

var gen_config = (userArgs[0] === 'gen_config');

// ============================================================================
// Get the app's configuration settings
// ============================================================================
var theConfig = new app.Config(gen_config);

  // Is a global config file all that's needed?
  if (gen_config) {
    // Yup, so we're done
    process.exit(0);    
  }
  else {
    // Nope, so check that we've got enough parameters to work with
    if (userArgs.length > 2) {
      targetFolder    = userArgs[0];
      appID           = userArgs[1];
      appName         = userArgs[2];      
      platformArgs    = userArgs.slice(3);
      targetPlatforms = (platformArgs.length > 0) ? platformArgs : theConfig.platformList;
    }
    else {
      utils.writeToConsole('error',[["\nMissing one or more parameters!".error], ["\nUsage: %s".warn, cmdStr]]);
      utils.showHelp();
      process.exit(1);
    }
  }

// Write them to the log while we're testing this thing...
//  utils.writeToConsole('log',[['\nApp Config: %s\n', JSON.stringify(theConfig)]]);

// ========================================================================
// Check the target folder
// ========================================================================
  if (fs.existsSync(targetFolder)) {
    if (theConfig.replaceTargetDir) {
     utils.writeToConsole('log',[["\nReplacing target folder %s".warn, targetFolder]]);
     shelljs.rm('-rf',targetFolder);
    }
    else {
     utils.writeToConsole('error',[["\nTarget folder %s already exists\n".error, targetFolder],[utils.separator]]);
     process.exit(1);
    }
  }

// ============================================================================
// Check build environment
// ============================================================================
var hasGit           = (shelljs.exec('git --version', shhhh).code === 0);
var npmHttpProxySet  = (function(r) { return !(r.code === 0 && r.output.indexOf('null') === 0); })(shelljs.exec(checkNpmHttpProxy,shhhh));
var npmHttpsProxySet = (function(r) { return !(r.code === 0 && r.output.indexOf('null') === 0); })(shelljs.exec(checkNpmHttpsProxy,shhhh));

  utils.writeToConsole('log',[['\nGIT is' + (hasGit ? ' ' : 'not ') + 'installed']]);
  utils.writeToConsole('log',[['npm HTTP proxy is ' + (npmHttpProxySet ? 'set' : 'unset')]]);
  utils.writeToConsole('log',[['npm HTTPS proxy is ' + (npmHttpsProxySet ? 'set' : 'unset')]]);

// ========================================================================
// Define how to execute a Cordova command
// ========================================================================
var cordovaCmd = (function(isDebug) {
  utils.writeToConsole('log',[["\nCordova debug mode is " + ((isDebug) ? "en" : "dis")+ "abled"]]);
  return 'cordova' + ((isDebug) ? ' -d ' : ' ');
})(theConfig.cordovaDebug);
  
var executeCordovaCommand = function(commandStr) {
  var thisCmd = cordovaCmd + commandStr;
  utils.writeToConsole('log',[['Executing command: %s', thisCmd]]);
  var resCode = shelljs.exec(thisCmd).code;

  if (resCode !== 0) {
    utils.writeToConsole('error', [["Unable to execute command (error code: %s)".error, resCode]]);
    process.exit(1);
  }
};

var instructionHandler = function(inst) { inst.fn.apply(this,inst.p); };
var buildInstructions = [];

buildInstructions.addInstruction = function(fn,p) { this.push({fn:fn, p:p}) };

// ========================================================================
// Define npm and GIT proxy settings
// ========================================================================
var setProxy = (function(pConf) {  
  // Minimal validity test for proxy configuration
  if (pConf.useProxy && (pConf.http.host.length === 0)) {
    writeToConsole('error',[["Error: Either set proxy.useProxy to false or define a proxy host and port number"]]);
    process.exit(1);
  }

  var httpProxy  = 'http://'  + pConf.http.host  + ':' + pConf.http.port;
  var httpsProxy = 'https://' + pConf.https.host + ':' + pConf.https.port;
  
  var npmCmdPrefix = 'npm config ' + ((pConf.useProxy) ? 'set ' : 'delete ');
  var npmCmdHttp   = npmCmdPrefix + 'proxy '       + ((pConf.useProxy) ? httpProxy : '');
  var npmCmdHttps  = npmCmdPrefix + 'https-proxy ' + ((pConf.useProxy) ? httpsProxy : '');
  
  var gitCmdPrefix = 'git config --global' + ((pConf.useProxy) ? ' ' : ' --unset ');
  var gitCmdHttp   = gitCmdPrefix + 'http.proxy '  + ((pConf.useProxy) ? httpProxy : '');
  var gitCmdHttps  = gitCmdPrefix + 'https.proxy ' + ((pConf.useProxy) ? httpsProxy : '');

  // On *NIX boxes, do I need to care about writing the proxy settings to ~/.plugman/config?
  return function() {
           utils.writeToConsole('log',[['\nUpdating npm HTTP proxy server settings'.warn], [npmCmdHttp]]);
           shelljs.exec(npmCmdHttp,shhhh);

           utils.writeToConsole('log',[['\nUpdating npm HTTPS proxy server settings'.warn], [npmCmdHttps]]);
           shelljs.exec(npmCmdHttps,shhhh);

           if (hasGit) {
             utils.writeToConsole('log',[['\nUpdating proxy servers for GIT'.warn], [gitCmdHttp],[gitCmdHttps],[utils.separator]]);
             shelljs.exec(gitCmdHttp);
             shelljs.exec(gitCmdHttps);
           };
         };
})(theConfig.proxy);

// ========================================================================
// Create instruction set for building this project
// ========================================================================

// Set the npm proxy if required 
  buildInstructions.addInstruction(setProxy,[theConfig.proxy]);

// Create Cordova project
  buildInstructions.addInstruction(utils.writeToConsole, ['log',[["\n\nCreating project".warn]]]);
  buildInstructions.addInstruction(executeCordovaCommand,['create ' + targetFolder + ' ' + appID + ' "' + appName + '" ' + theConfig.createParms]);

// Change into the target folder directory
  buildInstructions.addInstruction(utils.writeToConsole, ['log',[["\n\nChanging to project folder (%s)".warn, targetFolder],[utils.separator]]]);
  buildInstructions.addInstruction(shelljs.pushd,[targetFolder, shhhh]);

// Add platforms
  buildInstructions.addInstruction(utils.writeToConsole,['log',[['\n\nAdding platforms [%s] to the project'.warn, targetPlatforms.join(', ')],[utils.separator]]]);
  buildInstructions.addInstruction(executeCordovaCommand,['platform add ' + targetPlatforms.join(' ')]);

// Add plugins
  buildInstructions.addInstruction(utils.writeToConsole,['log',[["\n\n"],[utils.separator.warn],["Adding Cordova Plugins".warn],[utils.separator.warn]]]);

  theConfig.pluginList.forEach(function(plugin) {
    buildInstructions.addInstruction(utils.writeToConsole,['log',[["\n\nAdding plugin %s to project".warn, plugin]]]);
    buildInstructions.addInstruction(executeCordovaCommand,['plugin add ' + plugin]);
  });
  
// Optionally run "cordova prepare"
  if (theConfig.runPrepare) {
    buildInstructions.addInstruction(utils.writeToConsole,['log',[["\nRunning cordova prepare".warn]]]);
    buildInstructions.addInstruction(executeCordovaCommand,['prepare']);
  }
  
// Finished
  buildInstructions.addInstruction(utils.writeToConsole,['log',[["\nAll done!\n".help]]]);

// ========================================================================
// Execute build instructions
// ========================================================================
  buildInstructions.map(instructionHandler);
  


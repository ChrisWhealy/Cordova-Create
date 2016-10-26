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

var confLib  = require('./Config.js');
var proxyLib = require('./Proxy.js');

// Define an execution context within which the build instructions can be performed
var execCtx = {}

  execCtx.noOp = function noOp() {};

  execCtx.utils  = require('./utils.js');
  execCtx.colors = require('colors');

  execCtx.colors.setTheme({info:'grey',help:'green',warn:'yellow',debug:'blue',error:'red',none:'white'});

  execCtx.path    = execCtx.utils.wrapLib(require('path'));
  execCtx.fs      = execCtx.utils.wrapLib(require('fs'));
  execCtx.shelljs = execCtx.utils.wrapLib(require('shelljs'));

  execCtx.shhhh = {silent:true};

var cmdStr = 'cva-create app_dir app_id app_name [platform list]';

var startTime  = Date.now();
var elapseTime = 0;

var buildInstructions = [];

  buildInstructions.addInst = addInst;

//* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Adjust config.xml file
//* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  execCtx.adjustConfigXmlFile = function adjustConfigXmlFile(inFolder,newWidget) {
    var xmlHandler    = require('./XmlHandler.js');
    var xmlConfigFile = new xmlHandler.XmlConfigFile(inFolder);
    return xmlConfigFile.update(newWidget);
  }

//* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Execute a generic Cordova command
//* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  execCtx.execCvaCmd = function execCvaCmd(commandStr) {
    var thisCmd = cordovaCmd + commandStr;
    execCtx.utils.writeToConsole('log',[['Executing command: %s', thisCmd]]);
    return execCtx.shelljs.exec(thisCmd).code;
  };

// ============================================================================
// Chop off the node command(s) that might be present at the start of the
// list of arguments
// ============================================================================
var userArgs = process.argv.slice((/node/i.exec(process.argv[0]).length > 0) ? 2 : 1);

// The action variable will default to build unless the first parameter is one
// of 'gen_config', 'update_config' or 'restart'
var action = (userArgs[0] !== 'gen_config' &&
              userArgs[0] !== 'upgrade_config' &&
              userArgs[0] !== 'restart')
             ? "build"
             : userArgs[0];

//=============================================================================
// Get the configuration settings to build this app
//=============================================================================
  execCtx.appConfig = new confLib.Config(action);

//=============================================================================
// Define npm and GIT proxy settings
//=============================================================================
  execCtx.proxySettings = new proxyLib.Handler(execCtx.appConfig.proxy,
                                               execCtx.appConfig.buildEnv.hasGit,
                                               execCtx.appConfig.buildEnv.hasNpm);

//=============================================================================
// Write out start banner, OS type, build environment flags
//=============================================================================
  execCtx.utils.writeStartBanner();
  execCtx.utils.writeToConsole('log',[["Running on " + execCtx.utils.OSStr],
                                      ["\n%s",execCtx.utils.separator.warn],
                                      ["  Checking local build environment".warn],
                                      [execCtx.utils.separator.warn],
                                      ['git is' + (execCtx.appConfig.buildEnv.hasGit ? ' ' : 'not ') + 'installed'],
                                      ['npm is' + (execCtx.appConfig.buildEnv.hasNpm ? ' ' : 'not ') + 'installed'],
                                      ["\nCordova debug mode is " + ((execCtx.appConfig.cordovaDebug) ? "en" : "dis") + "abled"]]);

//=============================================================================
// Define how to execute a Cordova command
//=============================================================================
var cordovaCmd = 'cordova' + (execCtx.appConfig.cordovaDebug ? ' -d ' : ' ');

// 'build' is assumed to be the default action
  switch (action) {
   // If we've just done a gen_config or an upgrade_config, then we're done
   case 'gen_config':
   case 'upgrade_config':
     // Does the global config file already exist?
     if (action === 'gen_config' && this.configFiles.globalConfig.exists) {
       // Yup, so in the case of gen_config, there's nothing to do
       execCtx.utils.writeToConsole('log',[["Global configuration file %s already exists", this.configFiles.globalConfig.path],
                                           ["No further action taken.\n"]]);
     }
     else {
       // Either generate or upgrade the global config file depending on
       // whether or not the file already exists
       execCtx.appConfig[(this.configFiles.globalConfig.exists ? 'upgrade' : 'generate') + 'GlobalConfig'](execCtx.appConfig,this);
     }

     break;
   case 'restart':
     execCtx.utils.writeToConsole('log',[["Restarting from last failed step\n".warn]]);
     
     // Restore build instructions and application config from the restart file
     var restartInst = execCtx.utils.readRestartInst();
     buildInstructions = restartInst.buildInstructions;
     execCtx.appConfig = restartInst.appConfig;

     break;
   default:
     // Check that we've got enough parameters to work with
     if (userArgs.length > 2) {
       var ac = execCtx.appConfig;
       ac.targetFolder = userArgs[0];
       ac.appId        = userArgs[1];
       ac.appName      = userArgs[2];      
       ac.platformArgs = userArgs.slice(3);

       ac.targetPlatforms = (ac.platformArgs.length > 0) ? ac.platformArgs : ac.platformList;
       
       // Check the target folder
       ac.fqTargetFolder = execCtx.path.join(process.env.PWD, ac.targetFolder);
       
       if (execCtx.fs.existsSync(ac.fqTargetFolder)) {
         if (ac.replaceTargetDir) {
           execCtx.utils.writeToConsole('log',[["\nReplacing target folder %s".warn, ac.fqTargetFolder]]);
           execCtx.shelljs.rm('-rf',ac.targetFolder);
         }
         else {
           execCtx.utils.writeToConsole('error',[["\nTarget folder %s already exists\n".error, ac.fqTargetFolder]]);
           process.exit(1);
         }
       }
       
       doBuild(execCtx);
     }
     else {
       execCtx.utils.writeToConsole('error',[["\nMissing one or more parameters!".error], ["\nUsage: %s".warn, cmdStr]]);
       execCtx.utils.showHelp();
       process.exit(1);
     }
  }

//=============================================================================
// As long as we have not been called with gen_config or upgrade_config, then
// invoke the build instructions.  This could be a regular build or a restart
//=============================================================================
  if (action !== 'gen_config' && action !== 'upgrade_config') {
    buildInstructions.map(instructionHandler, execCtx);
    execCtx.utils.writeRestartInst(buildInstructions,execCtx.appConfig);
  }

//=============================================================================
// Pack up and go home
//=============================================================================
  var idx = 0;

  elapseTime = execCtx.utils.interval(startTime);
  var failedSteps = buildInstructions.reduce(function(acc,inst) { if (inst.c > 0) acc[idx++] = stepName(inst,true); return acc; },[]);
  
  if (failedSteps.length > 0) {
    execCtx.utils.writeToConsole('log',[["\nThe following build steps failed".error], failedSteps]);
  }

  execCtx.utils.writeToConsole('log',[["\nElapse time (min:sec) = %s:%s".help, elapseTime.minutes, elapseTime.seconds],
                                      ["\nAll done with %s error%s\n".help,idx,(idx === 0 || idx > 1) ? 's' : '']]);


  
  
  
  
  
  
//=============================================================================
// Private API functions
//=============================================================================

/***
 * This function is mapped across the buildInstructions array to invoke each
 * instruction
 * 
 * @param inst
 *        Object containing the instruction information
 * @param i
 *        Index of the current instruction in the BuildInstructions array
 * @param buildInstArray
 *        The buildInstructions array
 * @returns
 *       Nothing
 */
function instructionHandler(inst,i,buildInstArray) {
  // The current command should be executed if it:
  //  a) is mandatory
  //  b) has never been executed, or
  //  c) failed last time it was attempted
  if (inst.m || inst.c !== 0) {
    var retVal = (inst.lib) ? this[inst.lib][inst.fn].apply(this,inst.p) : this[inst.fn].apply(this,inst.p);
    inst.c = (execCtx.utils.isNumeric(retVal)) ? retVal : (retVal === null) ? 1 : 0;      
    buildInstArray[i] = inst;
  }
  else {
    execCtx.utils.writeToConsole('log',[["Skipping successful step \"%s\"",stepName(inst)]]);
  }
};

/***
 * Add instruction to build instructions array
 * @param l
 *        Library name.  This could be null if the function belongs to cva-create.js
 * @param f
 *        Function name
 * @param p
 *        Parameters. Default = []
 * @param c
 *        Return code. Default = -1
 *        -1 = Not yet executed
 *         0 = Execution succeeded
 *        >0 = Execution failed
 * @param m
 *        Mandatory. Default = false
 *        If true, then this command must be executed during a restart
 * @returns
 *        Nothing
 */
function addInst(l,f,p,c,m) { this.push({lib:l, fn:f, p:p || [], c:c || -1, m:m || false}) };

/***
 * Build instruction step name
 * 
 * @param inst
 *        Object: The current instruction
 * @param addParams
 *        Boolean: Whether the function parameters should be added to the step name
 * @returns
 *        String: The step name
 */
function stepName(inst,addParams) { return (inst.lib ? inst.lib + '.' : '') + inst.fn + '(' + (addParams ? inst.p.join(',') : '') + ')'; }

//* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Assemble the instructions to build the current project
//* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
function doBuild(execCtx) {
// If both the copyFrom and linkTo properties are set to valid directories, then
// apart from being a nonsensical combination of configuration values, we will
// arbitrarily use the copyFrom value in preference to the linkTo value
  var copyFromExists = execCtx.fs.existsSync(execCtx.appConfig.copyFrom);
  var linkToExists   = execCtx.fs.existsSync(execCtx.appConfig.linkTo);
  var logMsg = [];
  var cmdSuffix = (copyFromExists) 
                  ? ' --copy-from "' + execCtx.appConfig.copyFrom + '"'
                  : (linkToExists)
                      ? ' --link-to "' + execCtx.appConfig.linkTo + '"'
                      : '';

  if (execCtx.appConfig.copyFrom && !copyFromExists)
    logMsg.push(['Ignoring the value of the copyFrom property. %s does not exist',execCtx.appConfig.copyFrom]);
  if (execCtx.appConfig.linkTo && !linkToExists)
    logMsg.push(['Ignoring the value of the linkTo property. %s does not exist.',execCtx.appConfig.linkTo]);
  
  if (logMsg.length > 0)
    buildInstructions.addInst('utils',execCtx.utils.writeToConsole.name,[['warn',logMsg]],null,true);
  
// Switch proxy server settings on or off as required
  buildInstructions.addInst('proxySettings',execCtx.proxySettings.setNpmProxy.name, [(execCtx.appConfig.proxy.useProxy) ? 'on' : 'off']);
  buildInstructions.addInst('proxySettings',execCtx.proxySettings.setGitProxy.name, [(execCtx.appConfig.proxy.useProxy) ? 'on' : 'off']);

// Create Cordova project
  buildInstructions.addInst('utils',execCtx.utils.writeToConsole.name,
                                   ['log',[["\n\n%s",execCtx.utils.separator.warn],
                                           ["  Creating project".warn],
                                           [execCtx.utils.separator.warn]]],null,true);
  buildInstructions.addInst(null,execCtx.execCvaCmd.name,
                                   ['create '+execCtx.appConfig.targetFolder+' '+execCtx.appConfig.appId+' "'+
                                    execCtx.appConfig.appName+'" '+execCtx.appConfig.createParms+cmdSuffix]);

// Change into the target folder directory
  buildInstructions.addInst('utils',execCtx.utils.writeToConsole.name,
                                   ['log',[["\n\nChanging to project folder (%s)".warn, execCtx.appConfig.targetFolder]]],null,true);
  buildInstructions.addInst('shelljs',execCtx.shelljs.pushd.name,[execCtx.appConfig.targetFolder,execCtx.shhhh],null,true);

// Add platforms
  buildInstructions.addInst('utils',execCtx.utils.writeToConsole.name,
                                   ['log',[["\n\n%s",execCtx.utils.separator.warn],
                                           ['  Adding platforms [%s] to the project'.warn, execCtx.appConfig.targetPlatforms.join(', ')],
                                           [execCtx.utils.separator.warn]]],null,true);
  buildInstructions.addInst(null,execCtx.execCvaCmd.name,['platform add ' + execCtx.appConfig.targetPlatforms.join(' ')]);

// Add plugins
  buildInstructions.addInst('utils',execCtx.utils.writeToConsole.name,
                                   ['log',[["\n\n%s",execCtx.utils.separator.warn],
                                           ["  Adding Cordova Plugins".warn],
                                           [execCtx.utils.separator.warn]]],null,true);

  execCtx.appConfig.pluginList.forEach(function(plugin) {
    buildInstructions.addInst('utils',execCtx.utils.writeToConsole.name,
                                     ['log',[["\nAdding plugin %s to project".warn, plugin]]],null,true);
    buildInstructions.addInst(null,execCtx.execCvaCmd.name,['plugin add ' + plugin]);
  });


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Optional steps
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  buildInstructions.addInst(null, (execCtx.appConfig.adjustConfigXml) ? execCtx.adjustConfigXmlFile.name : execCtx.noOp.name,
                                   [execCtx.appConfig.fqTargetFolder,execCtx.appConfig.configXmlWidget]);
  
// Run "cordova prepare"?
  if (execCtx.appConfig.runPrepare) {
    buildInstructions.addInst('utils',execCtx.utils.writeToConsole.name,
                                     ['log',[["\nRunning cordova prepare".warn]]],null,true);
    buildInstructions.addInst(null,execCtx.execCvaCmd.name,['prepare'],null,true);
  }
}



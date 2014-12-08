#!/usr/bin/env node
/* jshint browser: true */

/**
 * ============================================================================
 * @fileOverview Config
 * 
 * Define a constructor function and prototype for handling cordova-create.json
 * files
 * 
 * Author      : Chris Whealy (www.whealy.com)
 * Forked from : cordova-create by John M. Wargo (www.johnwargo.com)
 * ============================================================================
 **/

var colors = require('colors');
var fs     = require('fs');
var path   = require('path');
var os     = require('os');
var utils  = require('./utils.js');

colors.setTheme({ info: 'grey', help: 'green', warn: 'yellow', debug: 'blue', error: 'red' });

// ============================================================================
// Check that the user's home path can be identified
// If this fails, then throw toys out of pram, pack up and go home
// ============================================================================
var homeEnv  = (utils.isWindows) ? 'USERPROFILE' : 'HOME';
var homePath = process.env[homeEnv];

if (!homePath || homePath.length == 0) {
  utils.writeToConsole('error',
      [["\nUser home directory cannot be identified!".error],
       ["Please set the environment variable " + homeEnv + " to a valid location"]]);
  process.exit(1);
}

// ============================================================================
// Properties used by the prototype and their default values
// ============================================================================
var configFileName = "cva-create.json";

var platformsByOS  = {
  windows : ['android', 'windows'],
  linux   : ['ubuntu'],
  osx     : ['android', 'ios'],
  unknown : ['android']
};

var defaultPlugins = ['org.apache.cordova.console',
                      'org.apache.cordova.dialogs',
                      'org.apache.cordova.device'];
var server   = { host : "", port : 0 }; 
var proxyDef = { useProxy : false, http : server, https : server };

//* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
var defaultPlatformList = (function(p) {
  return (utils.isWindows)
         ? p.windows
         : (utils.isOSX)
           ? p.osx
           : (utils.isLinux)
             ? p.linux
             : p.unknown;
})(platformsByOS);

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Build config file names and check for existence
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
var configFiles = (function(fName) {
  var localConfigFile  = path.join(".", fName);
  var globalConfigFile = path.join(homePath, fName);
  
  return {
    globalConfig : { path : globalConfigFile, exists : fs.existsSync(globalConfigFile) },
    localConfig  : { path : localConfigFile,  exists : fs.existsSync(localConfigFile) }
  }
})(configFileName);

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Transfer properties from source to destination object
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
var setProperties = function(src, dest, mergePlugins) {
  for (var p in src) {
    if (p in dest) {
      dest[p] = (mergePlugins && p === 'pluginList' && utils.isArray(src[p]))
                ? utils.union(dest[p], src[p])
                : src[p];
    }
    else {
      utils.writeToConsole('log',[["Ignoring unknown property %s".warn, p]]);
    }
  }
};

// ============================================================================
// Config constructor
// ============================================================================
var Config = function(config_only) {
  var localConfig  = {};
  var globalConfig = Config.prototype;

  utils.writeToConsole('log',[["Running on " + utils.OSStr]]);
  
  // Does the global config file already exist?
  if (this.configFiles.globalConfig.exists) {
    // Yup, were we called with gen_config? 
    if (config_only) {
      // Yup, so there's nothing to do
      utils.writeToConsole('log',[["Global configuration file %s already exists", this.configFiles.globalConfig.path]]);
    }
    else {
      // Nope, so read global config file
      utils.writeToConsole('log',[["Reading global configuration file %s", this.configFiles.globalConfig.path]]);
      globalConfig = utils.readJSONFile(this.configFiles.globalConfig.path);      
    }
  }
  else {
    // Nope, so irrespective of whether we were called with gen_config or not, a
    // global configuration file needs to be created
    utils.writeToConsole('log',[["Creating global configuration file %s", this.configFiles.globalConfig.path]]);
    utils.writeToFile(this.configFiles.globalConfig.path, JSON.stringify(globalConfig, null, 4), 0755);
    this.configFiles.globalConfig.exists = true;
  }

  // As long as we need to build an entire project
  if (!config_only) {
    // Irrespective of where the global property values came from, transfer them
    // into the current Config instance
    setProperties(globalConfig, this, false);
    
    // Now check for the existence of a local configuration file
    if (this.configFiles.localConfig.exists) {
      utils.writeToConsole('log',[["Merging values from local configuration file %s", this.configFiles.localConfig.path]]);
      localConfig = utils.readJSONFile(this.configFiles.localConfig.path);
    }
    else {
      utils.writeToConsole('log',[["Local configuration file not found, using global defaults instead"]]);
    }
    
    setProperties(localConfig, this, true);
  }
};

// ============================================================================
// Create the properties and functions for Config.prototype
// ============================================================================
[['cordovaDebug',     {e:true,  w:true,  c:false, v:false}],
 ['copyFrom',         {e:true,  w:true,  c:false, v:""}],
 ['linkTo',           {e:true,  w:true,  c:false, v:""}],
 ['createParms',      {e:true,  w:true,  c:false, v:""}],
 ['replaceTargetDir', {e:true,  w:true,  c:false, v:false}],
 ['runPrepare',       {e:true,  w:true,  c:false, v:false}],
 ['iWindows',         {e:false, w:true,  c:false, v:utils.isWindows}],
 ['isLinux',          {e:false, w:true,  c:false, v:utils.isLinux}],
 ['isOSX',            {e:false, w:true,  c:false, v:utils.isOSX}],
 ['configFiles',      {e:false, w:false, c:false, v:configFiles}],
 ['pluginList',       {e:true,  w:true,  c:false, v:defaultPlugins}],
 ['platformList',     {e:true,  w:true,  c:false, v:defaultPlatformList}],
 ['proxy',            {e:true,  w:true,  c:false, v:proxyDef}]
].map(utils.defProp,Config);

// ============================================================================
// Exports
// ============================================================================
 module.exports.Config = Config;

 
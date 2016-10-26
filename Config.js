#!/usr/bin/env node
/* jshint browser: true */

/**
 * ============================================================================
 * @fileOverview Config
 * 
 * Define a constructor function and prototype for handling cordova-create.json
 * files
 * 
 * Author : Chris Whealy (www.whealy.com)
 * ============================================================================
 **/

var utils  = require('./utils.js');
var colors = require('colors');

var fs      = utils.wrapLib(require('fs'));
var path    = utils.wrapLib(require('path'));
//var os      = utils.wrapLib(require('os'));
var shelljs = utils.wrapLib(require('shelljs'));


var shhhh     = {silent:true};
var rw_r__r__ = '0644';
var fName     = "cva-create.json";

colors.setTheme({ info: 'grey', help: 'green', warn: 'yellow', debug: 'blue', error: 'red' });

// ============================================================================
// Properties used by the prototype and their default values
// ============================================================================
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
var proxyDef = {
  useProxy            : false,
  useCredentials      : false,
  proxyUser           : '',
  proxyPassword       : '',
  secureProxyUsesHttp : false,
  http                : server,
  https               : server
};

// ============================================================================
// Build environment flags
// ============================================================================
var buildEnv = {
  hasNpm : shelljs.exec('npm --version', shhhh).code === 0,
  hasGit : shelljs.exec('git --version', shhhh).code === 0
}

//* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
var defaultPlatformList = (function(p) {
  return (utils.isWindows) ? p.windows : (utils.isOSX) ? p.osx : (utils.isLinux) ? p.linux : p.unknown;
})(platformsByOS);

/***
 * Generic XML element:
 * @property elementName {String}
 * @property attributes  {Object with 0..n name/value pairs}
 * @property content     {List of 0..n Strings or xmlElement objects}
 * 
 * This JSON representation of an XML object deliberately does not use the
 * syntax used by the node module xml2js.  This is simply because that syntax
 * is not so easy to write by hand.  Instead, a more intuitive syntax is used
 * that can easily be written by the end user when editing the configuration
 * file.  This format is translated into the syntax used by xml2js before being
 * written back to config.xml
 * 
 */ 

var xmlElement = {
  elementName : "",
  attributes  : {},
  content     : []
};

// ============================================================================
// Constructor
// ============================================================================
function Config(action) {
  var homeEnv          = (utils.isWindows) ? 'USERPROFILE' : 'HOME';
  var homePath         = process.env[homeEnv];
  var localConfigFile  = path.join(".", fName);
  var globalConfigFile = path.join(homePath, fName);

  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  // Check that the user's home path can be identified
  // If this fails, then throw toys out of pram, pack up and go home
  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  if (!homePath || homePath.length == 0) {
    utils.writeToConsole('error',
        [["\nUser home directory cannot be identified!".error],
         ["Please set the environment variable " + homeEnv + " to a valid location"]]);
    process.exit(1);
  }
  
  this.configFiles.globalConfig.path = globalConfigFile
  this.configFiles.localConfig.path  = localConfigFile;

  this.configFiles.globalConfig.exists = fs.existsSync(globalConfigFile);
  this.configFiles.localConfig.exists  = fs.existsSync(localConfigFile);
  
  // The global config object will contain either the contents of the global config
  // file (if it exists), or the default values from the prototype 
  var globalConfig = (this.configFiles.globalConfig.exists)
                     ? utils.readJSONFile(this.configFiles.globalConfig.path)
                     : Config.prototype;
  
  // Does the global config file already exist?
  if (this.configFiles.globalConfig.exists) {
    // Yup, so merge it with values from the prototype. The merge guarantees that
    // all property values exist and have at least a default value
    mergeProperties(globalConfig, this);
  }
  else {
    // Nope, so create a global configuration file using the prototype defaults
    // and update the config properties
    utils.writeToFile(this.configFiles.globalConfig.path, JSON.stringify(Config.prototype, null, 2), rw_r__r__);
    this.configFiles.globalConfig.exists = true;
  }
  
  // Now read the local configuration file
  var localConfig = utils.readJSONFile(this.configFiles.localConfig.path);
  
  mergeProperties(localConfig, this);
}







// ============================================================================
// Public API
// ============================================================================

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Generate a global config file
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
function generateGlobalConfig() {
  utils.writeToConsole('log',[["Creating global configuration file %s", this.configFiles.globalConfig.path]]);
  utils.writeToFile(this.configFiles.globalConfig.path, JSON.stringify(globalConfig, null, 2), rw_r__r__);
  this.configFiles.globalConfig.exists = true;
};

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Upgrade the global config file so that it contains any new properties in the
// latest version of cva-create.
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
function upgradeGlobalConfig(oldGlobal, newGlobal) {
  utils.writeToConsole('log',[["Upgrading global configuration file %s", this.configFiles.globalConfig.path]]);

  for (var p in newGlobal) {
    if (!(p in oldGlobal)) {
      utils.writeToConsole('log',[["Adding property %s to global config",p]]);
      oldGlobal[p] = newGlobal[p];      
    }
    else
      if (typeof oldGlobal[p] == 'object')
        oldGlobal[p] = upgradeGlobalConfig(oldGlobal[p], newGlobal[p]);      
  }
  
  return oldGlobal;
};

// ============================================================================
// Create enumerable properties and functions for Config.prototype
// ============================================================================
  Config.prototype.cordovaDebug     = false;
  Config.prototype.runPrepare       = false;
  Config.prototype.replaceTargetDir = false;
  Config.prototype.adjustConfigXml  = false;

  Config.prototype.copyFrom     = "";
  Config.prototype.linkTo       = "";
  Config.prototype.buildEnv     = buildEnv;
  Config.prototype.createParms  = "";

  Config.prototype.defaultPlugins  = defaultPlugins;
  Config.prototype.pluginList      = [];
  Config.prototype.platformList    = defaultPlatformList;
  Config.prototype.proxy           = proxyDef;
  Config.prototype.configXmlWidget = [xmlElement];

  Config.prototype.configFiles = {
    globalConfig : { path : '', exists : false },
    localConfig  : { path : '', exists : false }
  };

// ============================================================================
// Create non-enumerable properties and functions for Config.prototype
// ============================================================================
[['isWindows', {e:false, w:true,  c:false, v:utils.isWindows}],
 ['isLinux',   {e:false, w:true,  c:false, v:utils.isLinux}],
 ['isOSX',     {e:false, w:true,  c:false, v:utils.isOSX}],

 ['generateGlobalConfig', {e:true,  w:false,  c:false, v:generateGlobalConfig}],
 ['upgradeGlobalConfig',  {e:true,  w:false,  c:false, v:upgradeGlobalConfig}]
].map(utils.defProp,Config);



// ============================================================================
// Exports
// ============================================================================
 module.exports.Config = Config;


// ============================================================================
// Private API
// ============================================================================
 
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Merge properties from the source object into the destination object.
// This will merge values read from either the global or local config files into
// the current instance
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
function mergeProperties(src, dest) {
  var unite = false;
  
  for (var p in src) {
    if (p in dest) {
      unite = (utils.isArray(src[p]) && (p === 'pluginList' || p === 'configXmlWidget'));
  
      // The local pluginList and configXmlWidget values must be merged with the
      // global values.  In all other cases, the local value overrides the global
      // value
      dest[p] = (unite) ? utils.union(dest[p], src[p]) : src[p];
    }
    else {
      utils.writeToConsole('log',[["Ignoring unknown property %s in the config file".warn, p]]);
    }
  }
};


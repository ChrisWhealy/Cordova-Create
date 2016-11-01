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
var whoAmI  = "Config";
var traceOn = false;

var utils  = require('./utils.js');
var colors = require('colors');

var fs      = utils.wrapLib(require('fs'));
var path    = utils.wrapLib(require('path'));
var shelljs = utils.wrapLib(require('shelljs'));

var trace = utils.trace(traceOn);

var shhhh     = {silent:true};
var rw_r__r__ = '0644';

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

var configFiles = {
  globalConfig : { path : "", exists : false },
  localConfig  : { path : "", exists : false }
}

// ============================================================================
// Build environment flags
// ============================================================================
var buildEnv = {
  hasNpm : shelljs.exec('npm --version', shhhh).code === 0,
  hasGit : shelljs.exec('git --version', shhhh).code === 0
}

//* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
var defaultPlatformList = (p => (utils.isWindows)
                                ? p.windows
                                : (utils.isOSX)
                                  ? p.osx
                                  : (utils.isLinux)
                                    ? p.linux
                                    : p.unknown)
                          (platformsByOS);

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
//
// 1) Determine if the global config file exists
//    a) If it does not, create it using values from the constructor's prototype
//    b) If it does, then merge its contents into the default values
// 2) Determine if a local config file exists
//    a) If it does not, then we're done
//    b) If it does, then merge its contents into the default values
// ============================================================================
function Config(action) {
  trace(whoAmI,"Constructor",true);

  var fName    = "cva-create.json";
  var homeEnv  = (utils.isWindows) ? 'USERPROFILE' : 'HOME';
  var homePath = process.env[homeEnv];

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

  var localConfigFile  = path.join(".", fName);
  var globalConfigFile = path.join(homePath, fName);
  
  this.configFiles.globalConfig.path   = globalConfigFile
  this.configFiles.globalConfig.exists = fs.existsSync(globalConfigFile);

  this.configFiles.localConfig.path   = localConfigFile;
  this.configFiles.localConfig.exists = fs.existsSync(localConfigFile);
  
  // Does the global config file already exist?
  if (this.configFiles.globalConfig.exists) {
    // Yup, so read that file and merge its contents with values from the prototype.
    // The merge guarantees that all property values exist and have at least a
    // default value
    mergeProperties("global",utils.readJSONFile(this.configFiles.globalConfig.path), this);
  }
  else {
    // Nope, so create a global configuration file
    generateGlobalConfig(this);
  }
  
  // Now read the local configuration file and merge its contents with the global values
  mergeProperties("local",utils.readJSONFile(this.configFiles.localConfig.path), this);

  trace(whoAmI,"Constructor",false);
}







// ============================================================================
// Public API
// ============================================================================

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Generate a global config file
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
function generateGlobalConfig(gc) {
  trace(whoAmI,"generateGlobalConfig",true);

  utils.writeToFile(gc.configFiles.globalConfig.path, JSON.stringify(gc, null, 2), rw_r__r__);
  gc.configFiles.globalConfig.exists = true;

  trace(whoAmI,"generateGlobalConfig",false);
};

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Upgrade the global config file so that it contains any new properties in the
// latest version of cva-create.
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
function upgradeGlobalConfig(pathname) {
  return upgradeConfig(pathname,"global");
};

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Upgrade the global config file so that it contains any new properties in the
// latest version of cva-create.
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
function upgradeLocalConfig(pathname,newLocalConfig) {
  return upgradeConfig(pathname,"local");
};

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Replace renamed property
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
function replaceProperty(config) {
  // Look for old property names that need to be renamed
  // Does the "createParms" property exist?
  if (config["createParms"] !== undefined) {
    // Does "createParms" have a value?
    if (config["createParms"] !== "") {
      // If the "createParms" property has a value, it must be a double-escaped JSON string
      // When parsed twice, we expect that string to contain the property plugin_search_path
      var psp = JSON.parse(JSON.parse(config["createParms"])).plugin_search_path;

      // Transfer old value to new property
      config.pluginSearchPath = (psp) ? psp : "";
    }

    // Delete the old property
    delete config.createParms;
  }

  return config;
}

// ============================================================================
// Create enumerable properties and functions for Config.prototype
// ============================================================================
  Config.prototype.cordovaDebug     = false;
  Config.prototype.runPrepare       = false;
  Config.prototype.replaceTargetDir = false;
  Config.prototype.adjustConfigXml  = false;

  Config.prototype.copyFrom         = "";
  Config.prototype.linkTo           = "";
  Config.prototype.pluginSearchPath = "";

  Config.prototype.pluginList      = [];
  Config.prototype.platformList    = defaultPlatformList;
  Config.prototype.proxy           = proxyDef;
  Config.prototype.configXmlWidget = [xmlElement];

// ============================================================================
// Create non-enumerable properties and functions for Config.prototype
// 
// Making these properties non-enumerable ensures that they will not be
// encountered during a `for in` loop
// ============================================================================
[['isWindows', {e:false, w:true,  c:false, v:utils.isWindows}],
 ['isLinux',   {e:false, w:true,  c:false, v:utils.isLinux}],
 ['isOSX',     {e:false, w:true,  c:false, v:utils.isOSX}],

 ['buildEnv',       {e:false, w:true, c:true, v:buildEnv}],
 ['defaultPlugins', {e:false, w:true, c:true, v:defaultPlugins}],
 ['configFiles',    {e:false, w:true, c:true, v:configFiles}],

 ['generateGlobalConfig', {e:true, w:false, c:false, v:generateGlobalConfig}],
 ['upgradeGlobalConfig',  {e:true, w:false, c:false, v:upgradeGlobalConfig}],
 ['upgradeLocalConfig',   {e:true, w:false, c:false, v:upgradeLocalConfig}]
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
function mergeProperties(fromStr, src, dest) {
  trace(whoAmI,"mergeProperties",true);
  var unite = false;
  
  for (var p in src) {
    unite = (utils.isArray(src[p]) && (p === 'pluginList' || p === 'configXmlWidget'));

    // The local pluginList and configXmlWidget values must be merged with the
    // global values.  In all other cases, the local value overrides the global
    // value
    dest[p] = (unite) ? utils.union(dest[p], src[p]) : src[p];
  }

  trace(whoAmI,"mergeProperties",false);
};

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Upgrade a config file
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
function upgradeConfig(pathname,location) {
  trace(whoAmI,"upgradeConfig",true);
  utils.writeToConsole('log',[["Upgrading %s configuration file %s", location, pathname]]);

  // Read config file replacing any renamed properties
  var config = replaceProperty(utils.readJSONFile(pathname));

  // Upgrade the config object and write the file
  var upgradedConfig = (location === "global")
                       ? upgradeGlobalConfigObject(config, Config.prototype)
                       : upgradeLocalConfigObject(config, Config.prototype);

  utils.writeToFile(pathname, JSON.stringify(upgradedConfig, null, 2), rw_r__r__);
  
  trace(whoAmI,"upgradeConfig",false);
  return upgradedConfig;
};

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Upgrade global configuration object with new properties
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
function upgradeGlobalConfigObject(oldConfig, newConfig) {
  trace(whoAmI,"upgradeGlobalConfigObject",true);

  for (var p in newConfig) {
    if (!(p in oldConfig)) {
      oldConfig[p] = newConfig[p];      
    }
    else
      if (typeof oldConfig[p] === 'object')
        oldConfig[p] = upgradeGlobalConfigObject(oldConfig[p], newConfig[p]);      
  }
  
  trace(whoAmI,"upgradeGlobalConfigObject",false);
  return oldConfig;
};

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Upgrade local configuration object with new properties
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
function upgradeLocalConfigObject(oldConfig, newConfig) {
  trace(whoAmI,"upgradeLocalConfigObject",true);

  for (var newProp in newConfig) {
    if (newProp in oldConfig &&
        typeof oldConfig[newProp] === 'object') {
      oldConfig[newProp] = upgradeLocalConfigObject(oldConfig[newProp], newConfig[newProp]);
    }
  }
  
  trace(whoAmI,"upgradeLocalConfigObject",false);
  return oldConfig;
};

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Replace renamed property
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
function replaceProperty(config) {
  // Look for old property names that need to be renamed
  // Does the "createParms" property exist?
  if (config["createParms"] !== undefined) {
    // Does "createParms" have a value?
    if (config["createParms"] !== "") {
      // If the "createParms" property has a value, it must be a double-escaped JSON string
      // When parsed twice, we expect that string to contain the property plugin_search_path
      var psp = JSON.parse(JSON.parse(config["createParms"])).plugin_search_path;

      // Transfer old value to new property
      config.pluginSearchPath = (psp) ? psp : "";
    }

    // Delete the old property
    delete config.createParms;
  }

  return config;
}




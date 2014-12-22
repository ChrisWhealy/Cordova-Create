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
 * Forked from : Cordova-Create by John M. Wargo (www.johnwargo.com)
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

/***
 * Since various attributes can contain place holder values instead of literal
 * values, these properties need their own function to return the substituted
 * value rather than the literal place holder value
 */


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
// Merge properties from the source object into the destination object.
// This will merge values read from either the global or local config files into
// the current instance
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
var mergeProperties = function(src, dest) {
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
      utils.writeToConsole('log',[["Ignoring unknown property %s in the local config file".warn, p]]);
    }
  }
};

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Upgrade the global config file so that it contains any new properties in the
// latest version of cva-create.
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
var upgradeGlobalConfig = function(oldGlobal, newGlobal) {
  for (var p in newGlobal) if (!(p in oldGlobal)) oldGlobal[p] = newGlobal[p];

  return oldGlobal;
};

// ============================================================================
// Config constructor
// ============================================================================
var Config = function(action) {
  utils.writeToConsole('log', [["\n%s",utils.separator.warn],
                               ["  Building runtime configuration from global and local configuration files".warn],
                               [utils.separator.warn]]);

  // We start by assuming that neither the local nor global config files exist.
  // Therefore, the localConfig object is assumed to be empty and the global config
  // object is assumed to contain the defaults from the prototype
  var localConfig  = {};
  var globalConfig = Config.prototype;

  utils.writeToConsole('log',[["Running on " + utils.OSStr]]);
  
  // Does the global config file already exist?
  if (this.configFiles.globalConfig.exists) {
    // Yup, so check if we were called with the gen_config parameter?
    if (action == 'gen_config') {
      // Yup, so there's nothing to do
      utils.writeToConsole('log',[["Global configuration file %s already exists", this.configFiles.globalConfig.path],
                                  ["No further action taken.\n"]]);
    }
    else {
      // Nope, so read global config file, but tell the user that a possible
      // upgrade might take place
      utils.writeToConsole('log',[["%sing global configuration file %s",
                                   (action == 'upgrade_config') ? "Upgrad" : "Read",
                                   this.configFiles.globalConfig.path]]);
      globalConfig = utils.readJSONFile(this.configFiles.globalConfig.path);      

      // Are we doing an upgrade?
      if (action == 'upgrade_config') {
        // Yup, so the values we've read from the existing file will not contain
        // any new properties.  Therefore, merge the new properties into the
        // existing global config and update the file
        globalConfig = upgradeGlobalConfig(globalConfig, this);
        utils.writeToFile(this.configFiles.globalConfig.path, JSON.stringify(globalConfig, null, 4), 0755);
      }
    }
  }
  else {
    // Nope, so irrespective of whether we were called with gen_config or not, a
    // global configuration file needs to be created
    utils.writeToConsole('log',[["Creating global configuration file %s", this.configFiles.globalConfig.path]]);
    utils.writeToFile(this.configFiles.globalConfig.path, JSON.stringify(globalConfig, null, 4), 0755);
    this.configFiles.globalConfig.exists = true;
  }

  // Are we doing a build?
  if (action == 'build') {
    // Yup, so irrespective of where the global property values came from,
    // transfer them into the current Config instance
    mergeProperties(globalConfig, this);
    
    // Now check for the existence of a local configuration file
    if (this.configFiles.localConfig.exists) {
      utils.writeToConsole('log',[["Merging values from local configuration file %s", this.configFiles.localConfig.path]]);
      localConfig = utils.readJSONFile(this.configFiles.localConfig.path);
    }
    else {
      utils.writeToConsole('log',[["Local configuration file not found, using global defaults instead"]]);
    }
    
    mergeProperties(localConfig, this);
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
 ['isWindows',        {e:false, w:true,  c:false, v:utils.isWindows}],
 ['isLinux',          {e:false, w:true,  c:false, v:utils.isLinux}],
 ['isOSX',            {e:false, w:true,  c:false, v:utils.isOSX}],
 ['configFiles',      {e:false, w:false, c:false, v:configFiles}],
 ['pluginList',       {e:true,  w:true,  c:false, v:defaultPlugins}],
 ['platformList',     {e:true,  w:true,  c:false, v:defaultPlatformList}],
 ['proxy',            {e:true,  w:true,  c:false, v:proxyDef}],
 ['adjustConfigXml',  {e:true,  w:true,  c:false, v:false}],
 ['configXmlWidget',  {e:true,  w:true,  c:false, v:[xmlElement]}]
].map(utils.defProp,Config);



// ============================================================================
// Exports
// ============================================================================
 module.exports.Config = Config;

 
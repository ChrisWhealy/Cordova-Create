#!/usr/bin/env node

/**
 * ============================================================================
 * @fileOverview utils
 * 
 * Utility functions for the node command cva-create 
 * 
 * Author      : Chris Whealy (www.whealy.com)
 * Forked from : Cordova-Create by John M. Wargo (www.johnwargo.com)
 * ============================================================================
 **/

var os      = require('os');
var fs      = require('fs');
var path    = require('path');
var shelljs = require('shelljs');

var separator = "************************************************************";
var helpFile  = 'cva-create-help.txt';

// ========================================================================
// Platform identifier flags
// ========================================================================
var isWindows = (os.type().indexOf('Win')    === 0);
var isLinux   = (os.type().indexOf('Linux')  === 0 || os.type().indexOf('Sun')  === 0);
var isOSX     = (os.type().indexOf('Darwin') === 0);
var OSStr     = (isWindows) ? "Windows" : "*NIX";

// ========================================================================
// Helper functions for tool usage
// ========================================================================
var showHelp = function() {
  var raw = fs.readFileSync(path.join(__dirname, helpFile)).toString('utf8');
  writeToConsole('log',[['\n\n' + raw.help]],false);
};

// ========================================================================
// Helper functions for defining both property values and property metadata
// ========================================================================
var propMetadata = function(md)   {
  return {
    enumerable   : md.e || false,
    writable     : md.w || false,
    configurable : md.c || false,
    value        : md.v
  };
};

var defProp = function(name) { Object.defineProperty(this.prototype, name[0], propMetadata(name[1])); };
var isArray = function(obj)  { return Object.prototype.toString.apply(obj) === '[object Array]'; };

// ========================================================================
// Join two arrays eliminating duplicates
// ========================================================================
var union = function(a1, a2) {
  var a3 = a1.map(function(v) {
    return (function(i) {
      if (i > -1) a2.splice(i,1);
      return v;
    })(a2.indexOf(v))
  });
  
  return (a2.length > 0) ? a3.concat(a2) : a3;
};


// ========================================================================
// Write to console
// ========================================================================
var writeToConsole = function(fn,consoleMessages) {
  // Passes each element of consoleMessages to the console function fn
  consoleMessages.map(function(msg) { console[fn].apply(this, msg); });
};

// ========================================================================
// Functions for file management
// ========================================================================
var setFilePermissions = (function(isWin) {
  return (isWin)
         ? function() {}   // If running on Windows, this function equates to a NOOP
         : function(fileName, pFlags) {
             try { fs.chmodSync(fileName, pFlags); }
             catch (err) {
               console.error("Unable to set file permissions: %s".error, err.code);
               process.exit(1);
             }
           }
})(isWindows);

var readJSONFile = function(fName,charset) {
  return JSON.parse(fs.readFileSync(fName, charset || 'utf8'))
};

var writeToFile = function(fileName,content,permissions) {
  try {
    fs.writeFileSync(fileName, content);
    setFilePermissions(fileName,permissions);
  }
  catch (err) {
    writeToConsole('error',[["Unable to write to file: %s".error, err.code],
                            ["Error object: %s".error, JSON.stringify(err)]],false);
    process.exit(1);
  }
};

// ========================================================================
// Exports
// ========================================================================
module.exports.isWindows = isWindows;
module.exports.islinux   = isLinux;
module.exports.isOSX     = isOSX;
module.exports.OSStr     = OSStr;
module.exports.separator = separator;

module.exports.showHelp = showHelp;

module.exports.isArray = isArray;
module.exports.defProp = defProp;
module.exports.union   = union;

module.exports.writeToConsole     = writeToConsole;
module.exports.setFilePermissions = setFilePermissions;
module.exports.readJSONFile       = readJSONFile;
module.exports.writeToFile        = writeToFile;


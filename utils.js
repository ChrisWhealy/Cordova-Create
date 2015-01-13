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

function noOp() {}

var os      = require('os');
var fs      = require('fs');
var path    = require('path');
var shelljs = require('shelljs');

var separator = "************************************************************";
var title     = "*                   C V A - C R E A T E                    *"
var helpFile  = 'cva-create-help.txt';

// ============================================================================
// Platform identifier flags
// ============================================================================
var isWindows = (os.type().indexOf('Win')    === 0);
var isLinux   = (os.type().indexOf('Linux')  === 0 || os.type().indexOf('Sun')  === 0);
var isOSX     = (os.type().indexOf('Darwin') === 0);
var OSStr     = (isWindows) ? "Windows" : "*NIX";

// ============================================================================
// Helper functions for tool usage
// ============================================================================
function showHelp() {
  var raw = fs.readFileSync(path.join(__dirname, helpFile)).toString('utf8');
  writeToConsole('log',[['\n\n' + raw.help]],false);
};

// ============================================================================
// Helper functions for defining both property values and property metadata
// ============================================================================
function propMetadata(md)   {
  return {
    enumerable   : md.e || false,
    writable     : md.w || false,
    configurable : md.c || false,
    value        : md.v
  };
};

function defProp(name) { Object.defineProperty(this.prototype, name[0], propMetadata(name[1])); };
function isArray(obj)  { return Object.prototype.toString.apply(obj) === '[object Array]'; };

// ============================================================================
// Join two arrays eliminating duplicates
// ============================================================================
function union(a1, a2) {
  var a3 = a1.map(function(v) { return (function(i) { if (i > -1) a2.splice(i,1); return v; })(a2.indexOf(v)) });
  return (a2.length > 0) ? a3.concat(a2) : a3;
};


// ============================================================================
// Write stuff to various places
// ============================================================================
function writeToConsole(fn,consoleMessages) { consoleMessages.map(function(msg) { console[fn].apply(this, msg); }); };
function writeStartBanner() { writeToConsole('log', [[separator.help], [title.help], [separator.help]]); }

// ============================================================================
// Functions for file management
// ============================================================================
function changeMode(fileName, pFlags) {
  try {
    fs.chmodSync(fileName, parseInt(pFlags,8));
  }
  catch (err) {
    console.error("Unable to set file permissions for %s to %s".error, fileName, pFlags);
    process.exit(1);
  }
}

function readJSONFile(fName,charset) { return JSON.parse(fs.readFileSync(fName, charset || 'utf8')); };

function writeToFile(fileName,content,permissions) {
  try {
    fs.writeFileSync(fileName, content);
  }
  catch(err) {
    writeToConsole('error',[["Unable to write to file %s".error, fileName],
                            ["Error object: %s".error, JSON.stringify(err,null,2)]],false);
    process.exit(1);
  }

  changeMode(fileName,permissions);
};

function writeBuildInstructionsToFile(buildIns) {
  // First, transform buildInstructions object to a re 
  try {
    fs.writeFileSync(fileName, content);
    setFilePermissions(fileName,permissions);
  }
  catch (err) {
    writeToConsole('error',[["Unable to write to file: %s".error, err.code],
                            ["Error object: %s".error, JSON.stringify(err,null,2)]],false);
    process.exit(1);
  }
};

// ============================================================================
// String handling functions
// ============================================================================

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Removes an escaped new line ("\n") character that terminates a string
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
function dropFinalNL(str) {
  var lfIdx = str.lastIndexOf("\n");
  return (lfIdx == -1) ? str : str.substring(0,lfIdx);
}


// ============================================================================
// Time and date handling functions
// ============================================================================
function interval(then) {
  var zeroes = '00';
  var elapse = Date.now() - then;
  var mins   = Math.floor(elapse / 60000) + '';
  var secs   = ((elapse-(Math.floor(elapse/60000)*60000))/1000) + '';
  var dot    = secs.indexOf('.');

  return { minutes : zeroes.slice(mins.length) + mins,
           seconds : (dot ? zeroes.slice(dot) : zeroes.slice(secs.length)) + secs};
}

// ============================================================================
// Exports
// ============================================================================
module.exports.isWindows = isWindows;
module.exports.islinux   = isLinux;
module.exports.isOSX     = isOSX;
module.exports.OSStr     = OSStr;
module.exports.separator = separator;

module.exports.showHelp = showHelp;

module.exports.isArray = isArray;
module.exports.defProp = defProp;
module.exports.union   = union;

module.exports.dropFinalNL = dropFinalNL;

module.exports.interval = interval;

module.exports.writeToConsole     = writeToConsole;
module.exports.setFilePermissions = (isWindows) ? noOp : changeMode;
module.exports.readJSONFile       = readJSONFile;
module.exports.writeToFile        = writeToFile;
module.exports.writeStartBanner   = writeStartBanner;


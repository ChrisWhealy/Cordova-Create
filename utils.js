#!/usr/bin/env node

/**
 * ============================================================================
 * @fileOverview utils
 * 
 * Utility functions for the node command cva-create 
 * 
 * Author : Chris Whealy (www.whealy.com)
 * ============================================================================
 **/

function noOp() {}

/***
 * * * * * * * * * * * * * * * RESTART CAPABILITY * * * * * * * * * * * * * * * 
 * Restart capability carries the following requirements:
 * 1) Define the build process in terms of a sequence of repeatable steps
 * 2) Record the library and function name used to implement each step
 * 3) Record the outcome of each step as it is executed
 * 4) If the build process fails, allow it to be restarted from the last failed
 *    step.
 * 
 * Step 2 is only possible if every function invoked as part of the build process
 * is a *named* function.
 * 
 * However in JavaScript, this requirement is frequently unfulfilled because of
 * JavaScript's tendency towards the use of anonymous functions. Therefore, the
 * following ugly wrapper is needed around every required library to check
 * for anonymous functions.  If anonymous functions are found, they are wrapped
 * in a new named function object, thus the fn.name property will be populated
 * and the function's name can be recorded in the build instructions.
 */

function wrapLib(lib) {
  return Object.keys(lib).reduce(function(acc,v) {
    acc[v] = (typeof lib[v] === 'function' &&
              lib[v].name   === '')
             ? new Function("wrappedFn","return function " + v + "(){ return wrappedFn.apply(this,arguments) };")(lib[v])
             : lib[v];
    return acc;
  },{});
};

var os      = wrapLib(require('os'));
var fs      = wrapLib(require('fs'));
var path    = wrapLib(require('path'));
var shelljs = wrapLib(require('shelljs'));

var separator   = "************************************************************";
var title       = "*                   C V A - C R E A T E                    *"
var helpFile    = 'cva-create-help.txt';
var restartFile = '.cva-restart.json';
var rw_r__r__   = '0644';

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

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Change file permissions.
// Parameter pFlags must be a string representing the octal file permission
// flags.  E.G. rwxr-xr-x would be passed as '0755'
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
function changeMode(fileName, pFlags) {
  try {
    fs.chmodSync(fileName, parseInt(pFlags,8));
  }
  catch (err) {
    console.error("Unable to set file permissions for %s to %s".error, fileName, pFlags);
    process.exit(1);
  }
}

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Read JSON file and return a parsed JSON object
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
function readJSONFile(fName,charset) { return JSON.parse(fs.readFileSync(fName, charset || 'utf8')); };

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Write content to a file
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
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

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Write build instructions to the restart file
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
function writeBuildInstructionsToFile(buildIns) {
  var fileName = path.join(process.env.PWD, restartFile);
  var writableBuildIns = buildIns.map(function(v) {
    return {lib:v.lib, fn:(v.fn) ? v.fn.name : 'anonymous', p:v.p, c:v.c };
  })

  try {
    fs.writeFileSync(fileName, JSON.stringify(writableBuildIns,null,2));
    changeMode(fileName,rw_r__r__);
  }
  catch (err) {
    writeToConsole('error',[["Unable to write build instructions to %s".error, fileName],
                            ["Error object: %s".error, JSON.stringify(err,null,2)]],false);
    process.exit(1);
  }
};


// ============================================================================
// String handling functions
// ============================================================================

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Removes an escaped new line character ("\n") at the end of a string
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

module.exports.wrapLib = wrapLib;

module.exports.isArray = isArray;
module.exports.defProp = defProp;
module.exports.union   = union;

module.exports.dropFinalNL = dropFinalNL;

module.exports.interval = interval;

module.exports.setFilePermissions = (isWindows) ? noOp : changeMode;
module.exports.readJSONFile       = readJSONFile;

module.exports.writeToFile                  = writeToFile;
module.exports.writeToConsole               = writeToConsole;
module.exports.writeStartBanner             = writeStartBanner;
module.exports.writeBuildInstructionsToFile = writeBuildInstructionsToFile;


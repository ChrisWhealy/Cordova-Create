#!/usr/bin/env node

/**
 * ============================================================================
 * @fileOverview utils
 * 
 * Utility functions for adjusting a Cordova project's config.xml file based on
 * the values found in either the local or global cva-config.json file   
 * 
 * Author : Chris Whealy (www.whealy.com)
 * ============================================================================
 **/

var utils   = require('./utils.js');
var fs      = require('fs');
var path    = require('path');
var xml2js  = require('xml2js');
var shelljs = require('shelljs');

var parser  = new xml2js.Parser();
var builder = new xml2js.Builder({rootName:'widget'});

var shhhh = {silent:true};

var hasGit = (shelljs.exec('git --version', shhhh).code === 0);

var configCmds = {
  git : 'git config --get ',
  npm : 'npm config get '
};

var placeholderRegEx = /\$(git|npm|env)\(([^)]+)\)/g;


// ============================================================================
// Constructor function reads the config.xml file 
// ============================================================================
var XmlConfigFile = function(targetFolder) { 
  var tempName = path.join(targetFolder,'config.xml');
  utils.writeToConsole('log',[["\n\n%s",utils.separator.warn],
                              ["  Adjusting %s".warn, tempName],
                              [utils.separator.warn]]);
  this.widget = {};
  this.fqFileName = '';

  // Check that the config.xml file actually exists
  if (!fs.existsSync(tempName)) {
    utils.writeToConsole('error',
        [["\nconfig.xml cannot be found in directory %s".error, targetFolder],
         ["Looks like the Cordova project was not created correctly."]]);
    process.exit(1);
  }
  else
    this.fqFileName = tempName;
  
  var that      = this;
  var xmlBuffer = fs.readFileSync(this.fqFileName);
  
  utils.writeToConsole('log',[["\nOld config.xml".warn],
                              [xmlBuffer.toLocaleString()]]);

  parser.parseString(xmlBuffer,function(e,r) { that.widget = r.widget; });
};

// ============================================================================
// Define a prototype function
// ============================================================================
XmlConfigFile.prototype.update = function(myWidget) {
  var newXmlFile = builder.buildObject(myWidget.reduce(makePropVal, this.widget));
  
  utils.writeToConsole('log',[["\nNew config.xml".warn],[newXmlFile]]);
  utils.writeToFile(this.fqFileName, newXmlFile, 0755);
};

// ============================================================================
// Private API
// ============================================================================
var makePropVal = function(acc, v) {
  if (v.elementName != "") {
    if (!acc[v.elementName]) acc[v.elementName] = [];
    
    // This logic is somewhat simplistic, but should be sufficient for most
    // situations.
    // All element instances are replaced except for <preference> and <param>
    // elements where multiple occurrences are permitted
    // 
    if (v.elementName === 'param')
      acc[v.elementName].push(makeSimpleVal(v));
    else
      if (v.elementName === 'preference') {
        // If the current preference element and the existing preference element
        // both have the same name attribute, then override rather than insert
        if (xmlElementContains(v, acc[v.elementName]))
          acc[v.elementName] = makeSimpleVal(v);
        else
          acc[v.elementName].push(makeSimpleVal(v));
      }
    else
      acc[v.elementName] = makeSimpleVal(v);
  }

  return acc;
}

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Return the simple case of an element that has only string content and no
// attributes.  All other cases are delegated to the function arrayToObj
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
var makeSimpleVal = function(v) {
  return (Object.keys(v.attributes).length > 0)
         ? arrayToObj(v,true)
         : (typeof v.content === 'string')
           ? subst(v.content)
           : (typeof v.content[0] === 'string')
             ? subst(v.content[0])
             : arrayToObj(v,false);
}

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Transform array elements into an object having the xml2js property structure
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
var arrayToObj = function(v,hasAttribs) {
  var temp = {};
  
  // If this XML element has any attributes, they must belong to a property
  // called "$".  Ensure that any attributes allowed to contain place holders
  // have been scanned and substituted 
  if (hasAttribs) temp["$"] = checkAttributes(v.attributes);

  // If the content of this XML element is a simple string, scan the content
  // for place holders and add it to a property called "_"
  if (typeof v.content === 'string') temp["_"] = subst(v.content);
  else
    if (typeof v.content[0] === 'string') temp["_"] = subst(v.content[0]);
    else
      // The content element contains nested elements
      for (var i=0; i<v.content.length; i++) {
        if (!temp[v.content[i].elementName]) temp[v.content[i].elementName] = [];
        temp[v.content[i].elementName].push(makeSimpleVal(v.content[i]));
      }

  return temp;
}

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Check attribute values for place holders
// At the moment, only the href and email attributes can contain place holder
// values
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
var checkAttributes = function(attribs) {
  if (attribs.email && attribs.email.length > 0) attribs.email = subst(attribs.email);
  if (attribs.href  && attribs.href.length  > 0) attribs.href  = subst(attribs.href);
  
  return attribs;
}

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Check if a <preference name=""> element already exists 
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
var xmlElementContains = function(src,target) {
  var retVal = false;

  if (src.attributes.name) {
    for (var i=0; i<target.length; i++) {
      if (target[i]["$"].name && target[i]["$"].name == src.attributes.name) {
        retVal = true;
        break;
      }
    }
  }
  
  return retVal;
}


// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Substitute any place holder values that might exist in a character string
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
var subst = function(str) {
  return str.replace(placeholderRegEx, getSubstVal)
}

var getSubstVal = function(_dontCare, type, ph) {
  var retVal = (type === 'env')
               ? process.env[ph]
               : utils.dropFinalNL(shelljs.exec(configCmds[type] + ph,shhhh).output);
  return (retVal && retVal !== 'undefined') ? retVal : '';
}

// ============================================================================
// Public API
// ============================================================================
module.exports.XmlConfigFile = XmlConfigFile;


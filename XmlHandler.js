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

var configCmds = {
  git : 'git config --get ',
  npm : 'npm config get '
};

var placeholderRegEx = /\$(git|npm|env)\(([^)]+)\)/g;


// ============================================================================
// Constructor function reads the XML file 
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
  var newWidget = myWidget.reduce(makePropVal, {});
  
  for (var p in newWidget) this.widget[p] = newWidget[p];
  
  var newXmlFile = builder.buildObject(this.widget);
  
  utils.writeToConsole('log',[["\nNew config.xml".warn],[newXmlFile]]);
  utils.writeToFile(this.fqFileName, newXmlFile, 0755);
};

// ============================================================================
// Private API
// ============================================================================
var makePropVal = function(acc, v) {
  if (v.elementName != "") {
    if (!acc[v.elementName]) acc[v.elementName] = [];
    acc[v.elementName].push(makeSimpleVal(v));
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
           ? substPlaceHolders(v.content)
           : (typeof v.content[0] === 'string')
             ? substPlaceHolders(v.content[0])
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
  if (typeof v.content === 'string')
    temp["_"] = substPlaceHolders(v.content);
  else {
    if (typeof v.content[0] === 'string')
      temp["_"] = substPlaceHolders(v.content[0]);
    else
      // The content element contains nested elements
      for (var i=0; i<v.content.length; i++) {
        if (!temp[v.content[i].elementName]) temp[v.content[i].elementName] = [];
        temp[v.content[i].elementName].push(makeSimpleVal(v.content[i]));
      }
  }

  return temp;
}

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Check attribute values for place holders
// At the moment, only the href and email attributes can contain place holder
// values
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
var checkAttributes = function(attribs) {
  if (attribs.email && attribs.email.length > 0) attribs.email = substPlaceHolders(attribs.email);
  if (attribs.href  && attribs.href.length  > 0) attribs.href  = substPlaceHolders(attribs.href);
  
  return attribs;
}

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Substitute any place holders that might exist in attribute or content values 
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
var substPlaceHolders = function(str) {
  return str.replace(placeholderRegEx, getPlaceHolderValue)
}

var getPlaceHolderValue = function(_dontCare, type, ph) {
  var retVal = (type === 'env')
               ? process.env[ph]
               : utils.dropFinalNL(shelljs.exec(configCmds[type] + ph,shhhh).output);
  return (retVal && retVal !== 'undefined') ? retVal : '';
}

// ============================================================================
// Public API
// ============================================================================
module.exports.XmlConfigFile = XmlConfigFile;


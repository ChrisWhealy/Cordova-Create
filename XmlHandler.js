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

var utils  = require('./utils.js');
var fs     = require('fs');
var path   = require('path');
var xml2js = require('xml2js');

var parser  = new xml2js.Parser();
var builder = new xml2js.Builder({rootName:'widget'});

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
         ["Looks like the Cordova project was not generated correctly"]]);
    process.exit(1);
  }
  else
    this.fqFileName = tempName;
  
  var that      = this;
  var xmlBuffer = fs.readFileSync(this.fqFileName);
  
  utils.writeToConsole('log',[["\Old config.xml".warn],
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
  if (v.elementName != "")
    acc[v.elementName] = makeSimpleVal(v);
  return acc;
}

var makeSimpleVal = function(v) {
// First, handle the simple case of an element that has only string content
// and no attributes.
// All other cases are delegated to the function reduceListToObj
  return [(Object.keys(v.attributes).length > 0)
          ? reduceListToObj(v,true)
          : (typeof v.content === 'string')
            ? v.content
            : (typeof v.content[0] === 'string')
              ? v.content[0]
              : reduceListToObj(v,false)];
}

var reduceListToObj = function(v,hasAttribs) {
  var temp = {};
  
  // If present, attributes belong to a property called "$"
  if (hasAttribs) temp["$"] = v.attributes;

  // If present, unnamed content is stored in a property called "_"
  if (typeof v.content === 'string' || typeof v.content[0] === 'string')
    temp["_"] = (typeof v.content === 'string') ? v.content : v.content[0];
  else
    // The element contains more elements
    for (var i=0; i<v.content.length; i++)
      temp[v.content[i].elementName] = makeSimpleVal(v.content[i]);

  return temp;
}

// ============================================================================
// Public API
// ============================================================================
module.exports.XmlConfigFile = XmlConfigFile;


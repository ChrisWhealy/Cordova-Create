#!/usr/bin/env node

/**
 * ============================================================================
 * @fileOverview proxy
 * 
 * Manage git and npm proxy settings
 * 
 * Author : Chris Whealy (www.whealy.com)
 * ============================================================================
 **/

var noOp = function() {};

var colors  = require('colors');
var shelljs = require('shelljs');
var utils   = require('./utils.js');

var npmConfigCmd = 'npm config ';
var gitConfigCmd = 'git config ';

var npmProxyCmd = [];
var gitProxyCmd = [];

  npmProxyCmd['on']  = npmConfigCmd + 'set ';
  npmProxyCmd['off'] = npmConfigCmd + 'delete ';
  
  gitProxyCmd['on']  = gitConfigCmd + '--global ';
  gitProxyCmd['off'] = gitConfigCmd + '--global --unset ';


var credentials  = function(p)   { return (p.useCredentials) ? p.proxyUser + ':' + p.proxyPassword + '@' : ''; }
var formProtocol = function(p,s) { return 'http' + ((s) ? (p.secureProxyUsesHttp) ? ':' : 's:' : ':') + '//'; }
var formPort     = function(p,s) { return (s) ? (p.secureProxyUsesHttp) ? (p.http.port || 80) : (p.https.port || 443) : (p.http.port || 80); }
var formProxyUrl = function(p,s) { return formProtocol(p,s) + credentials(p) + p['http'+(s?'s':'')].host + ':' + formPort(p,s); }

// ============================================================================
// Define npm and GIT proxy settings
// ============================================================================
var Handler = function(pConf,hasGit,hasNpm) {
  var httpProxy  = '';
  var httpsProxy = '';

  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  // First, set each constructor function to a no op because we'll assume that
  // either the use of a proxy is not needed or that the combination of
  // received config parameters make no sense
  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  this.npmProxy = noOp;
  this.gitProxy = noOp;
  
  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  // If one of the following conditions is found, then bail out early
  //
  // 1) Neither git nor npm are installed
  // 2) useProxy switched on, but no proxy host names have been supplied
  // 3) useCredentials is switched on, but one or both of the userid and
  //    password values are missing
  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

  // Either git or npm must be installed
  if (pConf.useProxy && !hasGit && !hasNpm) {
    utils.writeToConsole('warn',[["Neither npm nor git are installed".warn]]);
    utils.writeToConsole('warn',[["Cannot set proxy settings for software that is not installed - DOH!".warn]]);
    return this;
  }

  // Minimal test for hostname validity
  if (pConf.useProxy && pConf.https.host.length === 0 ||
      (pConf.http.host.length === 0 && pConf.secureProxyUsesHttp)) {
    utils.writeToConsole('error',[["Proxy hostname configuration is not correct".error]]);
    utils.writeToConsole('error',[["Either set proxy.useProxy to false or define a proxy host and port number".error]]);
    return this;
  }
  
  // Userid and password must be supplied if credentials are required for proxy access
  if (pConf.useProxy && pConf.useCredentials) {
    if (!pConf.proxyUser || pConf.proxyUser.length === 0) {
      utils.writeToConsole('error',[["Proxy credentials are required, but proxy.proxyUser is either undefined or empty".error]]);
      return this;
    }
    
    if (!pConf.proxyPassword || pConf.proxyPassword.length === 0) {
      utils.writeToConsole('error',[["Proxy credentials are required, but proxy.proxyPassword is either undefined or empty".error]]);
      return this;        
    }
  }
  
  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  // If we make it to here, then the configuration values are at least
  // correct.  They still might not be valid though...
  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *    
  httpProxy  = formProxyUrl(pConf,false);
  httpsProxy = formProxyUrl(pConf,true);

  if (hasNpm) {
    this.npmProxy = function(action) {
      utils.writeToConsole('log',[['\nSwitching %s npm proxy server'.warn, action]]);
      shelljs.exec(npmProxyCmd[action] + 'proxy ' + httpProxy);
      shelljs.exec(npmProxyCmd[action] + 'https-proxy ' + httpsProxy);
    };
  }
   
  if (hasGit) {
    this.gitProxy = function(action) {
      utils.writeToConsole('log',[['Switching %s git proxy server'.warn,action]]);
      shelljs.exec(gitProxyCmd[action] + 'proxy.http ' + httpProxy);
      shelljs.exec(gitProxyCmd[action] + 'proxy.https ' + httpsProxy);
    };
  }
};



// ============================================================================
// Exports
// ============================================================================
module.exports.Handler = Handler;


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

function noOp() {};

var shhhh = { silent : true }

var utils  = require('./utils.js');
var colors = require('colors');

var shelljs = utils.wrapLib(require('shelljs'));

var configCmd = cmd => cmd + ' config '

var npmProxyCmd = configCmd('npm') + 'set ';
var gitProxyCmd = [];

  gitProxyCmd['on']  = configCmd('git') + '--global ';
  gitProxyCmd['off'] = configCmd('git') + '--global --unset ';

// Allow return codes of 0 or 5 to mean success from the `git config` command  
var allow5 = v => v === 5 ? 0 : v

// Functions to build the proxy URL
var credentials  = p      => p.useCredentials ? p.proxyUser + ':' + p.proxyPassword + '@' : ''
var formProtocol = p => s => 'http' + ((s) ? (p.secureProxyUsesHttp) ? ':' : 's:' : ':') + '//'
var formPort     = p => s => s ? p.secureProxyUsesHttp ? (p.http.port || 80) : (p.https.port || 443) : (p.http.port || 80)
var formProxyUrl = p => s => formProtocol(p)(s) + credentials(p) + p['http'+(s?'s':'')].host + ':' + formPort(p)(s)

// ============================================================================
// Define npm and GIT proxy settings
// ============================================================================
function Handler(pConf,hasGit,hasNpm) {
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

  if (pConf.useProxy) {
    // Minimal test for hostname validity
    if (pConf.https.host.length === 0 || (pConf.http.host.length === 0 && pConf.secureProxyUsesHttp)) {
      utils.writeToConsole('error',[["Proxy hostname configuration is not correct".error]]);
      utils.writeToConsole('error',[["Either set proxy.useProxy to false or define a proxy host and port number".error]]);
      return this;
    }
    
    // Userid and password must be supplied if credentials are required for proxy access
    if (pConf.useCredentials) {
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
  }
  
  function setEnvProxy(action) {
    var retCode = 0;
    retCode += shelljs.exec((action === 'on' ? 'export http_proxy=' + httpProxy : 'unset http_proxy'),shhhh).code;
    retCode += shelljs.exec((action === 'on' ? 'export https_proxy=$http_proxy' : 'unset https_proxy'),shhhh).code;
    return retCode;
  }
  this.setEnvProxy = setEnvProxy;
  
  if (hasNpm) {
    function setNpmProxy(action) {
      utils.writeToConsole('log',[['\nSwitching %s npm proxy server'.warn, action]]);

      return shelljs.exec(npmProxyCmd + 'proxy ' + (action === 'on' ? httpProxy : 'null'),shhhh).code +
             shelljs.exec(npmProxyCmd + 'https-proxy ' + (action === 'on' ? httpProxy : 'null'),shhhh).code;
    };

    this.setNpmProxy = setNpmProxy;
  }

  if (hasGit) {
    function setGitProxy(action) {
      utils.writeToConsole('log',[['Switching %s git proxy server'.warn,action]]);

      // We must allow for 5 as a success return code from `git config`
      return allow5(shelljs.exec(gitProxyCmd[action] + 'http.proxy ' + httpProxy,shhhh).code) +
             allow5(shelljs.exec(gitProxyCmd[action] + 'https.proxy ' + httpsProxy,shhhh).code);
    };

    this.setGitProxy = setGitProxy;
  }
};

// ============================================================================
// Exports
// ============================================================================
module.exports.Handler = Handler;


<a name="top"></a>
# `cva-create`

## Table of Contents
1. [Upgrade to 0.4.0](#header0)  
2. [Overview](#header1)  
3. [Attribution](#header2)  
4. [Requirements](#header3)  
5. [Installation](#header4)  
6. [Upgrade](#header5)  
7. [Usage](#header6)  
8. [Restarting a Failed Build](#header7)  
9. [Global Configuration File](#header8)  
10. [Configuration Property Names](#header9)  
11. [Using a Local Configuration File](#header10)  
12. [Adjusting the `config.xml` File](#header11)  
  1. [XML Element: No Attributes And A Simple String As Content](#header11_1)  
  2. [XML Element: One Or More Attributes And A Simple String As Content](#header11_2)  
  3. [Empty XML Element: One Or More Attributes But No Content](#header11_3)  
  4. [XML Element: One Or More Attributes And Structured Content](#header11_4)
13. [Using Placeholders In `config.xml` Attributes and Content](#header12)  
  1. [Placeholder Syntax](#header12_1)  
  2. [Placeholder Usage](#header12_2)  
  3. [Simple Example](#header12_3)  
  4. [Multiple Placeholders](#header12_4)  
  5. [Placeholder Reference Errors](#header12_5)  
14. [Full Example](#header13)



<a name="header0"></a>
## 1) Upgrade to 0.4.0
In version 0.4.0, the configuration parameter `createParms` is no longer used.  This means that you no longer need to specify any property values as double-escaped character strings such as `"\"{\\\"plugin_search_path\\\": \\\"/usr/3rd-party/plugins\\\"}\""`.  

The `createParms` property has been replaced with the `pluginSearchPath` property whose value is a normal character string such as `"/usr/3rd-party/plugins"`.  

After upgrading to version 0.4.0, please first run `cva-create upgrade_config` before building any projects.  This will ensure that your global and (if present) local configuration files have the old `createParms` property value transferred to the new `pluginSearchPath` property.

[Top](#top)


<a name="header1"></a>
## 2) Overview
`cva-create` is a tool designed primarily to help people who regularly create Cordova projects.  If you're an occasional Cordova user, you might not find this tool so useful.

`cva-create` creates a simple Cordova project for any platform and adds a configurable number of plug-ins.  In a single command, this tool performs the following sequence of Cordova CLI commands:

1. Create a Cordova project --> `cordova create <app dir> <app id> <app name>`
2. Change into the application's directory --> `cd <app dir>`
3. Add the required platforms --> `cordova platform add <platform names>`
4. Add zero or more plugins --> `cordova plugin add <plug-in name>`
5. Optionally updates Cordova's `config.xml` file
6. Optionally copies platform specific files into the project -->  `cordova prepare`

[Top](#top)


<a name="header2"></a>
## 3) Attribution
`cva-create` is a fork of John Wargo's now obsolete [cordova-create tool](https://github.com/johnwargo/Cordova-Create).  `Cordova-Create` has now been replaced by [cdva-create](https://github.com/johnwargo/cdva-create).

John is the author of several books on PhoneGap and Cordova such as [Apache Cordova 3 Programming](http://www.cordovaprogramming.com). For more details, see [John's website](http://www.johnwargobooks.com).

[Top](#top)



<a name="header3"></a>
## 4) Requirements
This module expects the following software already to be installed, configured and working:

1. An Apache Cordova development environment, including the appropriate native SDKs (Android Development Tools, Xcode etc.)
2. NodeJS and other associated tools such as `npm`.

[Top](#top)



<a name="header4"></a>
## 5) Installation
Install this module globally using `npm`.  From a terminal window, execute the following command:

Windows:

	npm install -g cva-create

Macintosh OS X:

	sudo npm install -g cva-create

Alternatively, if you've downloaded the ZIP file from GitHub, you can install the module as follows:

1. Expand the ZIP file into some working directory  
2. Open a terminal window and change into the above working directory  
3. Issue the following command:  
  * Windows:  

      `npm install -g`
  * Mac OS X:    

      `sudo npm install -g`

[Top](#top)



<a name="header5"></a>
## 6) Upgrade
If you are upgrading `cva-create` from a previous version, before running a build with the new version, first run:

    cva-create upgrade_config
  
The `upgrade_config` parameter causes any new properties used by the latest version of `cva-create` to be inserted into the existing `cva-create.json` file in your home directory.  Existing property values in `cva-create.json` will not be touched.

Running `cva-create upgrade_config` will not build a Cordova project.

[Top](#top)



<a name="header6"></a>
## 7) Usage
1. If this is the first time you have used `cva-create`, then you should start by creating the global configuration file.  Open a terminal window and run:

    `cva-create gen_config`
  
   Running `cva-create` with the `gen_config` parameter will **not** cause a Cordova project to be built.  Instead it will simply create a file called `cva-create.json` in your home directory.  This file contains a set of parameters that will be used as default values when `cva-create` builds a Cordova project.

2. Edit `cva-create.json` in your home directory as appropriate for your situation.

  For instance, if you write apps that always use the plug-in `cordova-plugin-network-information`, then adding this string to the list of plug-ins will mean it is automatically added to all projects built by `cva-create`.

3. To create a new Cordova project, open a terminal window, navigate to the directory in which you want the project built and execute the `cva-create` command with the following pattern of arguments:

	`cva-create <app dir> <app id> <app name> <zero or more platform names>`

  Where:
  
  * `<app dir>` is the directory into which the Cordova project will be written.

  * `<app id>` is the identity of the application (for instance, `com.mycorp.thingamajig`)

  * `<app name>` is the name of the application seen by the user of the mobile device.

  * `<platform names>` is an optional set of target platforms. If this list is omitted, then `cva-create` will look first at the default platforms listed in `cva-create.json` in your home directory (known as the Global Configuration file).  However, if any platforms are listed in the `cva-create.json` file in your project directory (known as the Local Configuration file), then the local values take precedence over the global values.
    
  The first three parameters to `cva-create` are exactly the same as would be used with the Cordova CLI command `cordova create`.

  For instance, if Android and iOS are listed as the default platforms in the Global Configuration file, then to create a Cordova project for both of these platforms called `Thingamajig` in a directory called `thing_1` you would use the following command:

	`cva-create thing_1 com.mycorp.thingamajig Thingamajig`

  To create a project for a platform not listed as a default, simply add the platform name(s).  E.G. for Firefox OS, add `firefoxos`:

	`cva-create thing_1 com.mycorp.thingamajig Thingamajig firefoxos`

4. If you wish a particular project to use values other than those defined in the global configuration file, then copy the `cva-create.json` from your home directory into the local project directory and edit it to contain project specific values.

  The property values in the local configuration file will now override the corresponding values in global configuration file.  See the section on [Using a Local Configuration File](#header9) for details.

[Top](#top)



<a name="header7"></a>
## 8) Restarting a Failed Build
In the event that a particular step of the build process fails, `cva-create` will stop at the first failed step.  Once you have fixed the cause of the failure, you do not need to repeat the earlier steps of the build that completed successfully, you can restart the build by issuing the command:

  `cva-create restart`

`cva-create` will then restart the build process starting at the first step that previously failed.

Steps are determined to have succeeded or failed based on their return code.  Any build step that:

  * Has not yet executed has an initial return code of -1
  * Executed successfully has a return code of 0
  * Failed has a return code greater than 0

Certain steps are deemed never to fail (such as writing to the console) and therefore always return zero.

During a restart, any step that issues a non-zero return code will either be executed for the first time (if the return code is minus one), or repeated (if the return code is greater than zero).

Certain steps *must* be repeated irrespective of whether they returned zero or not, such as the command to change into the Cordova project directory.

If you have configured `cva-create` to run the `cordova prepare` command, then during a restart this step will *always* be repeated.  This is necessary because as a result of the restart, new plugins might have been added.  Therefore, rather than attempting to calculate whether a previous failure requires the `cordova prepare` statement to be rerun, it is simplest to arbitrarily rerun this step.

<a name="header8"></a>
## 9) Global Configuration File
When the `cva-create` tool is run using only the `gen_config` parameter, if the file `cva-create.json` does not exist in your home directory, then it will be created with default values. If this file already exists, then it will remain unmodified.  Either way, a Cordova project will not be created.

On Windows you can find the global configuration file in the directory `c:\users\<user_name>` (replacing `<user_name>` with the logon name of the current user).

On Mac OS X, this file is located in the user's home directory at `/Users/<user_name>` (again replacing `<user_name>` with the current user's logon name).

When a global configuration file is created for the first time on a Mac, it will have the following default content:

    {
      "cordovaDebug": false,
      "copyFrom": "",
      "linkTo": "",
      "pluginSearchPath": "",
      "replaceTargetDir": false,
      "runPrepare": false,
      "pluginList": [
        "org.apache.cordova.console",
        "org.apache.cordova.dialogs",
        "org.apache.cordova.device"
      ],
      "platformList": [
        "android",
        "ios"
      ],
      "proxy": {
        "useProxy": false,
        "useCredentials" : false,
        "proxyUser" : "",
        "proxyPassword" : "",
        "secureProxyUsesHttp": false,
        "http": {
          "host": "",
          "port": 0
        },
        "https": {
          "host": "",
          "port": 0
        }
      },
      "adjustConfigXml": false,
      "configXmlWidget": [
        {
          "elementName": "",
          "attributes": {},
          "content": []
        }
      ]
    }

If you are running on some other operating system, then the only difference will be the list of [default platforms](#header9_1) since this is OS specific.

[Top](#top)



<a name="header9"></a>
## 10) Configuration Property Names
* `cordovaDebug : Boolean`

  Switches the Cordova `-d` flag on or off.  With this option set to true, additional debug information will be written to the console as the Cordova CLI commands are executed.
  
  Typically, you should leave this property set to `false` unless something in the build process is going wrong.

* `copyFrom : String`

  The directory from which the contents of the Cordova `www` directory should be copied.

* `linkTo : String`

  The directory to which the Cordova `www` directory should be linked.
  
  **NOTE:**  It makes no sense to supply pathnames for both the `copyFrom` *and* `linkTo` properties.  You should specify one or the other, but not both.
  
  However, if you are feeling particularly over-zealous and supply pathnames for *both* parameters, then the following logic is used:
  
        Does the directory name specified in "copyFrom" exist?
          Yes --> Use this value for the --copyFrom parameter and ignore the "linkTo" property
          No  --> Does the directory name specified in "linkTo" exist?
                  Yes --> Use this value for the --linkTo parameter
                  No  --> "cordova create" will be run using neither the --copyFrom nor --linkTo parameters

* `pluginSearchPath : String`

  A string containing the path name of a local plug-ins directory. If present, this becomes the value of the `--searchpath` parameter used by the `cordova plugin add` command

* `replaceTargetDir : Boolean`

  If the target directory for this Cordova project already exists, should it be deleted and recreated?  **Use with care!**

* `runPrepare : Boolean`

  Determines whether `cordova prepare` should be run.  If set to `true`, `cordova prepare` will be performed as the very last step.

* `pluginList : [String]`

  An array containing the plug-ins common to all your Cordova projects.

  You can add third party plug-ins to this list as long as the Cordova CLI can load the plug-ins using the plug-in's ID.  If you want to include locally installed plug-ins in your project, you must additionally set the plug-in search path during the call to the `cordova create` command using the `createParms` property.  If you forget to do this, then locally installed plug-ins cannot be identified by their ID.


* <a name="header9_1"></a>`platformList : [String]`

  An array containing the names of the default platforms.

  **Important**: The default list of platforms in the global configuration file is OS dependent and is decided as follows:

        windows : ['android', 'windows']
        linux   : ['ubuntu']
        osx     : ['android', 'ios']
        unknown : ['android']

* `proxy : Object`

  An object containing various parameters for connecting to the public internet via a proxy server.
  
        "proxy": {
          "useProxy": false,
          "useCredentials" : false,
          "proxyUser" : "",
          "proxyPassword" : "",
          "secureProxyUsesHttp": false,
          "http": {
            "host": "",
            "port": 0
          },
          "https": {
            "host": "",
            "port": 0
          }
        },
  
  * `useProxy : Boolean`   
  Switching the use of a proxy server on or off is useful if you need to work both inside and outside a corporate network.  The use of a proxy server can be switched on and off as required, without needing to delete the host names or port numbers.
  
  * `useCredentials : Boolean`  
  Determines whether user credentials should be used for accessing the proxy server
  
  * `proxyUser : String`  
  Userid to access the proxy server
  
  * `proxyPassword : String`  
  Password to access the proxy server
  
  * `secureProxyUsesHttp : Boolean`  
  If set to true, the `https` proxy hostname and port will be ignored and the `http` hostname and port will be used for both `http` and `https` proxy access
  
  * `http : Object`  
  An object containing the `host` and `port` for `http` proxy access.

  * `https : Object`  
  An object containing the `host` and `port` for secure proxy access.  If the Boolean property `secureProxyUsesHttp` is set to true, then the property values in this object will be ignored.

* `adjustConfigXml : Boolean`

  A Boolean to indicate whether or not the Cordova project's `config.xml` file should be adjusted.

* `configXmlWidget : [Object]`

  An array of objects representing the new or updated elements to be inserted into the `<widget>` element found inside the `config.xml` file.


To change the project's configuration, edit the file, providing your own values for the configuration options described above.

[Top](#top)



<a name="header10"></a>
## 11) Using a Local Configuration File
If you choose to create a local configuration file, then:

1. This file must live in the same directory from which the `cva-create` command is run.
2. The local configuration file need only contain those properties that **differ** from the global configuration file.

The rule for merging global and local configuration values is that all values in the local configuration file will override the corresponding values found in the global configuration file **except** for the list of plug-ins.

The list of plug-ins in the local configuration file is always **added** to the list of plug-ins found in the global configuration file (duplicate entries are removed).

For instance, a local configuration file could contain the following:

    {
      "cordovaDebug"     : true,
      "linkTo"           : "./demo_www",
      "pluginSearchPath" : "/usr/3rd-party/plugins",
      "replaceTargetDir" : true,
      "runPrepare"       : true,
      "platformList"     : ['ios'],
      "pluginList" : [
        "https://github.com/vstirbu/PromisesPlugin.git",
        "com.3rd-party.plugins.do-this",
        "com.3rd-party.plugins.do-that"
      ],
      "adjustConfigXml": true,
      "configXmlWidget": [
        {
          "elementName" : "name",
          "attributes"  : {},
          "content": "My Cool Cordova App"
        },
        {
          "elementName" : "description",
          "attributes"  : {},
          "content": "This app is so cool, it can do everything except squeeze orange juice and tie shoelaces"
        }
      ]
    }

Other than the list of plug-ins, all values in the local configuration file will override the corresponding values in the global configuration file as follows (the order in which these properties are specified is not important):

1. `"cordovaDebug": true`

   The `-d` (for debug) option will be added to each Cordova CLI command.  Remember, only use this parameter when something is not working correctly in the build process.
  
2. `"linkTo": "./demo_www"`

   The cordova "www" directory will be linked to an existing directory accessed using the relative pathname `./demo_www`

3. `"pluginSearchPath": "/usr/3rd-party/plugins"`

   We want to use some 3rd-party Cordova plug-ins that cannot be found on `npmjs.org`.  In this case, the plugins have been locally installed in the `"/usr/3rd-party/plugins/"` directory.

4. `"replaceTargetDir": true`

   If `cva-create` is re-run from the same directory, then the old project will be deleted and recreated.  **Use with care!**

5. `"runPrepare": true`

   The `cordova prepare` CLI command will be issued as the very last step

6. `"platformList": ['ios']`

   We want to create only an iOS project.

7. `"pluginList": [
      "https://github.com/vstirbu/PromisesPlugin.git",
      "com.3rd-party.plugins.do-that",
      "com.3rd-party.plugins.do-that"
    ]`

  This list of plug-ins is used to extend the list of plug-ins found in the global configuration file.
  
  The plug-ins that are actually added to your project will be the sum of the global and local plug-in lists (after duplicates have been removed) in which the plug-in order has been preserved - global first, then local.

8. `"adjustConfigXml": true`  
     `"configXmlWidget": []`

   These properties are documented in the next section on [Adjusting the `config.xml` File](#header10).

[Top](#top)



<a name="header11"></a>
## 12) Adjusting the `config.xml` File
When a new Cordova project is created, the basic, OS independent properties of that project are defined in a file called `config.xml`. A default `config.xml` file looks something like this:

    <?xml version='1.0' encoding='utf-8'?>
    <widget id="mycordovaapp.mycorp.com" version="0.0.1" xmlns="http://www.w3.org/ns/widgets" xmlns:cdv="http://cordova.apache.org/ns/1.0">
        <name>MyCordovaApp</name>
        <description>
            A sample Apache Cordova application that responds to the deviceready event.
        </description>
        <author email="dev@cordova.apache.org" href="http://cordova.io">
            Apache Cordova Team
        </author>
        <content src="index.html" />
        <access origin="*" />
    </widget>

Within the `config.xml` file, the root element is always called `<widget>` and contains all the OS independent properties for this project.  If you want to add or update the XML elements within the `<widget>` element, then these values must be defined in either the global or local configuration files.

As with the list of plug-ins, any values found in your local configuration file will be **added** to the zero or more values found in the global configuration file.

In order to adjust the `config.xml` file, the following configuration properties must be defined:

1. Setting `adjustConfigXml` to `true` instructs `cva-create` to adjust the `config.xml` file using the values found in the array `configXmlWidget`.  
   Setting `adjustConfigXml` to `false` means that the default `config.xml` generated by Cordova will not be altered, even if values have been specified in the array `configXmlWidget`.
2. In order to add or update the XML elements within the `<widget>` element, one or more JSON objects must be added to the array `configXmlWidget`.
3. Each JSON object must have exactly the following properties - even if you do not intend to add any values to these properties:

    `{  
      "elementName" : "",  
      "attributes"  : {},  
      "content"     : []  
    }`

<a name="header11_1"></a>
### XML Element: No Attributes And A Simple String As Content   
If you wish to add an XML element that does not use attributes and contains only a string value as its content, then add the following object as an element in the `configXmlWidget` array.

The `<description>` element is a good example:

    "configXmlWidget": [
      { "elementName" : "description",
        "attributes"  : {},
        "content"     : ["The content property is an array containing a single string element"]
      }
    ]

Alternatively, since the content is a simple string value, the enclosing array can be omitted:

    "configXmlWidget": [
      { "elementName" : "description",
        "attributes"  : {},
        "content"     : "The content property is just a string"
      }
    ]


<a name="header11_2"></a>
### XML Element: One Or More Attributes And A Simple String As Content   
If you wish to add an XML element that has both attributes and simple content, then add the following object as an element in the `configXmlWidget` array.

The `<author>` element is a good example here:

    "configXmlWidget": [
      { "elementName" : "author",
        "attributes"  : { "email": "chris@whealy.com", "href": "http://whealy.com" },
        "content"     : "Here's some stuff I wrote"
      }
    ]

As above, the `content` property can be either a simple string, or an array with a string as the only element.


<a name="header11_3"></a>
### Empty XML Element: One Or More Attributes But No Content   
If you wish to add an empty XML element (i.e. an XML element that has attributes, but no content), then add the following as an element in the `configXmlWidget` array.

The `<preference>` XML element is a good example here.  In this case we will set the time out period for the Cordova `deviceready` event to 30 seconds.

    "configXmlWidget": [
      { "elementName" : "preference",
        "attributes"  : { "name": "loadUrlTimeoutValue", "value": "30000" },
        "content"     : []
      }
    ]

Each attribute name is specified as a property within the `attributes` object, and the value of each property must be a simple string.

You can specify as many properties as are relevant for the particular XML element you are adjusting.

Since this is an empty element, the `content` property must be set to an empty array, **not** an empty string.

If multiple instances of the same element are needed, then simply repeat the element definition.  For example, in order to have multiple `<preference>` elements, you can specify something like:

    "configXmlWidget": [
      { "elementName" : "preference",
        "attributes"  : { "name": "loadUrlTimeoutValue", "value": "30000" },
        "content"     : []
      },
      { "elementName" : "preference",
        "attributes"  : { "name": "Squeeze", "value": "Orange Juice" },
        "content"     : []
      },
      { "elementName" : "preference",
        "attributes"  : { "name": "Tie", "value": "Shoelaces" },
        "content"     : []
      }
    ]

**WARNING**  
Normally, specifying the same `configXmlWidget` element in both the Global and Local configuration files will result in both instances of the element appearing in the adjusted `config.xml` file.

The only exception to this rule is for `<preference>` elements having the same value in their `name` attribute.  In this case, the normal priority rules apply and the value from the local configuration file will override the value from the global configuration file.

For example, you may choose to set the `deviceready` timeout to 30 seconds for all projects:

    { "elementName" : "preference",
      "attributes"  : { "name": "loadUrlTimeoutValue", "value": "30000" },
      "content"     : []
    },

However, for one particular project, you know that since more plugns are being used, it will take longer for Cordova to boot up.  Therefore, the Local configuration file for this project contains a duplicate `<preference name="loadUrlTimeoutValue"...>` that sets the timeout to 60 seconds.  In this case, the Local value overrides the Global value.

    { "elementName" : "preference",
      "attributes"  : { "name": "loadUrlTimeoutValue", "value": "60000" },
      "content"     : []
    },

Any other duplicate definitions of `configXmlWidget` elements will result in both elements appearing in the adjusted `config.xml` file.  
**This could possibly cause an error when trying to run the Cordova project!**



<a name="header11_4"></a>
### XML Element: One Or More Attributes And Structured Content   
If you wish to add an XML element that has both attributes and structured (that is, non-string) content, then the `content` array property must contain one or more JSON objects of exactly the same structure used for the parent object.

The `<feature>` element is a good example, since it can contain zero or more `<param>` elements:

    "configXmlWidget": [
      { "elementName" : "feature",
        "attributes"  : { "name": "http://example.org/api/geolocation" },
        "content"     : [
          { "elementName" : "param",
            "attributes"  : { "name": "accuracy", "value": "low" },
            "content"     : []
          }
        ]
      }
    ]



<a name="header12"></a>
## 13) Using Placeholders In `config.xml` Attributes and Content
Generally speaking, most attribute values used by the XML elements in `config.xml` are simple string or Boolean values.  However, there are various attributes that often need to be set equal to values that have already been defined elsewhere.

A typical example is for the attributes and content of the `<author>` element.  Here, you might want to set the email address and URL equal to values that have already been defined as `npm`, `git` or environment variables.

<a name="header12_1"></a>
### 13.1) Placeholder Syntax
Instead of repeating a value defined elsewhere, you can reference it using a placeholder.  Three placeholders are recognised:

`$git()` - Reference a `git` variable  
`$npm()` - Reference an `npm` variable  
`$env()` - Reference an environment variable available to NodeJS via its `process.env` object

<a name="header12_2"></a>
### 13.2) Placeholder Usage
Only the XML attributes `email` and `href` will be parsed for placeholders; however, if the content of an XML element is a simple string value, then this string value may contain any number of placeholders.

If, for instance, you want to pick up the value of the `git` variable `user.email`, simply use the following string somewhere inside the attribute or content string value:

    $git(user.email)

Similarly, `npm` variables such as `init.author.url` are referenced as follows:

    $npm(init.author.url)

Finally, to pick up the value of an environment variable, use:

    $env(USER)

<a name="header12_3"></a>
### 13.3) Simple Example
Using the above information, you could now define the `<author>` element of `config.xml` something like this:

    {
      "elementName": "author",
      "attributes": { "email": "$git(user.email)",
                      "href":  "$npm(init.author.url)" },
      "content": ["\n    Written by $env(USER)    \n  "]
    },


<a name="header12_4"></a>
### 13.4) Multiple Placeholders
You can add as many placeholders as you like within a single string value.  So for instance, you might choose to define the content of the `<author>` element like this:

    "content": ["Written by $env(USER), better known as $npm(init.author.name) and whose email address is either $git(user.email) or $npm(init.author.email)"]

Assuming you have referenced an existing variable, all placeholders will be substituted with the referenced variable's current runtime value.


<a name="header12_5"></a>
### 13.5) Placeholder Reference Errors
**IMPORTANT**

1. If you reference a variable name that does not exist, then the placeholder will be replaced with an empty string.
2. On *NIX machines, all placeholder names are case-sensitive!
3. When using the `$env()` placeholder to reference environment variables, you may only specify variables that NodeJS can access via its `process.env` object.  This is usually a smaller list than is displayed if you type `set` from a command prompt.



<a name="header13"></a>
## 14) Full Example
Here is full (if somewhat excessive) example.  In this example, the Global Configuration file contains the following additional information (over and above the defaults).

1. The list of default plug-ins has been extended in both the global and local config files
2. A proxy server is defined and should be used
3. The `config.xml` file is being adjusted in the following ways:
  * Both the attributes and the content of the `<author>` element contain various placeholders that will be substituted for the current runtime values of variables obtained from `git`, `npm` and the operating system environment.
  * The `deviceready` timeout is set to 30 seconds
  * An additional (nonsense) preference is added called "SomeOtherName"
  * The Geolocation accuracy is set to 'low' using a `<feature>` element containing a `<param>` element

The Global Configuration file looks like this:

    {
      "cordovaDebug": false,
      "copyFrom": "",
      "linkTo": "",
      "pluginSearchPath": "",
      "replaceTargetDir": false,
      "runPrepare": false,
      "pluginList": [
          "org.apache.cordova.console",
          "org.apache.cordova.dialogs",
          "org.apache.cordova.device",
          "org.apache.cordova.network-information"
      ],
      "platformList": [ "android", "ios" ],
      "proxy": {
          "useProxy": true,
          "http":  { "host": "proxy.my-corp.com", "port": 8080 },
          "https": { "host": "proxy.my-corp.com", "port": 8080 }
      },
      "adjustConfigXml": true,
      "configXmlWidget": [
        {
          "elementName": "author",
          "attributes": { "email": "$env(USER)@somewhere.com",
                          "href":  "$npm(init.author.url)" },
          "content": ["This app was written by $env(USER), better known as $npm(init.author.name) whose email address is either $git(user.email) or $npm(init.author.email)"]
        },
        {
          "elementName": "preference",
          "attributes": { "name": "LoadUrlTimeoutValue", "value": "30000" },
          "content": []
        },
        {
          "elementName": "preference",
          "attributes": { "name": "SomeOtherName", "value": "SomeOtherValue" },
          "content": []
        },
        {
          "elementName": "feature",
          "attributes": { "name": "http://example.org/api/geolocation" },
          "content": [
            {
              "elementName": "param",
              "attributes": { "name": "accuracy", "value": "low" },
              "content": []
            }
          ]
        }
      ]
    }


The Local Configuration file then modifies this information.

Notice that the definition of the `<preference>` element having the name `LoadUrlTimeoutValue` has been repeated.  This will set the `deviceready` timeout for this particular project to 60 seconds overriding the value found in the global configuration file.

If any other duplicate `configXmlWidget` elements appear in both the global and local configuration files, then both values will appear in the adjusted `config.xml` file.

    {
      "linkTo"           : "./demo_www",
      "pluginSearchPath" : "/usr/3rd-party/plugins",
      "replaceTargetDir" : false,
      "pluginList"   : [
          "https://github.com/vstirbu/PromisesPlugin.git",
          "com.3rd-party.plugins.do-that",
          "com.3rd-party.plugins.do-that"
      ],
      "adjustConfigXml": true,
      "configXmlWidget": [
        {
          "elementName" : "name",
          "attributes"  : {},
          "content": "My Cool Cordova App"
        },
        {
          "elementName" : "description",
          "attributes"  : {},
          "content": "This app is so cool, it can do everything except squeeze orange juice and tie shoelaces"
        },
        {
          "elementName": "preference",
          "attributes": { "name": "LoadUrlTimeoutValue", "value": "60000" },
          "content": []
        },
      ]
    }


Assuming the various `git`, `npm`, and environment variables point to my own details, then the adjusted `config.xml` file will look like this:

    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <widget id="cus.sd.mycontacts" version="0.0.1" xmlns="http://www.w3.org/ns/widgets" xmlns:cdv="http://cordova.apache.org/ns/1.0">
      <name>My Cool Cordova App</name>
      <description>This app is so cool, it can do everything except squeeze orange juice and tie shoelaces</description>
      <author email="chris@whealy.com" href="http://whealy.com/">This app was written by chrisw, better known as Chris Whealy whose email address is either chris@whealy.com or chris@whealy.com</author>
      <content src="index.html"/>
      <access origin="*"/>
      <preference name="LoadUrlTimeoutValue" value="60000"/>
      <preference name="SomeOtherName" value="SomeOtherValue"/>
      <feature name="http://example.org/api/geolocation">
        <param name="accuracy" value="low"/>
      </feature>
    </widget>

[Top](#top)




* * *
&copy; 2016 [Chris Whealy](http://whealy.com)

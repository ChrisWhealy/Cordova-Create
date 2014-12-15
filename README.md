<a name="top"></a>
#cva-create

##Table of Contents
1. [Overview](#header1)  
2. [Attribution](#header2)  
3. [Requirements](#header3)  
4. [Installation](#header4)  
5. [Upgrade](#header5)  
6. [Usage](#header6)  
7. [Global Configuration File](#header7)  
8. [Configuration Property Names](#header8)  
9. [Using a Local Configuration File](#header9)  
10. [Adjusting the `config.xml` File](#header10)  
  1. [XML Element: No Attributes And A Simple String As Content](#header10_1)  
  2. [XML Element: One Or More Attributes And A Simple String As Content](#header10_2)  
  3. [Empty XML Element: One Or More Attributes But No Content](#header10_3)  
  4. [XML Element: One Or More Attributes And Structured Content](#header10_4)
  5. [Full Example](#header10_5)



<a name="header1"></a>
##1) Overview
**cva-create** is a tool designed primarily to help people who regularly create Cordova projects.  If you're an occasional Cordova user, you might not find this tool so useful.

**cva-create** creates a simple Cordova project for any platform and adds a configurable number of plugins.  In a single command, this tool performs the following sequence of Cordova CLI commands:

1. `cordova create <app dir> <app id> <app name>`
2. `cd <app dir>`
3. `cordova platform add <platform names>`
4. One or more invocations of `cordova plugin add <plugin name>`
5. Optionally updates Cordova's `config.xml` file
6. Optionally runs `cordova prepare`

[Top](#top)


<a name="header2"></a>
##2) Attribution
`cva-create` is a fork of John Wargo's [cordova-create tool](https://github.com/johnwargo/Cordova-Create).

John is the author of several books on PhoneGap and Cordova such as [Apache Cordova 3 Programming](http://www.cordovaprogramming.com).  
For more details, see [http://www.johnwargobooks.com].

[Top](#top)



<a name="header3"></a>
##3) Requirements
This module expects the following software already to be installed, configured and working:

1. An Apache Cordova development environment, including the appropriate native SDKs (Android Development Tools, Xcode etc.)
2. NodeJS and other associated tools such as `npm`.

[Top](#top)



<a name="header4"></a>
##4) Installation
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
##5) Upgrade
If you are upgrading **cva-create** from a previous version, before running a build with the new version, first run:

    cva-create upgrade_config
  
The `upgrade_config` parameter causes any new properties used by the latest version of **cva-create** to be inserted into the existing `cva-create.json` file in your home directory.  Existing property values in `cva-create.json` will not be touched.

Running `cva-create upgrade_config` will not build a Cordova project.

[Top](#top)



<a name="header6"></a>
##6) Usage
1. If this is the first time you have used **cva-create**, then you must start by creating the global configuration file.  Open a terminal window and run:

    `cva-create gen_config`
  
   Using the `gen_config` parameter will not cause a Cordova project to be built.  Instead it will simply create a file called `cva-create.json` in your home directory.  This file contains a set of parameters that will be used as default values when `cva-create` builds a Cordova project.

2. Edit `cva-create.json` as appropriate for your situation.

  For instance, if your apps always use the plugin `org.apache.cordova.network-information`, then adding this string to the list of plugins will mean it is automatically added to all projects built by `cva-create`.

3. To create a new Cordova project, open a terminal window, navigate to the directory in which you want the project built and issue the *cva-create* command with the following pattern of arguments:

	`cva-create <app dir> <app id> <app name> <zero or more platform names>`

  Where:
  
  * `<app dir>` is the directory into which the Cordova project will be written.

  * `<app id>` is the identity of the application (for instance, `com.mycorp.thingamajig`)

  * `<app name>` is the name of the application seen by the user of the mobile device.

  * `<platform names>` is an optional set of target platforms. If this list is omitted, then the default platforms listed in the Global Configuration file will be used instead.
    
  The first three parameters are the same as would be used with the Cordova CLI command `cordova create`.

  For instance, if Android and iOS are listed as the default platforms in the Global Configuration file, then to create a Cordova project for both of these platforms called "Thingamajig" in a directory called "thing_1" you would use the following command:

	`cva-create thing_1 com.mycorp.thing1 Thingamajig`

  To create a project for a platform not listed as a default, simply add the platform name(s).  E.G. for Firefox OS, add "firefoxos":

	`cva-create thing_1 com.mycorp.thing1 Thingamajig firefoxos`

4. If you wish a particular project to use values other than those defined in the global configuration file, then copy the `cva-create.json` from your home directory into the local project directory and edit it to contain project specific values.

  The property values in the local configuration file will now override the corresponding values in global configuration file.  See the section on [Using a Local Configuration File](#header9) for details.

[Top](#top)



<a name="header7"></a>
##7) Global Configuration File
When the `cva-create` tool is run using only the `gen_config` parameter, if the file `create-cordova.json` does not exist in your home directory, then it will be created.

If this file already exists, then it will remain unmodified.  Either way, a Cordova project will not be created.

On Windows you can find the global configuration file in the directory `c:\users\<user_name>` (replacing `<user_name>` with the logon name of the current user).

On Mac OS X, this file is located in the user's home directory at `/Users/<user_name>` (again replacing `<user_name>` with the current user's logon name).

When a global configuration file is created for the first time, it will have the following content:

    {
      "cordovaDebug": false,
      "copyFrom": "",
      "linkTo": "",
      "createParms": "",
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

[Top](#top)



<a name="header8"></a>
##8) Configuration Property Names
* `cordovaDebug : Boolean`

  Switches on or off the Cordova `-d` flag.  With this option set to true, additional information will be written to the console as the Cordova CLI commands are executed.
  
  Typically, you should leave this property set to `false` unless something in the build process isn't working.

* `copyFrom : String`

  The directory from which the contents of the `www` directory should be copied.

* `linkTo : String`

  The directory to which the `www` directory should be linked.
  
  **NOTE**
  
  It makes no sense to supply pathname values for both the `copyFrom` *and* `linkTo` properties.  You should specify one, or the other, but not both.
  
  If values are given for both parameters, then the following logic is used:
  
        Does the directory name specified in "copyFrom" exist?
          Yes --> Use this value for the --copyFrom parameter
          No  --> Does the directory name in "linkTo" exist?
                  Yes --> Use this value for --linkTo parameter
                  No  --> Use neither the --copyFrom nor --linkTo parameters

* `createParms : String`

  A string representing a double-escaped JSON object containing parameters such as the path name to a local plugins directory

* `replaceTargetDir : Boolean`

  If the target directory for this Cordova project already exists, should it be replaced?

* `runPrepare : Boolean`

  Determines whether `cordova prepare` should be run after all the plugins have been added

* `pluginList : [String]`

  An array containing the plugins common to all your Cordova projects.

  You can add third party plugins to this list as long as the Cordova CLI can load the plugins using the plugin's ID.  Where this won't work is for locally installed plugins.  If you want to use locally installed plugins, you will need to set a plugin search path during the call to the `cordova create` command using the `createParms` property.

* `platformList : [String]`

  An array containing the names of the default platforms.

  **Important**: The value of the default `platformList` in the global configuration file is OS dependent and is decided as follows:

        windows : ['android', 'windows']
        linux   : ['ubuntu']
        osx     : ['android', 'ios']
        unknown : ['android']

* `proxy : Object`

  An object containing host name and port number for both HTTP and HTTPS proxies, and a Boolean flag to indicate whether the proxy settings should be used or not.  
  This is useful if you sometimes need to work outside a corporate network where the proxy settings are no longer needed.

* `adjustConfigXml : Boolean`

  A Boolean to decide whether or not the Cordova's project's `config.xml` file should be adjusted.

* `configXmlWidget : [Object]`

  An array of objects representing the new or updated elements within the `<widget>` element.


To change the module's configuration, edit the file, providing your own values for the configuration options described above.

[Top](#top)



<a name="header9"></a>
##9) Using a Local Configuration File
If you choose to create a local configuration file, then:

1. This file must live in the directory from which the `cva-create` command is run.
2. The local configuration file need only contain those properties that **differ** from the global configuration file.

The rule for merging global and local configuration values is that all values in the local configuration file will override the corresponding values found in the global configuration file **except** for the list of plugins.

The list of plugins in the local configuration file is always **added** to the list of plugins found in the global configuration file (duplicate entries are removed).

For instance, a local configuration file could contain the following:

    {
      "cordovaDebug"     : true,
      "linkTo"           : "./demo_www",
      "createParms"      : "\"{\\\"plugin_search_path\\\": \\\"/usr/3rd-party/plugins\\\"}\"",
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

Here, the values in the global configuration file are over-ridden as follows (the order in which these properties are specified is not important):

1. `"cordovaDebug": true`

  The `-d` (for debug) option will be added to each Cordova CLI command.
  
2. `"linkTo": "./demo_www"`

   The cordova "www" directory will be linked to an existing directory accessed using the relative pathname "./demo_www"

3. `"createParms": "\"{\\\"plugin_search_path\\\": \\\"/usr/3rd-party/plugins\\\"}\""`

   We want to use some 3rd-party Cordova plugins that live in the `"/usr/3rd-party/plugins/"` directory.

   Notice that the string value has been escaped twice (resulting in the need for a triple backslash in places)!
   
   This is necessary because when the value is read by this node module, one level of escape characters will be consumed.  Whatever string remains must still retain the correct escape syntax for the embedded double-quote characters:
   
   Parsing this double-escaped string removes one level of escape characters, so:
   
   `"\"{\\\"plugin_search_path\\\": \\\"/usr/3rd-party/plugins\\\"}\""`
   
   becomes:

   `"{\"plugin_search_path\": \"/usr/3rd-party/plugins\"}"`

   This parsed string value still contains escaped double quote characters and can now be passed as a parameter to the `cordova create` command

4. `"replaceTargetDir": true`

   If we need to re-run this command to re-create the project, then the existing target directory will be replaced; that is, it will be deleted and re-created!
   
   **Use with care!**

5. `"runPrepare": true`

   The `cordova prepare` CLI command will be issued after all the plugins have been added

6. `"platformList": ['ios']`

   We want to create only an ios project.

7. ```"pluginList": [  
      "https://github.com/vstirbu/PromisesPlugin.git",  
      "com.3rd-party.plugins.do-that",  
      "com.3rd-party.plugins.do-that"  
    ]```

  This list of plugins is used to extend the list of plugins found in the global configuration file.
  
  The plugins that are actually added to your project will be the sum of the global and local plugin lists (after duplicates have been removed) in which the plugin order has been preserved - global first, then local.

8. `"adjustConfigXml": true`  
   `"configXmlWidget": []`

   These properties are documented in the next section on [Adjusting the `config.xml` File](#header10).

[Top](#top)



<a name="header10"></a>
##10) Adjusting the `config.xml` File
When a new Cordova project is created, the basic properties of that project are defined in a file called `config.xml`.
A sample of this file looks like this:

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

The root element is always called `<widget>` and contains all the configurable properties for this project.  If you want to add or update the XML elements within the `<widget>` element, then these values must be defined in either the global or local configuration files.

As with the list of plugins, any values found in your local configuration file will be **added** to the values (if any) found in the global configuration file.

The following configuration properties must be defined:

1. Setting `adjustConfigXml` to `true` instructs `cva-create` to adjust `config.xml` using the values found in the array `configXmlWidget`.  
   Setting `adjustConfigXml` to `false` means that the default `config.xml` generated by Cordova will not be altered, even if values have been specified in the array `configXmlWidget`.
2. In order to add or update the XML elements within the `<widget>` element, one or more JSON objects must be added to the array `configXmlWidget`.
3. Each JSON object must have exactly the following properties - even if you do not intend to add any values to these properties:

    ````{
      "elementName" : "",  
      "attributes"  : {},  
      "content"     : []  
    }````

<a name="header10_1"></a>
###XML Element: No Attributes And A Simple String As Content   
If you wish to add an XML element that does not use attributes, and contains only a string value as its content, then add the following object as an element in the `configXmlWidget` array.

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


<a name="header10_2"></a>
###XML Element: One Or More Attributes And A Simple String As Content   
If you wish add an XML element that has both attributes and content, then add the following object as an element in the `configXmlWidget` array.

The `<author>` element is a good example here:

    "configXmlWidget": [
      { "elementName" : "author",
        "attributes"  : { "email": "chris@whealy.com",
                          "href": "http://whealy.com"
                        },
        "content"     : "Here's some stuff I wrote"
      }
    ]

As above, the `content` property can be either a simple string, or an array with a string as the only element.


<a name="header10_3"></a>
###Empty XML Element: One Or More Attributes But No Content   
If you wish to add an XML element that has attributes, but no content, then add the following as an element in the `configXmlWidget` array.

The `<preference>` XML element is a good example here.  In this case we will set the time out period for the Cordova `deviceready` event to 15 seconds.

**IMPORTANT**

Multiple instances of the same element are not yet supported...

    "configXmlWidget": [
      { "elementName" : "preference",
        "attributes"  : { "name": "loadUrlTimeoutValue",
                          "value": "15000"
                        },
        "content"     : []
      }
    ]

Each attribute name is specified as a property within the `attributes` object, and the value of each property must be a simple string.

You can specify as many properties as are relevant for the particular XML element you are adjusting.

Since this is an empty element, the `content` property must be set to an empty array.

This will then generate the following empty XML element: `<preference name="loadUrlTimeoutValue" value="15000"/>`


<a name="header10_4"></a>
###XML Element: One Or More Attributes And Structured Content   
If you wish to add an XML element that has both attributes and structured (that is, non-string) content, then the `content` array property must contain one or more JSON objects of exactly the same structure used for the parent object.

The `<feature>` element is a good example, since it can contain zero or more `<param>` elements:

    "configXmlWidget": [
      { "elementName" : "feature",
        "attributes"  : { "name": "http://example.org/api/geolocation" },
        "content"     : [
          { "elementName" : "param",
            "attributes"  : { "name": "accuracy",
                              "value": "low"
                            },
            "content"     : []
          }
        ]
      }
    ]


<a name="header10_5"></a>
###Full Example
If your Global Configuration file contains the following:

    {
        "cordovaDebug": false,
        "copyFrom": "",
        "linkTo": "",
        "createParms": "",
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
            "http":  { "host": "proxy.my-corp.com, "port": 8080 },
            "https": { "host": "proxy.my-corp.com", "port": 8080 }
        },
        "adjustConfigXml": true,
        "configXmlWidget": [
          {
            "elementName": "author",
            "attributes": { "email": "chris@whealy.com",
                            "href":  "http://whealy.com"
                          },
            "content": ["\n    Here's some stuff I wrote\n  "]
          },
          {
            "elementName": "preference",
            "attributes": { "name": "loadUrlTimeoutValue",
                            "value": "15000"
                          },
            "content": []
          }
        ]
    }

And your Local Configuration file contains:

    {
      "linkTo"       : "./demo_www",
      "createParms"  : "\"{\\\"plugin_search_path\\\": \\\"/usr/3rd-party/plugins\\\"}\"",
      "replaceTargetDir": false,
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
        }
      ]
    }


Then the adjusted `config.xml` file will look like this:

    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <widget id="mycordovaapp.mycorp.com" version="0.0.1" xmlns="http://www.w3.org/ns/widgets" xmlns:cdv="http://cordova.apache.org/ns/1.0">
      <name>My Cool Cordova App</name>
      <description>This app is so cool, it can do everything except squeeze orange juice and tie shoelaces</description>
      <author email="chris@whealy.com" href="http://whealy.com">
        Here's some stuff I wrote
      </author>
      <content src="index.html"/>
      <access origin="*"/>
      <preference name="loadUrlTimeoutValue" value="15000"/>
    </widget>

[Top](#top)




* * *
&copy; 2014 [Chris Whealy](http://whealy.com)
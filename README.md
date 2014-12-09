<a name="top"></a>
#cva-create

<a name="header1"></a>
##Overview
**cva-create** is a tool designed primarily to help people who regularly create Cordova applications.  If you're an occasional Cordova user, you might not find this tool so useful.

**cva-create** creates a simple Cordova project for any platform and adds a configurable number of plugins.  In a single command, this tool performs the following sequence of Cordova CLI commands:

1. `cordova create <app dir> <app id> <app name>`
2. `cd <app dir>`
3. `cordova platform add <platform names>`
4. One or more invocations of `cordova plugin add <plugin name>`
5. Optionally runs `cordova prepare`



<a name="header2"></a>
##Attribution
`cva-create` is a fork of John Wargo's [cordova-create tool](https://github.com/johnwargo/Cordova-Create).

John is the author of several books on PhoneGap and Cordova such as [Apache Cordova 3 Programming](http://www.cordovaprogramming.com). For more details, see [John's web site](http://www.johnwargobooks.com).



<a name="header3"></a>
##Requirements
This module expects the following software already to be installed, configured and working:

1. An Apache Cordova development environment, including the appropriate native SDKs (Android Development Tools, Xcode etc.)
2. NodeJS and other associated tools such as `npm`.



<a name="header4"></a>
##Installation
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



<a name="header5"></a>
##Usage
1. Start by creating the global configuration file.  Open a terminal window and run:

    `cva-create gen_config`
  
   Using the `gen_config` parameter will not cause a Cordova project to be built.  Instead it will simply create a file called `cva-create.json` in your home directory.  This file contains a set of parameters that will be used as default values when `cva-create` builds a Cordova application.

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

  The property values in the local configuration file will now override the corresponding values in global configuration file.  See the section on [Using a Local Configuration File](#header8) for details.




<a name="header6"></a>
##Global Configuration File
When the `cva-create` tool is run using only the `gen_config` parameter, if the file `create-cordova.json` does not exist in your home directory, then it will be created.

If this file already exists, then it will remain unmodified.  Either way, a Cordova project will not be created.

On Windows you can find the global configuration file in the directory `c:\users\<user_name>` (replacing `<user_name>` with the logon name of the current user).

On Mac OS X, this file is located in the user's home directory at /Users/`<user_name>` (again replacing `<user_name>` with the current user's logon name).

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
      }
    }



<a name="header7"></a>
##Configuration Property Names
* `cordovaDebug : Boolean`

  Switches on or off the Cordova `-d` flag.  With this option set to true, additional information will be written to the console as the Cordova CLI commands are executed.
  
  Typically, you should leave this property set to `false` unless something in the build process isn't working.

* `copyFrom : String`

  The directory from which the contents of the `www` directory should be copied

* `linkTo : String`

  The directory to which the `www` directory should be linked

* `createParms : String`

  A string representing a double-escaped JSON object containing parameters such as the path name to a local plugins directory

* `replaceTargetDir : Boolean`

  If the target directory for this Cordova project already exists, should it be replaced?

* `runPrepare : Boolean`

  Determines whether `cordova prepare` should be run after all the plugins have been added

* `pluginList : [String]`

  A list containing the plugins common to all your Cordova projects.

  You can add third party plugins to this list as long as the Cordova CLI can load the plugins using the plugin's ID.  Where this won't work is for locally installed plugins.  If you want to use locally installed plugins, you will need to set a plugin search path during the call to the `cordova create` command using the `createParms` property.

* `platformList : [String]`

  A list containing the names of the default platforms.

  **Important**: The value of the default `platformList` in the global configuration file is OS dependent and is decided as follows:

        windows : ['android', 'windows']
        linux   : ['ubuntu']
        osx     : ['android', 'ios']
        unknown : ['android']

* `proxy : {Object}`

  An object containing host name and port number for both HTTP and HTTPS proxies, and a Boolean flag to indicate whether the proxy settings should be used or not.  
  This is useful if you sometimes need to work outside a corporate network where the proxy settings are no longer needed.

To change the module's configuration, edit the file, providing your own values for the configuration options described above.



<a name="header8"></a>
##Using a Local Configuration File
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
          "org.apache.cordova.network-information",
          "com.sap.mp.cordova.plugins.logon",
          "com.sap.mp.cordova.plugins.odata"
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
      "org.apache.cordova.network-information",  
      "com.sap.mp.cordova.plugins.logon",  
      "com.sap.mp.cordova.plugins.odata"  
    ]```

  This list of plugins is used to extend the list of plugins found in the global configuration file.
  
  The plugins that are actually added to your application will be the sum of the global and local plugin lists (after duplicates have been removed) in which the plugin order has been preserved - global first, then local.





* * *
&copy; 2014 [Chris Whealy](http://www.whealy.com)
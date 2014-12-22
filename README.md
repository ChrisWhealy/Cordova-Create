<a name="top"></a>
#`cva-create`

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
11. [Using Place Holders In `config.xml` Attributes and Content](#header11)  
  1. [Place Holder Syntax](#header11_1)  
  2. [Place Holder Usage](#header11_2)  
  3. [Simple Example](#header11_3)  
  4. [Mulitple Place Holders](#header11_4)  
  5. [Place Holder Reference Errors](#header11_5)  
12. [Full Example](#header10_5)



<a name="header1"></a>
##1) Overview
`cva-create` is a tool designed primarily to help people who regularly create Cordova projects.  If you're an occasional Cordova user, you might not find this tool so useful.

`cva-create` creates a simple Cordova project for any platform and adds a configurable number of plugins.  In a single command, this tool performs the following sequence of Cordova CLI commands:

1. `cordova create <app dir> <app id> <app name>`
2. `cd <app dir>`
3. `cordova platform add <platform names>`
4. Zero or more invocations of `cordova plugin add <plugin name>`
5. Optionally updates Cordova's `config.xml` file
6. Optionally runs `cordova prepare`

[Top](#top)


<a name="header2"></a>
##2) Attribution
`cva-create` is a fork of John Wargo's [cordova-create tool](https://github.com/johnwargo/Cordova-Create).

John is the author of several books on PhoneGap and Cordova such as [Apache Cordova 3 Programming](http://www.cordovaprogramming.com). For more details, see [http://www.johnwargobooks.com].

[Top](#top)



<a name="header3"></a>
##3) Requirements
This module expects the following software to be already installed, configured and working:

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
If you are upgrading `cva-create` from a previous version, before running a build with the new version, first run:

    cva-create upgrade_config
  
The `upgrade_config` parameter causes any new properties used by the latest version of `cva-create` to be inserted into the existing `cva-create.json` file in your home directory.  Existing property values in `cva-create.json` will not be touched.

Running `cva-create upgrade_config` will not build a Cordova project.

[Top](#top)



<a name="header6"></a>
##6) Usage
1. If this is the first time you have used `cva-create`, then you must start by creating the global configuration file.  Open a terminal window and run:

    `cva-create gen_config`
  
   Using the `gen_config` parameter will not cause a Cordova project to be built.  Instead it will simply create a file called `cva-create.json` in your home directory.  This file contains a set of parameters that will be used as default values when `cva-create` builds a Cordova project.

2. Edit `cva-create.json` in your home directory as appropriate for your situation.

  For instance, if your apps always use the plugin `org.apache.cordova.network-information`, then adding this string to the list of plugins will mean it is automatically added to all projects built by `cva-create`.

3. To create a new Cordova project, open a terminal window, navigate to the directory in which you want the project built and issue the `cva-create` command with the following pattern of arguments:

	`cva-create <app dir> <app id> <app name> <zero or more platform names>`

  Where:
  
  * `<app dir>` is the directory into which the Cordova project will be written.

  * `<app id>` is the identity of the application (for instance, `com.mycorp.thingamajig`)

  * `<app name>` is the name of the application seen by the user of the mobile device.

  * `<platform names>` is an optional set of target platforms. If this list is omitted, then `cva-create` will look first at the default platforms listed in the Global Configuration file.  If any platforms are listed in the Local Configuration files, then the local values take precedence over the global values.
    
  The first three parameters are the same as would be used with the Cordova CLI command `cordova create`.

  For instance, if Android and iOS are listed as the default platforms in the Global Configuration file, then to create a Cordova project for both of these platforms called "Thingamajig" in a directory called "thing_1" you would use the following command:

	`cva-create thing_1 com.mycorp.thingamajig Thingamajig`

  To create a project for a platform not listed as a default, simply add the platform name(s).  E.G. for Firefox OS, add `firefoxos`:

	`cva-create thing_1 com.mycorp.thingamajig Thingamajig firefoxos`

4. If you wish a particular project to use values other than those defined in the global configuration file, then copy the `cva-create.json` from your home directory into the local project directory and edit it to contain project specific values.

  The property values in the local configuration file will now override the corresponding values in global configuration file.  See the section on [Using a Local Configuration File](#header9) for details.

[Top](#top)



<a name="header7"></a>
##7) Global Configuration File
When the `cva-create` tool is run using only the `gen_config` parameter, if the file `create-cordova.json` does not exist in your home directory, then it will be created with default values.

If this file already exists, then it will remain unmodified.  Either way, a Cordova project will not be created.

On Windows you can find the global configuration file in the directory `c:\users\<user_name>` (replacing `<user_name>` with the logon name of the current user).

On Mac OS X, this file is located in the user's home directory at `/Users/<user_name>` (again replacing `<user_name>` with the current user's logon name).

When a global configuration file is created for the first time on a Mac, it will have the following default content:

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

If you are running on some other operating system, then the only difference will be the list of [default platforms](#header8_1) since this is OS specific.

[Top](#top)



<a name="header8"></a>
##8) Configuration Property Names
* `cordovaDebug : Boolean`

  Switches the Cordova `-d` flag on or off.  With this option set to true, additional debug information will be written to the console as the Cordova CLI commands are executed.
  
  Typically, you should leave this property set to `false` unless something in the build process is going wrong.

* `copyFrom : String`

  The directory from which the contents of the `www` directory should be copied.

* `linkTo : String`

  The directory to which the `www` directory should be linked.
  
  **NOTE:**  It makes no sense to supply pathnames for both the `copyFrom` *and* `linkTo` properties.  You should specify one, or the other, but not both.
  
  However, if you are feeling particularly over zealous and supply pathnames for *both* parameters, then the following logic is used:
  
        Does the directory name specified in "copyFrom" exist?
          Yes --> Use this value for the --copyFrom parameter and ignore the "linkTo" property
          No  --> Does the directory name specified in "linkTo" exist?
                  Yes --> Use this value for the --linkTo parameter
                  No  --> "cordova create" will be run using neither the --copyFrom nor --linkTo parameters

* `createParms : String`

  A string representing a double-escaped JSON object containing parameters such as the path name to a local plugins directory

* `replaceTargetDir : Boolean`

  If the target directory for this Cordova project already exists, should it be deleted and recreated?  **Use with care!**

* `runPrepare : Boolean`

  Determines whether `cordova prepare` should be run.  If set to `true`, `cordova prepare` will be performed as the very last step.

* `pluginList : [String]`

  An array containing the plugins common to all your Cordova projects.

  You can add third party plugins to this list as long as the Cordova CLI can load the plugins using the plugin's ID.  Where this won't work is for locally installed plugins.  If you want to use locally installed plugins, you will need to set a plugin search path during the call to the `cordova create` command using the `createParms` property.

<a name="header8_1"></a>
* `platformList : [String]`

  An array containing the names of the default platforms.

  **Important**: The default list of platforms in the global configuration file is OS dependent and is decided as follows:

        windows : ['android', 'windows']
        linux   : ['ubuntu']
        osx     : ['android', 'ios']
        unknown : ['android']

* `proxy : Object`

  An object containing host name and port number for both HTTP and HTTPS proxies, and a Boolean flag to indicate whether the proxy settings should be used or not.
  
  Switching the use of a proxy server on or off is useful if you sometimes need to work outside a corporate network where the proxy settings are no longer needed.

* `adjustConfigXml : Boolean`

  A Boolean to indicate whether or not the Cordova's project's `config.xml` file should be adjusted.

* `configXmlWidget : [Object]`

  An array of objects representing the new or updated elements within the `<widget>` element.


To change the project's configuration, edit the file, providing your own values for the configuration options described above.

[Top](#top)



<a name="header9"></a>
##9) Using a Local Configuration File
If you choose to create a local configuration file, then:

1. This file must live in the same directory from which the `cva-create` command is run.
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

Other than the list of plugins, all values in the local configuration file will override the corresponding values in the global configuration file as follows (the order in which these properties are specified is not important):

1. `"cordovaDebug": true`

   The `-d` (for debug) option will be added to each Cordova CLI command.  Remember, only use this parameter when something is not working correctly in the build process.
  
2. `"linkTo": "./demo_www"`

   The cordova "www" directory will be linked to an existing directory accessed using the relative pathname "./demo_www"

3. `"createParms": "\"{\\\"plugin_search_path\\\": \\\"/usr/3rd-party/plugins\\\"}\""`

   We want to use some 3rd-party Cordova plugins that live in the `"/usr/3rd-party/plugins/"` directory.

   Notice that the string value has been escaped twice.  This results in the need for a triple backslash in certain places!
   
   This is necessary because when the value is read from the file, one level of escape characters will be consumed.  Whatever string remains must still retain the correct escape syntax for the embedded double-quote characters:
   
   Parsing this double-escaped string removes one level of escape characters, so:
   
   `"\"{\\\"plugin_search_path\\\": \\\"/usr/3rd-party/plugins\\\"}\""`
   
   becomes:

   `"{\"plugin_search_path\": \"/usr/3rd-party/plugins\"}"`

   This parsed string value still contains escaped double quote characters and can now be passed as a parameter to the `cordova create` command.

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

  This list of plugins is used to extend the list of plugins found in the global configuration file.
  
  The plugins that are actually added to your project will be the sum of the global and local plugin lists (after duplicates have been removed) in which the plugin order has been preserved - global first, then local.

8. `"adjustConfigXml": true`  
     `"configXmlWidget": []`

   These properties are documented in the next section on [Adjusting the `config.xml` File](#header10).

[Top](#top)



<a name="header10"></a>
##10) Adjusting the `config.xml` File
When a new Cordova project is created, the basic, OS independent properties of that project are defined in a file called `config.xml`. A sample of this file looks like this:

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

As with the list of plugins, any values found in your local configuration file will be **added** to the zero or more values found in the global configuration file.

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

<a name="header10_1"></a>
###XML Element: No Attributes And A Simple String As Content   
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


<a name="header10_2"></a>
###XML Element: One Or More Attributes And A Simple String As Content   
If you wish to add an XML element that has both attributes and simple content, then add the following object as an element in the `configXmlWidget` array.

The `<author>` element is a good example here:

    "configXmlWidget": [
      { "elementName" : "author",
        "attributes"  : { "email": "chris@whealy.com", "href": "http://whealy.com" },
        "content"     : "Here's some stuff I wrote"
      }
    ]

As above, the `content` property can be either a simple string, or an array with a string as the only element.


<a name="header10_3"></a>
###Empty XML Element: One Or More Attributes But No Content   
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
        "attributes"  : { "Squeeze": "Orange Juice" },
        "content"     : []
      },
      { "elementName" : "preference",
        "attributes"  : { "Tie": "Shoelaces" },
        "content"     : []
      }
    ]

**WARNING**  
If identical `configXmlWidget` element details are added to both the Global and Local configuration files, then both instances of the element will appear in the adjusted `config.xml` file.

The only check for duplicates is for `<preference>` elements having an attribute called `name.`
  
If a `<preference>` element is defined in both the Global and Local configuration files that has a `name` attribute, then if the values of the `name` attributes are the same, then the normal priority rules apply in which the local value overrides the global value.

In this case, your Global configuration file could set the Cordova `deviceready` timeout to 30 seconds:

    { "elementName" : "preference",
      "attributes"  : { "name": "loadUrlTimeoutValue", "value": "30000" },
      "content"     : []
    },

But then in your Local configuration file, this value can be overridden and set to 60 seconds for that one particular project.

    { "elementName" : "preference",
      "attributes"  : { "name": "loadUrlTimeoutValue", "value": "60000" },
      "content"     : []
    },

Any other duplicate definitions of `configXmlWidget` elements between the Global and Local configuration files will result in duplicate elements appearing in the adjusted `config.xml` file.  
**This could result in an error when trying to run the Cordova project!**



<a name="header10_4"></a>
###XML Element: One Or More Attributes And Structured Content   
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



<a name="header11"></a>
##11) Using Place Holders In `config.xml` Attributes and Content
Generally speaking, most attribute values used by the XML elements in `config.xml` are simple string or Boolean values.  However, there are various attributes that often need to be set equal to values that have already been defined somewhere else.

A typical example is for the attributes and content of the `<author>` element.  Here, you might want to set the email address and URL equal to values that you already defined when you set up either `npm` or `git`.

<a name="header11_1"></a>
###11.1) Place Holder Syntax
Instead of repeating a value defined elsewhere, you can reference it using a place holder.  Three place holders are recognised:

`$git()` - Reference a `git` variable  
`$npm()` - Reference an `npm` variable  
`$env()` - Reference an environment variable available to NodeJS via its `process.env` object

<a name="header11_2"></a>
###11.2) Place Holder Usage
Only the XML attributes `email` and `href` will be parsed for place holders; however, if the content of an XML element is a simple string value, then this string value may contain any number of place holders.

If, for instance, you want to pick up the value of the `git` variable `user.email`, simply use the following string somewhere inside the attribute or content string value:

    $git(user.email)

Similarly, `npm` variables such as `init.author.url` are referenced as follows:

    $npm(init.author.url)

Finally, to pick up the value of an environment variable, use:

    $env(USER)

<a name="header11_3"></a>
###11.3) Simple Example
Using the above information, you could now define the `<author>` element of `config.xml` something like this:

    {
      "elementName": "author",
      "attributes": { "email": "$git(user.email)",
                      "href":  "$npm(init.author.url)" },
      "content": ["\n    Written by $env(USER)    \n  "]
    },


<a name="header11_4"></a>
###11.4) Multiple Place Holders
You can add as many place holders as you like within a single string value.  So for instance, you might choose to define the content of the `<author>` element like this:

    "content": ["Written by $env(USER), better known as $npm(init.author.name) and whose email address is either $git(user.email) or $npm(init.author.email)"]

Assuming you have referenced an existing variable, all place holders will be substituted with the referenced variable's current runtime value.


<a name="header11_5"></a>
###11.5) Place Holder Reference Errors
**IMPORTANT**

1. If you reference a variable name that does not exist, then the place holder will be replaced with an empty string.
2. On *NIX machines, all place holder names are case-sensitive!
3. When using the `$env()` place holder to reference environment variables, you may only specify variables that NodeJS can access via its `process.env` object.  This is usually a smaller list than is displayed if you type `set` from a command prompt.



<a name="header12"></a>
##12) Full Example
Here is full (if somewhat excessive) example.  In this example, the Global Configuration file contains the information shown below.  The list of default plugins has been extended, a proxy server is being used, and the `config.xml` file is being adjusted in the following way:

Both the attributes and the content of the `<author>` element contain various place holders that will be substituted for the current runtime values of variables obtained from `git`, `npm` and the operating system environment.

Two `<preference>` attributes are added as is a `<feature>` element that contains a child `<param>` element.

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


The Local Configuration file contains:

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


Assuming the various `git`, `npm`, and environment variables point to my own details, then the adjusted `config.xml` file will look like this:

    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <widget id="cus.sd.mycontacts" version="0.0.1" xmlns="http://www.w3.org/ns/widgets" xmlns:cdv="http://cordova.apache.org/ns/1.0">
      <name>My Cool Cordova App</name>
      <description>This app is so cool, it can do everything except squeeze orange juice and tie shoelaces</description>
      <author email="chrisw@somewhere.com" href="http://whealy.com/">This app was written by chrisw, better known as Chris Whealy whose email address is either chris@whealy.com or chris@whealy.com</author>
      <content src="index.html"/>
      <access origin="*"/>
      <preference name="LoadUrlTimeoutValue" value="30000"/>
      <preference name="SomeOtherName" value="SomeOtherValue"/>
      <feature name="http://example.org/api/geolocation">
        <param name="accuracy" value="low"/>
      </feature>
    </widget>

[Top](#top)




* * *
&copy; 2014 [Chris Whealy](http://whealy.com)
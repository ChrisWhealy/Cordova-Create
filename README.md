cordova-create
==============
A node command for creating a simple Cordova project with a couple of common platforms and plugins added. Essentially, this command replaces the common set of commands a Cordova developer types every (and I do mean every) time he or she creates a new Cordova project. 

If you create an occasional Cordova application, this probably won't be that useful to you. For me, in my day job as a product manager for a set of enterprise plugins for Apache Cordova and my side job, which is producing a catalog of books on Apache Cordova, I find that I'm constantly creating new Cordova projects. This module should save you a little time and make it very easy to create new Cordova projects.

The module is customizable; when you run the command the first time, it creates a configuration file that you can easily modify to customize how the module works for you. Through the configuration file, you can specify the platforms and plugins that are added to the project created using the command. You can even enable debug mode, which causes the module to execute the cordova command with it's debug (-d) command line option. All of the customization capabilities will be described later.

Requirements
============
This module expects that you have a functional Apache Cordova development environment running. This includes the appropriate native SDKs (Android Development Tools, Xcode and so on), NodeJS and other associated tools. As the command is a node module, it relies upon the same technology as the Cordova CLI does. 

An excellent resource for information on how to setup a Cordova development environment is my [Apache Cordova 3 Programming](http://www.cordovaprogramming.com) book.

Installation
============
Install this module using npm by opening a terminal window and executing the following command:

Windows:

	npm install -g cordova-create

Macintosh OS X:

	sudo npm install -g cordova-create


If you've downloaded this module's code from GitHub, you can install the module by extracting the files then opening a terminal window and navigating to the folder where this file is located and issuing the following command:

Windows:

	npm install -g

Macintosh OS X:

	sudo npm install -g

Usage
===========
To create a new project using this command, open a terminal window and navigate to the folder where you want the project created and issue the following command:

	cordova-create folder app_id app_name [platform list]

The first three parameters are the same parameters you would use with the Cordova create command. The platform list, shown as an optional parameter (by the use of brackets), defines the list of target platforms you want to use for the application project.

To create a sample Android project called Hello2 in a folder called hello_2 you would use the following command:

	cordova-create hello_2 com.johnwargo.hello2 Hello2 android

To create the same project, but include an iOS project as well, you would use the following command:

	cordova-create hello_2 com.johnwargo.hello2 Hello2 android ios

If you do not specify a platform list on the command line, the set of default platforms for your current operating system (described below) will be used. 

Customization
======================
=======
Windows:

	npm install -g cordova-create

Macintosh OS X:

	sudo npm install -g cordova-create


If you've downloaded this module's code from GitHub, you can install the module by extracting the files then opening a terminal window and navigating to the folder where this file is located and issuing the following command:

Windows:

	npm install -g

Macintosh OS X:

	sudo npm install -g

Usage
===========
To create a new project using this command, open a terminal window and navigate to the folder where you want the project created and issue the following command:

	cordova-create folder app_id app_name [platform list]

The first three parameters are the same parameters you would use with the Cordova create command. The platform list, shown as an optional parameter (by the use of brackets), defines the list of target platforms you want to use for the application project.

To create a sample Android project called Hello2 in a folder called hello_2 you would use the following command:

	cordova-create hello_2 com.johnwargo.hello2 Hello2 android

To create the same project, but include an iOS project as well, you would use the following command:

	cordova-create hello_2 com.johnwargo.hello2 Hello2 android ios

If you do not specify a platform list on the command line, the set of default platforms for your current operating system (described below) will be used. 

Customization
======================
When the command runs for the first time, it creates a configuration file that can be used to customize the tasks the command performs when it runs. The configuration file is called 'cordova-create.json' and it can be located in the user's home folder. On Windows you can find the file in the c:\users\user_name folder (replacing user_name with the login name for the current user). On Macintosh OS X, the file is located in the user's home folder at /Users/user_name (again replacing user_name with the user's logon name).

The default options for the application are defined in the following JSON object stored in the configuration file:

    {
      "platformList": [ "android", "firefoxos", "ios" ],
      "pluginList": [ "org.apache.cordova.console", "org.apache.cordova.dialogs", "org.apache.cordova.device" ],
      "enableDebug": false
    }

To change the module's configuration, edit the JSON object, providing your own values for the configuration options described by the object. 

The default list of target platforms will differ depending on what operating system you are using. If you look at the script's code, you will see the following default platforms lists:

	var default_platforms_osx = ['android', 'firefoxos', 'ios'];
	var default_platforms_win = ['android', 'firefoxos', 'wp8'];

You can add third party plugins to the pluginlist. This should work as long as the Cordova CLI can load the plugins using the plugin's ID. Where this won't work is for locally installed plugins. If you want to use locally installed plugins, you will need to set a plugin search path during the call to the cordova create command. 

The enableDebug parameter causes the module to add the debug (-d) parameter to the cordova CLI command . With this option set to true, additional information will be written to the console as the Cordova CLI commands are executed. You will want to enable this option if something isn't working with the command and you want more information about what's happening as the different commands are executed. 

Many people enable the option by default for all cordova commands, but this really doesn't make sense since, in a properly configured Cordova development environment, stuff just works. Don't succumb, only enable this option when it's really useful or needed. 

* * *
&copy; 2014 [John M. Wargo](http://www.johnwargo.com) - Please buy [one of my books](http://www.johnwargobooks.com) if you like and/or use this.
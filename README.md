CordovaCreate
=============

A node command for creating a simple Cordova project with a couple of common plugins.

Introduction
============

As I worked on my many Apache Cordova books, I found myself regularly creating Cordova projects by typing the same commands over and over again. To make it easier for me, I created this simple command that creates a standard Cordova project, adds the platforms and a short set of common plugins I use in every project (console & dialogs).

Requirements
============

This module expects that you have a functional Apache Cordova development environment running. This includes the appropriate native SDKs (Android Development Tools [ADT], Xcode and so on), NodeJS and other associated tools. 

An excellent resource for information on how to setup a Cordova development environment is my [Apache Cordova 3 Programming](http://www.cordovaprogramming.com) book.

Installation
============

Install this module by opening a terminal window and navigating to the folder where this file is located and issuing the following command:

Windows

	npm install -g

Macintosh OS X 

	sudo npm install -g

Usage
===========

To create a new project using this command, open a terminal window and navigate to the folder where you want the project created and issue the following command:

	cva_create folder app_id app_name [platform list]

So, to create a sample Android project called Hello2 in a folder called hello_2 you would use the following command:

	cva_create hello_2 com.johnwargo.hello2 Hello2 android

To create the same project, but include an iOS project as well, you would use the following command:

	cva_create hello_2 com.johnwargo.hello2 Hello2 android ios

If you do not specify a platform list on the command line, the set of default platforms for your current operating system (described below) will be used. 

Customizing the Script
======================

To customize the list of platforms that is used to create the project, look for the following two lines in the script file:

	var default_platforms_ios = ['android', 'firefoxos', 'ios'];
	var default_platforms_win = ['android', 'firefoxos', 'wp8'];

Add or remove values from either array to as needed for your environment.

To customize the list of plugins that are added to the Cordova project created using this script, look for the following variable definition:

	var plugin_list = ['org.apache.cordova.console', 'org.apache.cordova.dialogs', 'org.apache.cordova.device'];

Add or remove plugin IDs as needed. You can add third party plugins to this list as well. This should work as long as the Cordova CLI can load the plugins using the plugin's ID. Where this won't work is for locally installed plugins. If you want to use locally installed plugins, you will need to set a plugin search path during the call to the cordova create command. 

* * *
&copy; 2014 [John M. Wargo](http://www.johnwargo.com) - Please buy one of [my books](hhtp://www.johnwargobooks.com) if you like/use this.

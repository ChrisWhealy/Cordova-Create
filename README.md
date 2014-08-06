CordovaCreate
=============

A node command for creating a simple Cordova project with a couple of common plugins.

Introduction
============

As I worked on my many Apache Cordova books, I found myself regularly creating Cordova projects by typing the same commands over and over again. To make it easier for me, I created this simple command that creates a standard Cordova project, adds the platforms and a short set of common plugins I use in every project (console & dialogs).

Perhaps I'll enhance this some day to add a command for adding all core plugins or passing the plugin list on the command line. Who knows, stay tuned.

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


* * *
&copy; 2014 [John M. Wargo](http://www.johnwargo.com) - Please buy one of [my books](hhtp://www.johnwargobooks.com) if you like/use this.

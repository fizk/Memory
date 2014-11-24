#Total Recall

This is an implementation of the classic game *Memory*. It uses a gaming sever created by the kind people at 99design. 
They have implemented the logic and expose it through an [API](http://totalrecall.99cluster.com/). What this code does 
is to implement the client side logic so it's possible to play the game from the comfort of your own browser.
  
##Install
Well obviously you are going to clone this repo onto your machine. That's the only installation that you need.


This is first and foremost an JavaScript browser/client application. An as such it only needs the `index.html` file 
and the `javascript` and `stylesheets` directories. While I was implementing this application I couldn't connect to
the REST service from the browser. It was like the `Access-Control-Allow-Origin: *` wasn't set and the browser wasn't 
allowed through.

For this reason I implemented three routing scripts:

###index.php
If you are running Apache, use _mode_rewrite_ to route all request other that web resources (js/css/fonts/images...) 
through this PHP script, it wil relay the request to the Total Recall server.

###router.php
If you are running the builtin PHP server, you can use this script to relay all non-web-resources requests 
(js/css/fonts/images...) to the Total Recall server.

    $ php 0.0.0.0:8080 router.php

###develop-router.php
During development, I needed to be able to send request without bombarding the Total Recall server with request.
I also needed to be able to always get the same results. Therefor I created this script. It simply mocks the 
Total Recall server, returning a fixed result every time.

    $ php 0.0.0.0:8080 develop-router.php
    
###javascripts/app.js
If the `Access-Control-Allow-Origin: *` issue gets fixed, then you should head over to the `javascripts/app.js`
file and change the host name for the `Session` object.

        //session.host = '';
    	session.host = 'http://totalrecall.99cluster.com';
    	
In that case you could use a number of different methods to run this application. You could use Apache or nginx. 
You could use PHP builtin server without any routing script

    $ php 0.0.0.0:8080
    
You could also use the the famous Python HTTP server

    $ python -m SimpleHTTPServer
    $ python -m http.server
    
But do make sure you are using an HTTP server. All URIs start with `/` so they are expecting to be running in a 
web-server. Also `XmlHttpRequest` needs to be running on a server to be able to do requests. 
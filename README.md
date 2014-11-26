#Total Recall

This is an implementation of the classic game *Memory*. It uses a gaming sever created by the kind people at 99design. 
They have implemented the logic and expose it through an [API](http://totalrecall.99cluster.com/). What this code does 
is to implement the client side logic so it's possible to play the game from the comfort of your own browser.
  
##Env
This code was written in Google Chrome 39.0.2171.71. The code was also tested on Firefox 33.1.1. There may be issues with
Safari (7.0.4). Most of these issues are the result of `Failed to load resource is not allowed by Access-Control-Allow-Origin.`
Internet Explorer was not tested and I don't think he will pass the test :(
  
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
 
###Development
You have to do 

    $ bower install
    
if you are gonna do some development. The SASS stylesheets need something from the `bower_components` directory.
 
##What have you done?
Here is a little rant about how the code got developed.

###The Objects.
Keeping true to the OOP way of thinking, I knew that I needed a `Game` object. Something that would store the state
of the game as well as sending requests to the Total Recall server. As I started to get deeper into the code I realised
that I was mixing `XmlHttpRequest` with the logic of the game. I extracted the `Ajax` out of the class and creating a new
one called `Session`. This class would be responsible for all communications with the Game server, while the `Game`
class would be responsible for logic and state.

The `Game` class would have to hold a an instance of `Session` and there wouldn't be any need for a `Game` class before
a connection was made to the server. I therefor decided to use a pattern one sees often in _asynchronous_
frameworks when connecting to a remove service.

    new Server().connect(function(connection){
        connection.send();
    });
    
A connection object is created and once in connects it will, in the callback function provide an object that
acts as a pipe to the service. In the case of the Memory Game it looks like this


    var session = new Session();
        session.host = [host];
        session.name = [name];
        session.email = [email];
        session.start(function( game ){
        
            game.create();
        });
        
        
The `game` object provided in the `session.start()` callback function is an instance of the `Game` object
which has been initialised and populated with data that came from the initial connection with the Total Recall server,
like `Session ID` and the size of the board.

###The Markup
When I wrote the first prototype of the game I created the markup needed in the `game.create();` function. That was 
totally fine while I was developing the game logic but once I had all the logic down I wanted to move way from
the fact the `Game` class would control how the markup looked like. The `Game` class would still have to hold a
reference to the _cards_, 'cause they needed to be hooked up with event function that control how the game is played.
But how HTMLElements are augmented to represent change in state had to be extracted from the `Game` class.

The solution was really simple. I just mimicked the `.addEventListener(type,callback,bubble)` interface for the `Game`
class and made these events available: _move_, _flip_, _unflip_, _match_ and _win_. Before I called the 
`game.create();` function I provided the class with a NodeList of all the cards and if something happened in the
game logic one of the events would fire, providing me with a Node from this NodeList 

        
    var session = new Session();
        session.host = [host];
        session.name = [name];
        session.email = [email];
        session.start(function( game ){
        
            game.cards = document.querySelectorAll('.cards');
            
            game.addEventListener('move',function(number){
                // display how many moves have been made
            },false);
            game.addEventListener('flip',function(element){
                // turn element around
            },false);
            game.addEventListener('unflip',function(element){
                // turn element back around
            },false);
            game.addEventListener('match',function(element1,element2){
                // display that element1 and element2 
                // are a pair
            },false);
            game.addEventListener('win',function(result){
                //display the result object from the REST server, or not    
            },false);
            
            game.create();
        });
        
And now the presentation and the game logic have been separated. The only requirement for this to work is that 

1. the object passed to `game.cards` is _interable_ collection
2. that items in that collection implement the [EventTarget](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget.addEventListener) interface
3. that items in that collection are listening for the `click` event

If these requirements are met, then in theory you could use that ever method to display the game and various
state of it.


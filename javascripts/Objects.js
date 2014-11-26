/**
 * Created by einar on 21/11/14.
 */


/**
 * Create a session object.
 * This class is responsible for maintaining connection
 * to the game server as well as creating a Game object
 * when the time is right.
 *
 * IE. This class is responsible for all XmlHttpRequest
 * calls
 *
 * @constructor
 */
var Session = function(){};

/**
 * The game server host name. Don't
 * include a trailing slash.
 *
 * @type {string}
 */
Session.prototype.host = '';
/**
 * ID of the session.
 *
 * @type {String}
 */
Session.prototype.id = undefined;

/**
 * Name of player.
 *
 * @type {String}
 */
Session.prototype.name = undefined;

/**
 * Email of player.
 *
 * @type {String}
 */
Session.prototype.email = undefined;

/**
 * Start the game.
 * The argument to this function will get an instance of the
 * underlying Game object. You can the attach event listeners
 * to it to monitor the game.
 *
 * @param {Function} callback
 * @param {Function} error
 */
Session.prototype.start = function( callback, error ){
	var formData = new FormData();
	formData.append('name',this.name);
	formData.append('email',this.email);
	var xhr = new XMLHttpRequest();
	xhr.open('post',this.host+'/games/');
	xhr.addEventListener('error',function(){
		error.call(this);
	},false);
	xhr.addEventListener('abort',function(){
		error.call(this);
	},false);
	xhr.addEventListener('load',function(event){
		if( event.target.status == 200 ){
			var object = JSON.parse( event.target.responseText );
			this.id = object.id;
			var game = new Game();
			game.width = object.width;
			game.height = object.height;
			game.session = this;
			callback.call(this,game);
		}else{
			error.call(this);
		}

	}.bind(this),false);
	xhr.send(formData);
};

/**
 * Check position on board.
 *
 * @param {int} x
 * @param {int} y
 * @param {Function} callback
 * @param {Function} error
 */
Session.prototype.check = function( x, y, callback, error ){

	var xhr = new XMLHttpRequest();
	xhr.open('get',this.host+'/games/'+this.id+'/cards/'+(y)+','+(x));
	xhr.addEventListener('load',function(event){
		if( event.target.status == 200 ){
			callback.call(this,event.target.responseText);
		}else{
			error.call(this);
		}
	},false);
	xhr.addEventListener('error',function(){
		error.call(this);
	},false);
	xhr.addEventListener('abort',function(){
		error.call(this);
	},false);
	xhr.send();
};

/**
 * Check end of game.
 *
 * @param {int} x1
 * @param {int} y1
 * @param {int} x2
 * @param {int} y2
 * @param {Function} callback
 * @param {Function} error
 */
Session.prototype.end = function( x1, y1, x2, y2, callback, error ){
	var formData = new FormData();
	formData.append('x1',x1);
	formData.append('y1',y1);
	formData.append('x2',x2);
	formData.append('y2',y2);
	var xhr = new XMLHttpRequest();
	xhr.open('post',this.host+'/games/'+this.id+'/end');
	xhr.addEventListener('load',function(event){
		if( event.target.status == 200 ){
			callback.call(this,JSON.parse(event.target.responseText));
		}else{
			error.call(this,event.target.responseText);
		}
	},false);
	xhr.addEventListener('error',function(){
		error.call(this);
	},false);
	xhr.addEventListener('abort',function(){
		error.call(this);
	},false);
	xhr.send(formData);
};

/**
 * Game class. This class implements all game
 * logic. It gets an instance of the Session class
 * to connect to the game server.
 *
 * @constructor
 */
var Game = function(){};

/**
 * Height of the board.
 *
 * @type {number}
 */
Game.prototype.height = 0;

/**
 * Width of the board.
 *
 * @type {number}
 */
Game.prototype.width = 0;

/**
 * Instance of the session class. Instance of
 * Game class will use this session to talk to
 * the game server.
 *
 * @type {Session}
 */
Game.prototype.session = undefined;

/**
 *List of all cards as a NodeList object
 * @type {NodeList}
 */
Game.prototype.cards = undefined;

/**
 * The gaming board represented as a 2d array.
 *
 * @type {Array}
 */
Game.prototype.board = [];

/**
 * he gaming matches represented as a 2d array.
 *
 * @type {Array}
 */
Game.prototype.matches = [];

/**
 * Possible states in the game are (among others) no
 * card selected, one card selected and two cards selected.
 *
 * This property represents the selected cards.
 *
 * @type {{first: undefined, last: undefined}}
 */
Game.prototype.selected = {
	first: undefined, 	// { x:int, y:int, value:string }
	last: undefined		// { x:int, y:int, value:string }
};

/**
 * Maximum number of pairs in the game.
 * This value is set by the Game.create function. The logic
 * is: height * width / 2
 * @type {number}
 */
Game.prototype.size = 0;

/**
 * Number of selected pairs. every time a user gets a pair,
 * this number will increment by one.
 *
 * @type {number}
 */
Game.prototype.pairs = 0;

/**
 * Array of event callback functions
 * @type {{move: Array}}
 */
Game.prototype.events = {
	'move': [],
	'flip': [],
	'unflip': [],
	'match': [],
	'win': [],
	'before': [],
	'after': [],
	'error': []
};

/**
 * How often the user has flipped cards
 * @type {number}
 */
Game.prototype.move = 0;

/**
 * Check if the two selected cards match.
 *
 * If the match the underlying HTMLElements will be
 * returned in an array, else a false value is returned.
 *
 * @returns {boolean|Array}
 */
Game.prototype.match = function(){
	if((this.selected.first != undefined && this.selected.last != undefined) &&
		(this.selected.first.value == this.selected.last.value)){

		this.matches[this.selected.first.x][this.selected.first.y] = true;
		this.matches[this.selected.last.x][this.selected.last.y] = true;

		return [
			this.selected.first.element,
			this.selected.last.element
		];
	}else{
		return false;
	}
};

/**
 * Store a card in the 'selected' slot property.
 *
 * You can use this function to clear ot all selections by
 * passing it a undefined value.
 *
 * @param object {{x:int, y:int, value:string, element:Node}|undefined}
 */
Game.prototype.store = function(object){
	if(!object){
		this.selected.first = undefined;
		this.selected.last = undefined;
	}else{
		if( this.selected.first != undefined ){
			this.selected.last = object;
		}else{
			this.selected.first = object;
		}
	}
};

/**
 * Remove card form selection storage.
 *
 * @param {number} x
 * @param {number} y
 */
Game.prototype.unstore = function(x,y){
	if( this.selected.first != undefined &&
		this.selected.first.x == x && this.selected.first.y == y ){
		this.selected.first = undefined;
	}else{
		this.selected.last = undefined;
	}
};

/**
 * This is somewhat of a utility function. When called
 * it will check the state of the Game in regards
 * to matches and wins (end state). If there is a match
 * this function will reset the selection properties
 * to be able to start search for a new match,
 * If there are only one possible marches left it will
 * end the game.
 *
 */
Game.prototype.matchAndWin = function(){
	//MATCH
	//	check if there is a match and if so,
	//	call event handlers and reset state of game
	var elements = undefined;
	if(  ( elements = this.match()) !== false  ){

		this.events.match.forEach(function(f){
			f.call(this,elements[0],elements[1]);
		}.bind(this));

		this.store(undefined);

		this.pairs += 1;

		if( this.pairs == this.size-1 ){

			//WIN-HANDLER
			//	calling all win event handlers
			var last = [];
			this.matches.forEach(function(row, rINdex){
				row.forEach(function(column, cIndex){
					if(column==undefined){
						last.push({x:rINdex,y:cIndex})
					}
				});
			});

			this.session.end(last[0].x,last[0].y,last[1].x,last[1].y,function(object){
				this.events.win.forEach(function(f){
					f.call(this,object);
				}.bind(this));
			}.bind(this),function(){
				this.events.error.forEach(function(f){
					f.call(this);
				}.bind(this));
			}.bind(this));
		}
	}
};

/**
 * Here is most of the logic for the game. When this function
 * is called, you have to pass in an NodeList of all elements
 * representing cards before you call this function, 'cause it
 * will go through that list and add click event handlers to all
 * the cards.
 *
 * @returns {Game}
 */
Game.prototype.create = function(){

	//EMPTY BOARD
	//	create an array that is the board
	//	with undefined values
	for( var i = 0; i< this.height; i++ ){
		this.matches.push([]);
		this.board.push([]);
		for(var ii=0; ii<this.width;ii++){
			this.matches[i].push(undefined);
			this.board[i].push(undefined);
		}
	}

	//SIZE
	//	calculate the size of the board
	//	and store.
	this.size = this.width * this.height / 2;


	var cardIndex = 0;

	//MARKUP
	//	create the board in markup
	this.board.forEach(function(item,index,collection){

		item.forEach(function(ite,ind,col){
			var card = this.cards.item( cardIndex++ );
			card.checked = true;
			//CLICK
			//	every time a user clicks a card
			//	a lot of thing will happen
			card.addEventListener('click',function(event){

				//BACK
				//	the current state of the card is that it's facing
				//	it's back up
				if(!card.checked){
					this.unstore(index,ind);

					//NOT A PART OF MATCH
					//	if this card is not already marked as a
					//	part of a match...
					if( !this.matches[index][ind] ){
						//UN-FLIP-HANDLER
						//	calling all un-flip event handlers
						this.events.unflip.forEach(function(f){
							f.call(this,card);
						}.bind(this));
						card.checked = true;
					}

				//FRONT
				//	the current state of the card is that it's facing
				//	the front up
				}else{

					//NO FLIP
					//	can't flip card, two cards are already
					//	selected
					if( this.selected.first != undefined && this.selected.last != undefined ){
						event.preventDefault();
						event.target.checked = false;
						this.events.error.forEach(function(f){
							f.call(this,{ code:100,message:'invalid selection' });
						}.bind(this));
					//FLIP
					//	flip a card, zero or one card is selected
					}else{

						//CHECKED
						//	alter flip state of card
						card.checked = false;

						//MOVE-HANDLER
						//	calling all move event handlers
						this.move += 1;
						this.events.move.forEach(function(f){
							f.call(this,this.move);
						}.bind(this));

						//VALUE IN MEMORY
						//	the app has the value of this card in memory/cache
						//	no need to use the session object.
						if( this.board[index][ind] != undefined ){

							//FLIP-HANDLER
							//	call all flip event handlers
							this.events.flip.forEach(function(f){
								f.call(this,card,this.board[index][ind]);
							}.bind(this));

							//STORE
							//	store a reference to the card that was selected
							this.store( {
								x:index,
								y:ind,
								value:this.board[index][ind],
								element: card
							} );

							this.matchAndWin();

						//NOT IN MEMORY
						//	the value of this card is not in memory/cache
						//	we have to use the session object and make a request
						//	through it to get the value of the card
						//	We will store it to our cache so we won't have to do
						//	this a gain.
						}else{
							this.events.before.forEach(function(f){
								f.call(this,card);
							}.bind(this));
							this.session.check(index, ind,function(result){
								this.board[index][ind] = result;

								//FLIP-HANDLER
								//	call all flip event handlers
								this.events.flip.forEach(function(f){
									f.call(this,card,result);
								}.bind(this));
								this.events.after.forEach(function(f){
									f.call(this,card);
								}.bind(this));

								//STORE
								//	store a reference to the card that was selected
								this.store( {
									x:index,
									y:ind,
									value:this.board[index][ind],
									element: card
								} );

								this.matchAndWin();

							}.bind(this),function(){
								this.events.error.forEach(function(f){
									f.call(this,{ code:200,message:'Error checking card' });
								}.bind(this));
							}.bind(this));

						}

					}

				}

			}.bind(this),false);

		}.bind(this));

	}.bind(this));

	return this;
};

/**
 * Attach events handlers to this Game object.
 *
 * @param {string} type move|flip|unflip|match|win
 * @param {Function} callback
 * @returns {Game}
 */
Game.prototype.addEventListener = function(type, callback){
	if( this.events.hasOwnProperty(type) ){
		this.events[type].push( callback );
	}
	return this;
};


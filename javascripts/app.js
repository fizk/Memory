/**
 * Created by einar on 21/11/14.
 */

/**
 * Listen for when the document is ready.
 *
 */
document.addEventListener('DOMContentLoaded',function(){

	'use strict';

	/**
	 * When the user tries to 'log in'
	 */
	document.querySelector('.js-login-form').addEventListener('submit',function(event){
		event.preventDefault();
		event.target.classList.add('loading');

		var submitPos = event.target[2].getBoundingClientRect();

		var boardPanel =  document.querySelector('.js-game-panel');
		boardPanel.style.top = submitPos.top + 'px';
		boardPanel.style.bottom = submitPos.bottom + 'px';
		boardPanel.style.left = submitPos.left + 'px';
		boardPanel.style.right = submitPos.right + 'px';

		boardPanel.addEventListener('transitionend',function(event){
			if(event.propertyName == 'top' && parseInt(this.style.top)==0 ){
				document.body.classList.add('display');
			}
		},false);

		var session = new Session();
		//session.host = 'http://totalrecall.99cluster.com';
		session.name = this.name.value;
		session.email = this.email.value;
		session.start(function(object){


			for( var i=0; i<(object.width*object.height);i++ ){
				var container = (function(){
					var container = document.createElement('section');
					container.classList.add('container');
					var card = document.createElement('div');
					card.classList.add('card');
					var front = document.createElement('figure');
					front.classList.add('front');
					var back = document.createElement('figure');
					back.classList.add('back');

					container.appendChild(card);
					card.appendChild(front);
					card.appendChild(back);
					container.appendChild(card);
					return container;
				})();

				var li = document.createElement('li');
				li.appendChild(container);
				document.querySelector('.card-list').appendChild(li);
			}


			object.cards = document.querySelectorAll('.card-list > li') ;

			setTimeout(function(){
				document.body.classList.add('play');
				boardPanel.style.top = 0;
				boardPanel.style.bottom = 0;
				boardPanel.style.left = 0;
				boardPanel.style.right = 0;
			},500);


			object.addEventListener('move',function(e){
				document.getElementById('monitor').innerText = e;
			},false);

			object.addEventListener('flip',function(element, value){
				element.querySelector('.card').classList.add('flipped');
				element.querySelector('.back').innerText = value;
				element.querySelector('.back').classList.add( value );
			},false);

			object.addEventListener('unflip',function(e){
				e.querySelector('.card').classList.remove('flipped');
			},false);

			object.addEventListener('match',function(e1,e2){
				e1.querySelector('.back').style.backgroundColor = 'pink';
				e2.querySelector('.back').style.backgroundColor = 'pink';
			},false);

			object.addEventListener('win',function(result){
				console.log( result );
			},false);

			object.create();

		});



	},false);




},false);

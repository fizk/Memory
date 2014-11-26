/**
 * Created by einar on 21/11/14.
 */


/**
 * Listen for when the document is ready.
 *
 * Once the document is ready we can start the whole game.
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

		var cardTemplate = document.getElementById('tpl-card');
		var dialogTemplate = document.getElementById('tpl-dialog');

		var session = new Session();
		//session.host = 'http://totalrecall.99cluster.com';
		session.name = this.name.value;
		session.email = this.email.value;
		session.start(function(object){

			for( var i=0; i<(object.width*object.height);i++ ){
				var container = cardTemplate.content.cloneNode(true);
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
				document.querySelector('.js-monitor').innerText = e;
			},false);

			object.addEventListener('flip',function(element, value){
				element.querySelector('.card').classList.add('flipped');
				element.querySelector('.back span').innerText = value;
				element.querySelector('.back').classList.add( value );
			},false);

			object.addEventListener('unflip',function(e){
				e.querySelector('.card').classList.remove('flipped');
			},false);

			object.addEventListener('before',function(e){
				e.querySelector('.front').classList.add('loading');
			},false);

			object.addEventListener('after',function(e){
				e.querySelector('.front').classList.remove('loading');
			},false);

			object.addEventListener('error',function(e){
				var dialog = dialogTemplate.content.cloneNode(true);

				document.body.appendChild(dialog);
				document.querySelector('.js-dialog-close').addEventListener('click',function(event){
					event.preventDefault();
					var dialog = document.querySelector('.dialog');
					dialog.parentNode.removeChild(dialog);
				},false);

			},false);

			object.addEventListener('match',function(e1,e2){
				e1.querySelector('.back').classList.add('match');
				e2.querySelector('.back').classList.add('match');

				e1.classList.add('shake');
				e2.classList.add('shake');
			},false);

			object.addEventListener('win',function(result){
				var score = parseInt(28/this.move*100);
				document.body.classList.add('score');
				if( score <= 100 && score >= 70){
					document.querySelector('.score-panel__award').classList.add('up-01');
				}else if( score <= 69 && score >= 45  ){
					document.querySelector('.score-panel__award').classList.add('up-02');
				}else{
					document.querySelector('.score-panel__award').classList.add('up-03');
				}

				document.querySelector('.score-panel__total em').innerText = score + '%';
				console.log(this);
			},false);

			object.create();

		},function(){ alert("Can't connect to server") });



	},false);




},false);

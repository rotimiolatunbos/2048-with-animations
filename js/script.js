window.onload = function () {
	const app = new App();

	const scoreElem = document.querySelector('.score');
	const newGameButton = document.querySelector('#newgame');
	const highscoreElem = document.querySelector('.highscore');

	const highscore = localStorage.getItem('highscore');

	if (highscore) {
		highscoreElem.innerText = highscore;
	}

	newGameButton.onclick = function(event) {
		const modal = document.querySelector('.modal');
		if (modal) {
			modal.remove();
			document.addEventListener('keydown', run);
		}

		app.startOver();
		app.runAnimations(anime);

		updateScore();
		updateHighScore();
	}
	
	function updateScore() {
		if (Number(scoreElem.innerText) !== app.score) {
			scoreElem.innerText = app.score
		}
	}

	function updateHighScore() {
		if (!highscore || app.score > Number(highscore)) {
			localStorage.setItem('highscore', app.score);
			highscoreElem.innerText = app.score;
		} 
	}

	function hasReached2048() {
		if (app.reached2048) {
			const modal = document.createElement('div');
			const message = document.createElement('h1');

			modal.classList.add('modal');
			modal.appendChild(message);

			message.innerText = 'You reached 2048!';

			document.querySelector('.board').appendChild(modal);
			anime({
				targets: modal,
				opacity: [0, 1],
				delay: 1000,
				duration: 500,
				easing: 'easeInOutQuad',
			})

			document.removeEventListener('keydown', run);
		}
	}

	function run() {
		switch (event.key) {
			case 'ArrowUp':
				app.moveUp();
				break;
			case 'ArrowDown':
				app.moveDown();
				break;
			case 'ArrowLeft':
				app.moveLeft();
				break;
			case 'ArrowRight':
				app.moveRight();
				break;
		}	
		
		app.runAnimations(anime);

		updateScore();
		updateHighScore();
		hasReached2048();
	}

	document.addEventListener('keydown', run, false);

	app.runAnimations(anime);
}


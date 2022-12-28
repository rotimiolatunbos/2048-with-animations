class ScalingAnimation {
	constructor(tileIndex, app) {
		this.tileIndex = tileIndex;
		this.app = app;

		this.element = document.querySelector(`#t${this.tileIndex}`);
	}

	get animationInfo() {
		return {
			targets: this.element,
			delay: 300,
			duration: 700,
			keyframes: [
				{scale: 1.1},
				{scale: 1},
			],
			easing: 'easeOutElastic',
			begin: function() {
				setTimeout(function() {
					const number = this.app.board[this.tileIndex];
					
					this.element.innerText = number;
					this.element.classList.remove('shown');
					this.element.classList.forEach(function(cl) {
						if (cl.startsWith('n')) {
							this.element.classList.remove(cl);
						}
					}.bind(this));
					if (number) { 
						this.element.classList.add(`n${number}`, 'shown') 
					} 
				}.bind(this), 200)
					
			}.bind(this),
		}
	}
}

class SlidingAnimation {
	constructor(from, to, fromValue, toValue, app) {
		this.from = from;
		this.to = to;
		this.fromValue = fromValue;
		this.toValue = toValue;
		this.app = app;

		this.element = document.createElement('div');
		this.element.innerText = this.fromValue;
		this.element.classList.add(`t${from}`, `n${this.fromValue}`, 'tile', 'hidden')
	}

	static updateTile(i, app) {
		const tile = document.querySelector(`#t${i}`);
		const number = app.board[i] ? app.board[i] : '';
		
		tile.innerText = number;
		tile.classList.remove('shown');
		tile.classList.forEach(function(cl) {
			if (cl.startsWith('n')) {
				tile.classList.remove(cl);
			}
		});
		if (number) { 
			tile.classList.add(`n${number}`, 'shown') 
		} 
	}

	get animationInfo() {
		const diff = this.from-this.to;
		const gap = Math.floor(diff/this.app.boardSize);
		const dist = 20+this.app.tileSize;
		const animationObj = {
			targets: this.element,
			duration: 300,
			easing: 'easeOutExpo',
			complete: function() {
				this.element.remove();
			}.bind(this)
		}

		if (this.toValue > 0 && this.toValue === this.fromValue) {
			SlidingAnimation.updateTile(this.from, this.app);
		}

		if (this.toValue >= 0 && this.fromValue > 0) {
			SlidingAnimation.updateTile(this.from, this.app);
			setTimeout(function() {
				SlidingAnimation.updateTile(this.to, this.app)
			}.bind(this), 200);
		}
		
		document.querySelector('.board').appendChild(this.element);

		if (
			Math.floor(this.from/this.app.boardSize) !== 
			Math.floor(this.to/this.app.boardSize)
		) { // not on the same row; a vertical movement
			const y = -(gap*dist);
			
			return {
				...animationObj,
				translateY: y,
			}
		} else { // horizontal movement
			const x = -(diff*dist);

			return {
				...animationObj,
				translateX: x,
			}
		}
	}
}

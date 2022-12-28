class App {
	constructor(boardSize, tileSize) {
		this.boardSize = boardSize ? boardSize : 4;
		this.tileSize = tileSize ? tileSize : 80;
		
		this.newGame();
		this.createBoard();
		this.pushNewNumber();
	}

	newGame() {
		this.board = {};
		this.score = 0;
		this.boardChanged = false;
		this.reached2048 = false;
		this.animations = [];
	}

	startOver() {
		this.newGame(); 
		this.createBoard(); 
		for (let key in this.board) { 
			SlidingAnimation.updateTile(key, this); 
		}
		this.pushNewNumber();
	}

	createBoard() {
		for (let i=0; i<this.boardSize**2; i++) { 
			this.board[i] = 0
		}
	}	

	pushNewNumber() {
		const emptyTiles = Object.keys(this.board).reverse().filter(function(tileIndex, ind) {
			return this.board[tileIndex] === 0;
		}.bind(this));

		const randomIndex = emptyTiles.reverse()[Math.floor(Math.random() * (emptyTiles.length))];
		const number = Math.random() > 0.05 ? 2 : 4;
		
		this.board[randomIndex] = number; 
		this.animations.push(new ScalingAnimation(randomIndex, this));
		if (this.boardChanged) this.boardChanged = false;
	}

	runAnimations(callback) {
		this.animations.forEach(function(obj) {
			callback({...obj.animationInfo})
		});
		this.animations = [];
	}

	slideTile(from, to, obj, direction) {
		const directionIsDownOrRight = 
			direction === 'down' || direction === 'right';
		const _from = directionIsDownOrRight ? (this.boardSize**2)-1-from : from;
		const _to = directionIsDownOrRight ? (this.boardSize**2)-1-to : to;

		this.animations.push(new SlidingAnimation(_from, _to, obj[from], obj[to], this));
	}

	// 
	scaleTile(at, direction) {
		const directionIsDownOrRight = 
			direction === 'down' || direction === 'right';
		const _at = directionIsDownOrRight ? (this.boardSize**2)-1-at : at;

		this.animations.push(new ScalingAnimation(_at, this));
	}

	fillWithZeros(values) {
		if (values.length < this.boardSize) {
			let len = values.length;

			while (len < this.boardSize) {
				values.push(0);
				len++;
			}
			return values;
		}
		return values;
	}

	recur(obj, values, filteredKeys, allKeys, direction) {
		const index = values.length;
		const from = Number(filteredKeys[0]);
		const to = Number(allKeys[index]);

		if (filteredKeys.length === 0) {
			return this.fillWithZeros(values);
		} else if (filteredKeys.length === 1) {
			values.push(Number(obj[from]));
			if (from !== to) {
				this.slideTile(from, to, obj, direction);
				if (!this.boardChanged) this.boardChanged = true;
			}

			return this.fillWithZeros(values);
		} else {
			const beforeFrom = filteredKeys[1];
			if (obj[from] === obj[beforeFrom]) {
				const sum = obj[from]*2;

				if (sum === 2048) this.reached2048 = true;
				values.push(sum);
				this.score += sum;
				this.slideTile(beforeFrom, to, obj, direction)
				if (from != to) this.slideTile(from, to, obj, direction);
				this.scaleTile(to, direction);
				if (!this.boardChanged) this.boardChanged = true;

				return this.recur(obj, values, filteredKeys.slice(2), allKeys, direction);
			} else {
				values.push(obj[from]);
				if (from !== to) {
					this.slideTile(from, to, obj, direction);
					if (!this.boardChanged) this.boardChanged = true;
				}
					
				return this.recur(obj, values, filteredKeys.slice(1), allKeys, direction);
			}
		}
	}

	sum(board, steps, direction) {
		const _board = {};
		const directionIsDownOrRight = 
			direction === 'down' || direction === 'right';

		board = directionIsDownOrRight ? this.reverseBoard(board) : board;

		for (let i=0; i<this.boardSize; i++) {
			let j = i;
			const obj = {};
			const row = steps === 1 ? i : null;
				
			while (j<this.boardSize**2) {
				if (row === Math.floor(j/this.boardSize) || steps === 4) {
					obj[j] = board[j];
				}
				j += steps;
			}

			let values = [];
			const allKeys = Object.keys(obj);
			const filteredKeys = allKeys.filter(function(key) {
				return obj[key] !== 0;
			});

			if (filteredKeys.length === 0) {
				values = this.fillWithZeros(values);
			} else if (filteredKeys.length === 1) {
				const from = filteredKeys[0];
				const to = allKeys[0];

				values.push(obj[from])
				if (from !== to)  { 
					this.slideTile(from, to, obj, direction); 
					if (!this.boardChanged) this.boardChanged = true;
				}
				values = this.fillWithZeros(values);
			} else {
				values = this.recur(obj, values, filteredKeys, allKeys, direction);
			}

			for (let k=0; k<this.boardSize; k++) {
				_board[allKeys[k]] = values[k];
			}
		}

		this.board = directionIsDownOrRight ? this.reverseBoard(_board) : _board;
	}

	reverseBoard(board) {
		return Object.assign({},(Object.values(board).reverse()))
	}

	moveDown() {
		this.sum(this.board, this.boardSize, 'down');
		if (this.boardChanged) this.pushNewNumber();
	}

	moveUp() {
		this.sum(this.board, this.boardSize);
		if (this.boardChanged) this.pushNewNumber();
	}

	moveLeft() {
		this.sum(this.board, 1);
		if (this.boardChanged) this.pushNewNumber();
	}

	moveRight() {
		this.sum(this.board, 1, 'right');
		if (this.boardChanged) this.pushNewNumber();
	}
}


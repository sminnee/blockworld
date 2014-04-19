define([
	"src/Animation.js"
], function(Animation) {

	function animationsFor(animal) {
		return {
			'walk-right': [
				[animal + '-right-1',3],
				[animal + '-right-2',3],
				[animal + '-right-3',3],
				[animal + '-right-2',3]
			],
			'walk-left': [
				[animal + '-left-1',3],
				[animal + '-left-2',3],
				[animal + '-left-3',3],
				[animal + '-left-2',3]
			],
			'walk-up': [
				[animal + '-up-1',3],
				[animal + '-up-2',3],
				[animal + '-up-3',3],
				[animal + '-up-2',3]
			],
			'walk-down': [
				[animal + '-down-1',3],
				[animal + '-down-2',3],
				[animal + '-down-3',3],
				[animal + '-down-2',3]
			]
		};
	}

	var Agent = function(i,j,animal) {
		this.i = i;
		this.j = j;
		this.x = i*40;
		this.y = j*40;
		this.dX = 0;
		this.dY = 0;
		this.animationSet = animationsFor(animal);
		this.animation = new Animation(this.animationSet['walk-right']);
	}

	Agent.prototype.sprite = null;

	Agent.prototype.getSprite = function() {
		if(this.sprite === null) {
			this.sprite = this.animation.getSprite();
			this.sprite.x = this.x;
			this.sprite.y = this.y;
		}
		return this.sprite;
	};

	Agent.prototype.tick = function(time) {
		this.animation.tick();
		this.move(this.dX,this.dY);

		if(Math.random() > 0.99) {
			this.setDirection(Math.floor(Math.random()*4)*2+1);
		}
	};

	Agent.prototype.move = function(x,y) {
		this.x += x;
		this.y += y;
		if(this.sprite !== null) {
			this.sprite.x = this.x;
			this.sprite.y = this.y;
		}
	}

	Agent.prototype.setDirection = function(dir) {
		switch(dir) {
		case DIR_TOP:
			this.animation = new Animation(this.animationSet['walk-up'], this.sprite);
			this.dX = 0;
			this.dY = -1;
			break;

		case DIR_BOTTOM:
			this.animation = new Animation(this.animationSet['walk-down'], this.sprite);
			this.dX = 0;
			this.dY = 1;
			break;

		case DIR_LEFT:
			this.animation = new Animation(this.animationSet['walk-left'], this.sprite);
			this.dX = -1;
			this.dY = 0;
			break;

		case DIR_RIGHT:
			this.animation = new Animation(this.animationSet['walk-right'], this.sprite);
			this.dX = 1;
			this.dY = 0;
			break;
		}
	}


	Agent.prototype.constructor = Agent;

	return Agent;
});
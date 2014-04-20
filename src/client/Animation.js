
	var Animation = function(data, sprite) {
		this.data = data;
		this.frameNum = 0;
		this.tickNum = this.data[this.frameNum][1];
		this.sprite = null;
		if(sprite) this.setSprite(sprite);
	}

	Animation.prototype.constructor = Animation;

	Animation.prototype.getTexture = function() {
		return PIXI.Texture.fromFrame(this.data[this.frameNum][0]);
	}	

	Animation.prototype.getSprite = function() {
		if(this.sprite === null) {
			this.sprite = new PIXI.Sprite(this.getTexture());
		}
		return this.sprite;
	}
	Animation.prototype.setSprite = function(sprite) {
		this.sprite = sprite;
		this.sprite.setTexture(this.getTexture());
	}

	Animation.prototype.tick = function(time) {
		this.tickNum--;
		if(this.tickNum < 0) {
			this.frameNum = (this.frameNum+1) % this.data.length;
			this.tickNum = this.data[this.frameNum][1];
			if(this.sprite) this.sprite.setTexture(this.getTexture());		
		}	
	};

	module.exports = Animation;


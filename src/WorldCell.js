define([
	"pixijs"
], function(PIXI) {

	/**
	 * Implements an 8x8 grouping of tiles, use to speed up rendering
	 * @param int i x-axis index of the cell
	 * @param int j y-axis index of the cell
	 */
	var WorldCell = function(i,j) {
		this.tiles = [];
		this.container = null;
		this.renderer = new PIXI.RenderTexture(CELL_SIZE*40, CELL_SIZE*40);
		this.sprite = new PIXI.Sprite(this.renderer);
		this.sprite.x = i*40*CELL_SIZE;
		this.sprite.y = j*40*CELL_SIZE;
		//if((i+j) % 2) this.sprite.tint = 0xAAAAAA;
		this.rendered = false;
		this.i = i;
		this.j = j;
	};

	WorldCell.prototype.constructor = WorldCell;

	WorldCell.prototype.getContainer = function() {
		if(this.container === null) {
			this.container = new PIXI.DisplayObjectContainer();
			for(var i=0;i<this.tiles.length;i++) {
				this.container.addChild(this.tiles[i].getDisplayObject());
			}
		}
		return this.container;
	};

	/**
	 * Add a child element (e.g. a tile) to this cell
	 * @param PIXI.DisplayObject child
	 */
	WorldCell.prototype.addChild = function(child) {
		var offsetI = child.i - this.i*CELL_SIZE;
		var offsetJ = child.j - this.j*CELL_SIZE;
		
		child.setPosition(offsetI * 40, offsetJ * 40);
		this.tiles.push(child);

		if(this.container !== null) {
			this.container.addChild(this.tiles[i].getDisplayObject());
		}

		this.rendered = false;
	};

	/**
	 * Load this cell into a parent object, for rendering
	 * @param PIXI.DisplayObjectContainer parent
	 */
	WorldCell.prototype.addTo = function(parent) {
		//if(!this.rendered) this.render();

		this.sprite.i = this.i;
		this.sprite.j = this.j;
		parent.addChild(this.sprite);
	};

	/**
	 * Returns true ift his WorldCell is already contained by the given parent
	 * @param  PIXI.DisplayObjectContainer parent
	 * @return Boolean
	 */
	WorldCell.prototype.isContainedBy = function(parent) {
		return (parent.children.indexOf(this.sprite) != -1);
	};

	/**
	 * Add a child element (e.g. a tile) to this cell
	 * @param PIXI.DisplayObject child
	 */
	WorldCell.prototype.render = function(child) {
		var __worldCell = this;

		jobQueue.add(function() {
			__worldCell.renderer.render(__worldCell.getContainer());
			__worldCell.rendered = true;
		});
	};

	return WorldCell;
});
var WORLD_W = 256;
var WORLD_H = 256;

var CELL_SIZE = 8;

var BLOK = {};


var grass = PIXI.Texture.fromImage('grass.png');

/**
 * Implements a simple job queue.  Used for renders
 * @type {Object}
 */
jobQueue = {
	queue: [],
	running: false,
	add: function(job) {
		jobQueue.queue.push(job);
		if(!jobQueue.running) {
			jobQueue.running = true;
			jobQueue.delayedRun();
		}
	},

	delayedRun: function() {
		setTimeout(function() {
			jobQueue.run();
		}, 10);
	},

	run: function() {
		if(!jobQueue.queue.length) return;
		jobQueue.running = true;

		var job = jobQueue.queue[0];
		jobQueue.queue.shift();

		job();

		if(jobQueue.queue.length) jobQueue.delayedRun();
		else jobQueue.running = false;
	}
};

/**
 * Implements an 8x8 grouping of tiles, use to speed up rendering
 * @param int i x-axis index of the cell
 * @param int j y-axis index of the cell
 */
BLOK.WorldCell = function(i,j) {
	this.tiles = [];
	this.container = null;
	this.renderer = new PIXI.RenderTexture(CELL_SIZE*40, CELL_SIZE*40);
	this.sprite = new PIXI.Sprite(this.renderer);
	this.sprite.x = i*40*CELL_SIZE;
	this.sprite.y = j*40*CELL_SIZE;
	if((i+j) % 2) this.sprite.tint = 0xAAAAAA;
	this.rendered = false;
	this.i = i;
	this.j = j;
};

BLOK.WorldCell.prototype.getContainer = function() {
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
BLOK.WorldCell.prototype.addChild = function(child) {
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
BLOK.WorldCell.prototype.addTo = function(parent) {
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
BLOK.WorldCell.prototype.isContainedBy = function(parent) {
	return (parent.children.indexOf(this.sprite) != -1);
};

/**
 * Add a child element (e.g. a tile) to this cell
 * @param PIXI.DisplayObject child
 */
BLOK.WorldCell.prototype.render = function(child) {
	var __worldCell = this;

	jobQueue.add(function() {
		__worldCell.renderer.render(__worldCell.getContainer());
		__worldCell.rendered = true;
	});
};

BLOK.WorldCell.prototype.constructor = BLOK.WorldCell;


BLOK.Tile = function(i,j) {
	this.i = i;
	this.j = j;
	this.x = 0;
	this.y = 0;
	this.displayObject = null;
};

BLOK.Tile.prototype.constructor = BLOK.Tile;

BLOK.Tile.prototype.setPosition = function(x,y) {
	this.x = x;
	this.y = y;
	if(this.displayObject !== null) {
		this.displayObject.x = this.x;
		this.displayObject.x = this.y;
	}
};

BLOK.Tile.prototype.getDisplayObject = function() {
	if(this.displayObject === null) {
		this.displayObject = new PIXI.Sprite(grass);
		this.displayObject.x = this.x;
		this.displayObject.y = this.y;
		this.displayObject.i = this.i;
		this.displayObject.j = this.j;
	}
	return this.displayObject;
};


/**
 * Initialise a w x h array of world cells.
 * The world elements are grouped into cells (each a PIXI.DisplayObjectContainer), which each
 * define an CELL_SIZExCELL_SIZE area of the map. The cells are loaded to/from display memory (i.e., the worldLayer),
 * to ensure that rendering is quick when opening large maps.
 */
function initCells(w,h) {
	var worldCells = [];
	for(var i=0;i<w;i++) {
		worldCells[i] = [];
		for(var j=0;j<h;j++) {
			worldCells[i][j] = new BLOK.WorldCell(i,j);
		}
	}

	// Funciton to add a tile
	worldCells.addChild = function(tile) {
		var cellI = Math.floor(tile.i/CELL_SIZE);
		var cellJ = Math.floor(tile.j/CELL_SIZE);
		this[cellI][cellJ].addChild(tile);
	};

	worldCells.render = function() {
		var start = new Date().getTime();

		for(var i=0;i<this.length;i++) {
			for(var j=0;j<this[i].length;j++) {
				this[i][j].render();
			}
		}
		var elapsed = new Date().getTime() - start;
	};

	return worldCells;
}

var tileColours = [ 0x007700, 0x000077, 0x770000, 0x007777 ];

/**
 * Generate a single tile as a PIXI object
 * i,j: The location on the tile grid where this tile appears
 */
function tile(i, j) {
	// Graphic sprites are much faster
	var graphics = new PIXI.Sprite(grass);
	/*
	var graphics = new PIXI.Graphics();

	graphics.beginFill(tileColours[Math.floor(Math.random()*tileColours.length)]);
	graphics.drawRect(-18,-18,36,36);
	graphics.endFill();

	graphics.hitArea = new PIXI.Rectangle(-20, -20, 40, 40);
	graphics.interactive = true;
	graphics.buttonMode = true;

	graphics.click = function() {
		this.beginFill(0x0000FF);
		this.drawRect(-18,-18,36,36);
		this.endFill();
	};
	*/

	graphics.i = i;
	graphics.j = j;

	return graphics;
}

/**
 * Load the cells into the worldLayer that would currently be visible
 */
function loadCells(worldLayer, renderer) {
	var scale = worldLayer.scale.x; // assume x==y
	var x = -worldLayer.x / scale;
	var y = -worldLayer.y / scale;

	var minI = Math.max(0,Math.floor(x/40/CELL_SIZE));
	var minJ = Math.max(0,Math.floor(y/40/CELL_SIZE));
	var maxI = Math.min(WORLD_W/CELL_SIZE-1, minI + Math.ceil((renderer.width/40)/scale/CELL_SIZE));
	var maxJ = Math.min(WORLD_H/CELL_SIZE-1, minJ + Math.ceil((renderer.height/40)/scale/CELL_SIZE));

	var cellsLoaded = minI+','+minJ+','+maxI+','+maxJ;

	if(typeof worldLayer.cellsLoaded == "string" && worldLayer.cellsLoaded == cellsLoaded) return;

	var i,j,child;

	for(i = worldLayer.children.length-1; i >= 0; i--) {
		child = worldLayer.children[i];
		if(child.i < minI || child.i > maxI || child.j < minJ || child.j > maxJ) {
			worldLayer.removeChild(child);
		}
	}
	for(i=minI;i<=maxI;i++) {
		for(j=minJ;j<=maxJ;j++) {
			if(!worldCells[i][j].isContainedBy(worldLayer)) {
				worldCells[i][j].addTo(worldLayer);
			}
		}
	}

	worldLayer.cellsLoaded = cellsLoaded;
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Initialise PIXI: renderer, stage, and worldLayer
 */

// create an new instance of a pixi stage
var stage = new PIXI.Stage(0x333333);

// create a renderer instance.
var renderer = PIXI.autoDetectRenderer(window.innerWidth,window.innerHeight);
document.body.appendChild(renderer.view);

window.onresize = function() {
	renderer.resize(window.innerWidth,window.innerHeight);
	loadCells(worldLayer, renderer);
};

var worldLayer = new PIXI.DisplayObjectContainer();

stage.addChild(worldLayer);

// Initialize world cells: 2d array of CELL_SIZExCELL_SIZE cells
var worldCells = initCells(WORLD_W/CELL_SIZE, WORLD_H/CELL_SIZE);

// Initialize ground
for(var i=0;i<WORLD_W;i++) {
	for(var j=0;j<WORLD_H;j++) {
		worldCells.addChild(new BLOK.Tile(i,j));
	}
}

worldCells.render();

loadCells(worldLayer, renderer);

// Animation loop
requestAnimFrame(animate);
function animate() {

//	scale = scale * 0.9;
//	worldLayer.scale = new PIXI.Point(scale,scale);
//	loadCells(worldLayer);
    requestAnimFrame(animate);
    if(renderer) renderer.render(stage);
}

// Support for dragging
stage.mousedown = function() {
	var pos = this.getMousePosition();
	this.dragOffset = { x: pos.x-worldLayer.x,y:pos.y-worldLayer.y } ;
};

stage.mouseup = function() {
	this.dragOffset = null;
};

stage.mousemove = function() {
	if(this.dragOffset) {
		var point = this.getMousePosition();
		worldLayer.x = point.x - this.dragOffset.x;
		worldLayer.y = point.y - this.dragOffset.y;
		loadCells(worldLayer, renderer);
	}
};

window.onkeydown = function(e) {
	switch(e.keyCode) {
		// +
		case 187:
			worldLayer.scale = new PIXI.Point(worldLayer.scale.x*1.5,worldLayer.scale.y*1.5);
			loadCells(worldLayer, renderer);
			break;

		// -
		case 189:
			worldLayer.scale = new PIXI.Point(worldLayer.scale.x/1.5,worldLayer.scale.y/1.5);
			loadCells(worldLayer, renderer);
			break;

	}
};
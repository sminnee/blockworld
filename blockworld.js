var WORLD_W = 256;
var WORLD_H = 256;

var CELL_SIZE = 8;

// Directional constants used to look up results from getNeighboursFrom()
var DIR_TL = 0;
var DIR_TOP = 1;
var DIR_TR = 2;
var DIR_RIGHT = 3;
var DIR_BR = 4;
var DIR_BOTTOM = 5;
var DIR_BL = 6;
var DIR_LEFT = 7;

var BLOK = {};

	var tileLookup = {
		grass: [
								//TRBL - 0=diff, 1=same
			null, //'grass',			//0000 - currently b0kred looking
			null, //'grass',			//0001 - currently b0kred looking
			null, //'grass',			//0010 - currently b0kred looking
			'grass-tr-rock',	//0011
			null, //'grass',			//0100 - currently b0kred looking
			null, //'rock-bottom-grass',//0101 - currently b0kred looking
			'grass-tl-rock',	//0110
			'rock-bottom-grass',//0111
			null, //'grass',			//1000 - currently b0kred looking
			'grass-br-rock',	//1001
			null, //'rock-left-grass',	//1010 - currently b0kred looking
			'rock-left-grass',	//1011
			'rock-tr-grass',	//1100
			'rock-top-grass',	//1101
			'rock-right-grass',	//1110
			'grass',			//1111
		],
	};

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
	//if((i+j) % 2) this.sprite.tint = 0xAAAAAA;
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


BLOK.Tile = function(i,j, type) {
	this.type = (type == 'grass') ? 'grass' : 'rock';
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
	var textureName = null;
	if(this.type == 'grass') {
		var neighbours = this.getNeighboursFrom(worldCells);
		var textureName = this.getTextureNameFrom(neighbours);
		if(textureName === null) textureName = this.type;
	} else {
		textureName = this.type;
	}

	if(this.displayObject === null) {
		this.displayObject = new PIXI.Sprite.fromFrame(textureName);
		this.displayObject.x = this.x;
		this.displayObject.y = this.y;
		this.displayObject.i = this.i;
		this.displayObject.j = this.j;
	}
	return this.displayObject;
};

/**
 * Given a WorldCells object, return an array of this cell's neighbours
 * Clockwise from top-left
 */
BLOK.Tile.prototype.getNeighboursFrom = function(worldCells) {
	return [
		worldCells.getCell(this.i-1,this.j-1), // 0: top-left
		worldCells.getCell(this.i,this.j-1),   // 1: top
		worldCells.getCell(this.i+1,this.j-1), // 2: top-right
		worldCells.getCell(this.i+1,this.j),   // 3; right
		worldCells.getCell(this.i+1,this.j+1), // 4: bottom-right
		worldCells.getCell(this.i,this.j+1),   // 5: bottom
		worldCells.getCell(this.i-1,this.j), // 6: bottom-left
		worldCells.getCell(this.i-1,this.j),   // 7: left
	];
};

/**
 * Return the texture name, given an array of neighbours
 * @param  {[type]} neighbours [description]
 * @return {[type]}            [description]
 */
BLOK.Tile.prototype.getTextureNameFrom = function(neighbours) {
	var lookupIdx = 0;
	if(!neighbours[DIR_TOP] || neighbours[DIR_TOP].type == this.type) lookupIdx += 8;
	if(!neighbours[DIR_RIGHT] || neighbours[DIR_RIGHT].type == this.type) lookupIdx += 4;
	if(!neighbours[DIR_BOTTOM] || neighbours[DIR_BOTTOM].type == this.type) lookupIdx += 2;
	if(!neighbours[DIR_LEFT] || neighbours[DIR_LEFT].type == this.type) lookupIdx += 1;

	return tileLookup[this.type][lookupIdx]; 
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

	worldCells.allTiles = [];

	// Funciton to add a tile
	worldCells.addChild = function(tile) {
		var cellI = Math.floor(tile.i/CELL_SIZE);
		var cellJ = Math.floor(tile.j/CELL_SIZE);
		this[cellI][cellJ].addChild(tile);

		if(!this.allTiles[tile.i]) this.allTiles[tile.i] = [];
		this.allTiles[tile.i][tile.j] = tile;
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

	worldCells.getCell = function(i,j) {
		if(this.allTiles[i]) return this.allTiles[i][j];
		else return null;
	};

	worldCells.allByType = function(type) {
		var i,j,accumulator = [];
		for(i=0;i<this.allTiles.length;i++) {
			for(j=0;j<this.allTiles[i].length;j++) {
				if(this.allTiles[i][j].type == type) {
					accumulator.push(this.allTiles[i][j]);
				}
			}
		}
		return accumulator;
	};

	return worldCells;
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
worldLayer.targetScale = null;

stage.addChild(worldLayer);

// Initialize world cells: 2d array of CELL_SIZExCELL_SIZE cells
var worldCells = initCells(WORLD_W/CELL_SIZE, WORLD_H/CELL_SIZE);
var i,j,c;

// Initialize ground - scattering a few rocks
for(i=0;i<WORLD_W;i++) {
	for(j=0;j<WORLD_H;j++) {
		worldCells.addChild(new BLOK.Tile(i,j, Math.random()>0.95? 'rock':'grass'));
	}
}

growCellsInMap('rock',0.5);
//growCellsInMap('grass',0.3);
growCellsInMap('rock',0.3);

fixGrassCells();
fixGrassCells();
fixGrassCells();
fixGrassCells();
fixGrassCells();

function growCellsInMap(type, likelihood) {
	// Grow those rocks into bigger clusters
	var rocks = worldCells.allByType(type), neighbours;

	for(i=0;i<rocks.length;i++) {
		neighbours = rocks[i].getNeighboursFrom(worldCells);
		for(j=0;j<neighbours.length;j++) {
			if(neighbours[j] && neighbours[j].type != type && Math.random()<likelihood) neighbours[j].type = type;
		}
	}
}

function fixGrassCells(type, likelihood) {
	var grasses = worldCells.allByType('grass'), neighbours, dir;
	for(i=0;i<grasses.length;i++) {
		neighbours = grasses[i].getNeighboursFrom(worldCells);

		// Bad cell
		while(grasses[i].getTextureNameFrom(neighbours) === null) {
			// Choose DIR_TOP, DIR_RIGHT, DIR_BOTTOM, or DIR_LEFT
			dir = Math.floor(Math.random() * 4)*2+1;
			// Make it grass
			if(neighbours[dir]) neighbours[dir].type = 'grass';
		}
	}
}

var loader = new PIXI.AssetLoader([
	"img/animal-sprites.json",
	"img/grass-rock.json",
]);
loader.onComplete = function() {
	worldCells.render();
	loadCells(worldLayer, renderer);
};
loader.load();

// Animation loop
requestAnimFrame(animate);
function animate() {

	scaleAsNeeded();

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
	var scaleFactor = null;
	switch(e.keyCode) {
		// +
		case 187:
			if(worldLayer.targetScale !== null) {
				worldLayer.targetScale = worldLayer.targetScale * 2;
			} else {
				worldLayer.targetScale = worldLayer.scale.x * 2;
			}
			break;

		// -
		case 189:
			if(worldLayer.targetScale !== null) {
				worldLayer.targetScale = worldLayer.targetScale / 2;
			} else {
				worldLayer.targetScale = worldLayer.scale.x / 2;
			}
			break;

	}
};

function scaleAsNeeded() {
	if(worldLayer.targetScale !== null) {
		var newScale;

		if(worldLayer.scale.x < worldLayer.targetScale) {
			newScale = Math.min(worldLayer.targetScale, worldLayer.scale.x*1.05);
		} else {
			newScale = Math.max(worldLayer.targetScale, worldLayer.scale.x/1.05);
		}

		scaleFactor = newScale/worldLayer.scale.x;

		worldLayer.scale = new PIXI.Point(newScale, newScale);

		// Maintain the centre point. Adjustment is a derivation of
		// (w - 2x) / 2 * scale) == (w - 2(x-adj)) / (2 * scale * scaleFactor)
		worldLayer.x -= ((scaleFactor-1) * renderer.width/2) + (1-scaleFactor)*worldLayer.x;
		worldLayer.y -= ((scaleFactor-1) * renderer.height/2) + (1-scaleFactor)*worldLayer.y;

		loadCells(worldLayer, renderer);

		if(newScale == worldLayer.targetScale) worldLayer.targetScale = null;
	}
}
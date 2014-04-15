var WORLD_W = 128;
var WORLD_H = 128;

var BLOK = {};

/**
 * Implements an 8x8 grouping of tiles, use to speed up rendering
 * @param int i x-axis index of the cell
 * @param int j y-axis index of the cell
 */
BLOK.WorldCell = function(i,j) {
	this.container = new PIXI.DisplayObjectContainer();
	this.i = i;
	this.j = j;
};

/**
 * Add a child element (e.g. a tile) to this cell
 * @param PIXI.DisplayObject child
 */
BLOK.WorldCell.prototype.addChild = function(child) {
	this.container.addChild(child);
};

/**
 * Load this cell into a parent object, for rendering
 * @param PIXI.DisplayObjectContainer parent
 */
BLOK.WorldCell.prototype.addTo = function(parent) {
	this.container.i = this.i;
	this.container.j = this.j;
	parent.addChild(this.container);
};

/**
 * Returns true ift his WorldCell is already contained by the given parent
 * @param  PIXI.DisplayObjectContainer parent
 * @return Boolean
 */
BLOK.WorldCell.prototype.isContainedBy = function(parent) {
	return (parent.children.indexOf(this.container) != -1);
};

BLOK.WorldCell.prototype.constructor = BLOK.WorldCell;


/**
 * Initialise a w x h array of world cells.
 * The world elements are grouped into cells (each a PIXI.DisplayObjectContainer), which each
 * define an 8x8 area of the map. The cells are loaded to/from display memory (i.e., the worldLayer),
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
		var cellI = Math.floor(tile.i/8);
		var cellJ = Math.floor(tile.j/8);
		this[cellI][cellJ].addChild(tile);
	};

	return worldCells;
}

/**
 * Generate a single tile as a PIXI object
 * i,j: The location on the tile grid where this tile appears
 */
function tile(i, j) {
	var x = i*40+20;
	var y = j*40+20;
	var graphics = new PIXI.Graphics();
	graphics.beginFill(0x007700);
	graphics.drawRect(-18,-18,36,36);
	graphics.endFill();
	graphics.x = x;
	graphics.y = y;
	graphics.i = i;
	graphics.j = j;

	graphics.hitArea = new PIXI.Rectangle(-20, -20, 40, 40);
	graphics.interactive = true;
	graphics.buttonMode = true;

	graphics.click = function() {
		this.beginFill(0x0000FF);
		this.drawRect(-18,-18,36,36);
		this.endFill();
	};

	return graphics;
}

/**
 * Load the cells into the worldLayer that would currently be visible
 */
function loadCells(worldLayer, renderer) {
	var scale = worldLayer.scale.x; // assume x==y
	var x = -worldLayer.x / scale;
	var y = -worldLayer.y / scale;

	var minI = Math.max(0,Math.floor(x/40/8));
	var minJ = Math.max(0,Math.floor(y/40/8));
	var maxI = Math.min(WORLD_W/8-1, minI + Math.ceil((renderer.width/40)/scale/8));
	var maxJ = Math.min(WORLD_H/8-1, minJ + Math.ceil((renderer.height/40)/scale/8));

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
var scale = 1.0;
//worldLayer.scale = new PIXI.Point(0.25,0.25);

// Initialize world cells: 2d array of 8x8 cells
var worldCells = initCells(WORLD_W/8, WORLD_H/8);

// Initialize ground
for(var i=0;i<WORLD_W;i++) {
	for(var j=0;j<WORLD_H;j++) {
		worldCells.addChild(tile(i,j));
	}
}
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
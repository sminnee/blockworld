const WORLD_W = 128;
const WORLD_H = 128;

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
}

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

////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
			worldCells[i][j] = new PIXI.DisplayObjectContainer();
			worldCells[i][j].i = i;
			worldCells[i][j].j = j;
		}
	}

	// Funciton to add a tile
	worldCells.addChild = function(tile) {
		var cellI = Math.floor(tile.i/8);
		var cellJ = Math.floor(tile.j/8);
		this[cellI][cellJ].addChild(tile);
	}

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

	//console.log(graphics.getBounds());
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

	for(var i = worldLayer.children.length-1; i >= 0; i--) {
		var child = worldLayer.children[i];
		if(child.i < minI || child.i > maxI || child.j < minJ || child.j > maxJ) {
			worldLayer.removeChild(child);
		}
	}
	for(var i=minI;i<=maxI;i++) {
		for(var j=minJ;j<=maxJ;j++) {
			if(worldLayer.children.indexOf(worldCells[i][j]) == -1) {
				worldLayer.addChild(worldCells[i][j]);
			}
		}
	}

	worldLayer.cellsLoaded = cellsLoaded;
}

// Support for dragging
stage.mousedown = function() {
	var pos = this.getMousePosition();
	this.dragOffset = { x: pos.x-worldLayer.x,y:pos.y-worldLayer.y } ;
}
stage.mouseup = function() {
	this.dragOffset = null;
}
stage.mousemove = function() {
	if(this.dragOffset) {
		var point = this.getMousePosition();
		worldLayer.x = point.x - this.dragOffset.x;
		worldLayer.y = point.y - this.dragOffset.y;
		loadCells(worldLayer, renderer);
	}
}
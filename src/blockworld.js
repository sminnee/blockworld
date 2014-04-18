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

require.config({
    paths: {
    	"pixijs": "../bower_components/pixi.js/bin/pixi"
    }
});

require([
	"pixijs",
	"src/WorldGenerator.js",
	"src/ViewManager.js",
	"src/ViewRenderer.js",
	"src/Tile.js",
	"src/WorldCell.js",
	"src/Agent.js"
], function(PIXI, WorldGenerator, ViewManager, ViewRenderer, Tile, WorldCell, Agent) {

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

////////////////////////////////////////////////////////////////////////////////////////////////////////////


	/// Generate a random work
	var world = WorldGenerator.generate(WORLD_W, WORLD_H, 10000);

	// Create a renderer to display it
	var viewRenderer = new ViewRenderer();

	// Link a terrain layer to the world's tileset
	var terrainLayer = new PIXI.DisplayObjectContainer();
	viewRenderer.getWorldLayer().addChild(terrainLayer);
	viewRenderer.renderOnDemand(world.getTileset(), terrainLayer);

	// Create a view managaer to navigate the rendered world
	var viewManager = new ViewManager(viewRenderer, viewRenderer.getWorldLayer());

	var loader = new PIXI.AssetLoader([
		"img/animal-sprites.json",
		"img/grass-rock.json",
	]);

	loader.onComplete = function() {
		world.getTileset().render();

		world.agents.forEach(function(agent) {
			viewRenderer.getWorldLayer().addChild(agent.getSprite());
		});

		viewRenderer.viewportChanged();
	};

	loader.load();

	/**
	 * Initialise PIXI: renderer, stage, and worldLayer
	 */


	// Game loop
	requestAnimFrame(animate);
	function animate(time) {
		viewManager.tick();

		world.tick();

		viewRenderer.render();

	    requestAnimFrame(animate);
	}


});
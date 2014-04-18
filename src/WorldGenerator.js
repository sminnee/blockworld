define([
	"src/World.js",
	"src/CellularTileSet.js",
	"src/Tile.js",
	"src/Agent.js"
], function(World, CellularTileSet, Tile, Agent) {

	/**
	 * The WorldGenerator is responsible for generating the world.
	 * Once it has generated the initial state, it will return a world object and be done.
	 * 
	 * To use, call WorldGenerator.generate(w,h,numAgents), where w & h define the dimensions, in cells
	 */
	WorldGenerator = {
		generate: function(w,h,numAgents) {

			// Initialize world cells: 2d array of CELL_SIZExCELL_SIZE cells
			var tileset = new CellularTileSet(w, h, CELL_SIZE);
			var i,j,c;

			// Initialize ground - scattering a few rocks
			for(i=0;i<w;i++) {
				for(j=0;j<h;j++) {
					tileset.addChild(new Tile(i,j, Math.random()>0.95? 'rock':'grass'));
				}
			}

			growCellsInMap(tileset, 'rock',0.5);
			//growCellsInMap(tileset, 'grass',0.3);
			growCellsInMap(tileset, 'rock',0.3);

			fixGrassCells(tileset);
			fixGrassCells(tileset);
			fixGrassCells(tileset);
			fixGrassCells(tileset);
			fixGrassCells(tileset);

			var agents = [];

			var animals = ['dog','cat','chicken','sheep','cow','horse','wolf','butterfly'];

			for(i=0;i<numAgents;i++) {
				agents.push(new Agent(
					Math.floor(Math.random()*WORLD_W),
					Math.floor(Math.random()*WORLD_H),
					animals[Math.floor(Math.random()*animals.length)]
				));
			}

			return new World(tileset, agents);
		}
	};

	function growCellsInMap(tileset, type, likelihood) {
		// Grow those rocks into bigger clusters
		var rocks = tileset.allByType(type), neighbours;

		for(i=0;i<rocks.length;i++) {
			neighbours = rocks[i].getNeighboursFrom(tileset);
			for(j=0;j<neighbours.length;j++) {
				if(neighbours[j] && neighbours[j].type != type && Math.random()<likelihood) neighbours[j].type = type;
			}
		}
	}

	function fixGrassCells(tileset) {
		var grasses = tileset.allByType('grass'), neighbours, dir;
		for(i=0;i<grasses.length;i++) {
			neighbours = grasses[i].getNeighboursFrom(tileset);

			// Bad cell
			while(grasses[i].getTextureNameFrom(neighbours) === null) {
				// Choose DIR_TOP, DIR_RIGHT, DIR_BOTTOM, or DIR_LEFT
				dir = Math.floor(Math.random() * 4)*2+1;
				// Make it grass
				if(neighbours[dir]) neighbours[dir].type = 'grass';
			}
		}
	}

	return WorldGenerator;
});
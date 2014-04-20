/**
 * BlockWorld client script
 * A randomly generated world is hooked into a ViewRenderer, and a ViewManager is connected to allow interaction
 */

WORLD_W = 256;
WORLD_H = 256;

CELL_SIZE = 8;

// Directional constants used to look up results from getNeighboursFrom()
DIR_TL = 0;
DIR_TOP = 1;
DIR_TR = 2;
DIR_RIGHT = 3;
DIR_BR = 4;
DIR_BOTTOM = 5;
DIR_BL = 6;
DIR_LEFT = 7;

var World = require('../shared/World.js');
var WorldFetcher = require('./WorldFetcher.js');
var ViewManager = require('./ViewManager.js');
var ViewRenderer = require('./ViewRenderer.js');
var GameLoop = require('../shared/GameLoop.js');

/// Get the world
var world = new World(null, []);
var worldFetcher = new WorldFetcher();
worldFetcher.loadTilesetInto(world);

// Create a renderer to display it
var viewRenderer = new ViewRenderer();

// Create a view managaer to navigate the rendered world
var viewManager = new ViewManager(viewRenderer, viewRenderer.getWorldLayer());

var loader = new PIXI.AssetLoader([
  "img/animal-sprites.json",
  "img/grass-rock.json",
]);

loader.onComplete = function() {
  if(world.getTileset()) {
    world.getTileset().render(viewRenderer, 100);

    // Link a terrain layer to the world's tileset
    var terrainLayer = new PIXI.DisplayObjectContainer();
    viewRenderer.getWorldLayer().addChild(terrainLayer);
    viewRenderer.renderOnDemand(world.getTileset(), terrainLayer);


    world.agents.forEach(function(agent) {
      viewRenderer.getWorldLayer().addChild(agent.getSprite());
    });

    viewRenderer.viewportChanged();
  } else {
    setTimeout(loader.onComplete,500);
  }
};

loader.load();

var gameLoop = new GameLoop([
  [viewManager,'tick'],
  [world,'tickClient'],
  [viewRenderer,'tick']
]);

gameLoop.start();
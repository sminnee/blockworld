/**
 * BlockWorld client script
 * A randomly generated world is hooked into a ViewRenderer, and a ViewManager is connected to allow interaction
 */

WORLD_W = 256;
WORLD_H = 256;

TILE_SIZE = 20;
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
var AgentAPIAccessor = require('./AgentAPIAccessor.js');

// Create a renderer to display the world
var viewRenderer = new ViewRenderer();

/// Get the world
var world = new World();
var worldFetcher = new WorldFetcher(world, viewRenderer);
worldFetcher.loadWorld();

// When new agents appear in the world, introduce them to the renderer and the manager
world.on('addAgent', function(agent) {
  var sprite = agent.getSprite();
  viewRenderer.getWorldLayer().addChild(sprite);
  viewManager.registerAgentSprite(sprite, agent);
});

// Similarly, when they disappear, remove the sprite
world.on('removeAgent', function(agent) {
  var sprite = agent.getSprite();
  viewRenderer.getWorldLayer().removeChild(sprite);
  viewManager.registerAgentSprite(sprite, agent);
});

// Create a view managaer to navigate the rendered world
var viewManager = new ViewManager(viewRenderer, viewRenderer.getWorldLayer());

// Simple REST API interaction
viewManager.setCodeAPI(new AgentAPIAccessor);

var loader = new PIXI.AssetLoader([
  "img/animal-sprites.json",
  "img/grass-swamp.json"
  //"img/grass-rock.json",
]);

loader.onComplete = function() {
  if(world.getTileset()) {
    //world.getTileset().render(viewRenderer, 100);

    // Link a terrain layer to the world's tileset
    var terrainLayer = new PIXI.DisplayObjectContainer();
    viewRenderer.getWorldLayer().addChild(terrainLayer);
    viewRenderer.renderOnDemand(world.getTileset(), terrainLayer);

    viewRenderer.renderOnDemand(worldFetcher, null);

    world.agents.forEach(function(agent) {
      var sprite = agent.getSprite();
      viewRenderer.getWorldLayer().addChild(sprite);
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
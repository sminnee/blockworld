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

tileLookup = {
  grass: [
              //TRBL - 0=diff, 1=same
    null, //'grass',      //0000 - currently b0kred looking
    null, //'grass',      //0001 - currently b0kred looking
    null, //'grass',      //0010 - currently b0kred looking
    'grass-tr-rock',  //0011
    null, //'grass',      //0100 - currently b0kred looking
    null, //'rock-bottom-grass',//0101 - currently b0kred looking
    'grass-tl-rock',  //0110
    'rock-bottom-grass',//0111
    null, //'grass',      //1000 - currently b0kred looking
    'grass-br-rock',  //1001
    null, //'rock-left-grass',  //1010 - currently b0kred looking
    'rock-left-grass',  //1011
    'rock-tr-grass',  //1100
    'rock-top-grass', //1101
    'rock-right-grass', //1110
    'grass',      //1111
  ],
};

var WorldGenerator = require('../shared/WorldGenerator.js');
var ViewManager = require('./ViewManager.js');
var ViewRenderer = require('./ViewRenderer.js');
var GameLoop = require('../shared/GameLoop.js');

/// Generate a random world
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
  world.getTileset().render(viewRenderer, 100);

  world.agents.forEach(function(agent) {
    viewRenderer.getWorldLayer().addChild(agent.getSprite());
  });

  viewRenderer.viewportChanged();
};

loader.load();

console.log(requestAnimationFrame);
var gameLoop = new GameLoop(requestAnimationFrame, [
  viewManager,
  world,
  viewRenderer
]);

gameLoop.start();
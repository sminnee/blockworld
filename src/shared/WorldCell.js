var Tile = require('./Tile.js');

/**
 * Implements an 8x8 grouping of tiles, use to speed up rendering
 * @param int i x-axis index of the cell
 * @param int j y-axis index of the cell
 */
var WorldCell = function(i,j,cellSize) {
  this.tiles = [];
  this.container = null;
  this.cellSize = cellSize;
  this.renderer = null;
  this.sprite = null;
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

WorldCell.prototype.getSprite = function() {
  if(this.sprite === null) {
    this.sprite = new PIXI.Sprite(this.getRenderer());
    this.sprite.x = this.i*TILE_SIZE*this.cellSize;
    this.sprite.y = this.j*TILE_SIZE*this.cellSize;
  }
  return this.sprite;
}

WorldCell.prototype.getRenderer = function() {
  if(this.renderer === null) {
    this.renderer = new PIXI.RenderTexture(this.cellSize*TILE_SIZE, this.cellSize*TILE_SIZE);
  }
  return this.renderer;
}

/**
 * Add a child element (e.g. a tile) to this cell
 * @param PIXI.DisplayObject child
 */
WorldCell.prototype.addChild = function(child) {
  var offsetI = child.i - this.i*this.cellSize;
  var offsetJ = child.j - this.j*this.cellSize;
  
  child.setPosition(offsetI * TILE_SIZE, offsetJ * TILE_SIZE);
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
  this.getSprite().i = this.i;
  this.getSprite().j = this.j;
  parent.addChild(this.getSprite());
};

/**
 * Returns true ift his WorldCell is already contained by the given parent
 * @param  PIXI.DisplayObjectContainer parent
 * @return Boolean
 */
WorldCell.prototype.isContainedBy = function(parent) {
  return (parent.children.indexOf(this.getSprite()) != -1);
};

/**
 * Render source elements for this objet, ready to displa
 * @param ViewRenderer viewRenderer
 */
WorldCell.prototype.render = function(viewRenderer, priority) {
  if(this.rendered) return;

  var __worldCell = this;

  viewRenderer.renderQueue.add(function() {
    __worldCell.getRenderer().render(__worldCell.getContainer());
    __worldCell.rendered = true;
  }, priority,'render-worldcell-' + this.i + '-' + this.j);
};

/**
 * Return a JSON (non-string) representation of this cell, suitable for API transmission.
 */
WorldCell.prototype.toJSON = function() {
  var output = []
  var iOffset = this.i * this.cellSize;
  var jOffset = this.j * this.cellSize;
  this.tiles.forEach(function(tile) {
    if(!output[tile.i - iOffset]) output[tile.i - iOffset] = [];
    output[tile.i - iOffset][tile.j - jOffset] = tile.type;
  });
  return output;
};

/**
 * Add tiles to this cell from the given JSON representation of its content.
 */
WorldCell.prototype.addFromJSON = function(json, tileset) {
  var iOffset = this.i * this.cellSize;
  var jOffset = this.j * this.cellSize;

  var tile;
  for(var i=0;i<json.length;i++) {
    for(var j=0;j<json[i].length;j++) {
      tile = new Tile(i + iOffset, j + jOffset, json[i][j]);
      tileset.addChild(tile);
    }
  }
};

module.exports = WorldCell;
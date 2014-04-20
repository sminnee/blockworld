var WorldCell = require('./WorldCell.js');

/**
 * The CellularTileSet represents a large set of tiles that are rendered into 8x8 "cells".
 * The goal of this class is to be able to manage very large world sizes efficiently.
 */
CellularTileSet = function(w,h,cellSize) {
  if(!cellSize) cellSize = 8;

  this.w = w/cellSize;
  this.h = h/cellSize;
  this.cellSize = cellSize;

  this.worldCells = [];
  for(var i=0;i<this.w;i++) {
    this.worldCells[i] = [];
    for(var j=0;j<this.h;j++) {
      this.worldCells[i][j] = new WorldCell(i,j,cellSize);
    }
  }

  this.allTiles = [];
}

CellularTileSet.prototype.constructor = CellularTileSet;

/**
 * Add a tile to this tileset
 */
CellularTileSet.prototype.addChild = function(tile) {
  tile.setTileset(this);

  var cellI = Math.floor(tile.i/CELL_SIZE);
  var cellJ = Math.floor(tile.j/CELL_SIZE);
  this.worldCells[cellI][cellJ].addChild(tile);

  if(!this.allTiles[tile.i]) this.allTiles[tile.i] = [];
  this.allTiles[tile.i][tile.j] = tile;
};

/**
 * Render this tileset by rendering all its cells
 */
CellularTileSet.prototype.render = function(renderQueue, priority) {
  for(var i=0;i<this.worldCells.length;i++) {
    for(var j=0;j<this.worldCells[i].length;j++) {
      this.worldCells[i][j].render(renderQueue, priority);
    }
  }
};

/**
 * Load the cells into the terrainLayer that would currently be visible
 */
CellularTileSet.prototype.refreshParentContainer = function (viewRenderer, terrainLayer, minI, minJ, maxI, maxJ) {
  // Turn tile references into cell references
  minI = Math.min(this.w-1, Math.floor(minI / this.cellSize));
  minJ = Math.min(this.w-1, Math.floor(minJ / this.cellSize));
  maxI = Math.min(this.w-1, Math.ceil(maxI / this.cellSize));
  maxJ = Math.min(this.h-1, Math.ceil(maxJ / this.cellSize));

  var i,j,child;

  for(i = terrainLayer.children.length-1; i >= 0; i--) {
    child = terrainLayer.children[i];
    if(child.i < minI || child.i > maxI || child.j < minJ || child.j > maxJ) {
      terrainLayer.removeChild(child);
    }
  }

  // Priority 0 is anything on the screen at the moment. Clear out everything that *was* on the screen...
  viewRenderer.renderQueue.cancelByPriority(0);
  for(i=minI;i<=maxI;i++) {
    for(j=minJ;j<=maxJ;j++) {
      if(!this.worldCells[i][j].isContainedBy(terrainLayer)) {
        this.worldCells[i][j].addTo(terrainLayer);
      }
      // ...and add things that are on the screen now
      this.worldCells[i][j].render(viewRenderer, 0);
    }
  }

}

/**
 * Return a tile
 */
CellularTileSet.prototype.getCell = function(i,j) {
  if(this.allTiles[i]) return this.allTiles[i][j];
  else return null;
};

/**
 * Return all tiles of a particular type
 */
CellularTileSet.prototype.allByType = function(type) {
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

module.exports = CellularTileSet;
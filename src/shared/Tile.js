/**
 * Represents a single tile of the landscape
 * Tiles can be of two types: 'grass' or 'rock'
 * i,j are tile, rather than pixel, coordinates
 */
var Tile = function(i,j, type) {
  this.type = type;
  this.i = i;
  this.j = j;
  this.x = 0;
  this.y = 0;
  this.displayObject = null;
  this.tileset = null;
};

Tile.prototype.constructor = Tile;

var tileLookup = {
  grass : 'grass',
  swamp : [
                          //TRBL - 0=diff, 1=same
    null, //'grass',      //0000 - currently b0kred looking
    null, //'grass',      //0001 - currently b0kred looking
    null, //'grass',      //0010 - currently b0kred looking
    'swamp-tr-grass',      //0011
    null, //'grass',      //0100 - currently b0kred looking
    null, //'rock-bottom-grass',//0101 - currently b0kred looking
    'swamp-tl-grass',  //0110
    'swamp-top-grass',//0111
    null, //'grass',      //1000 - currently b0kred looking
    'swamp-br-grass',  //1001
    null, //'rock-left-grass',  //1010 - currently b0kred looking
    'swamp-right-grass',  //1011
    'swamp-bl-grass',  //1100
    'swamp-bottom-grass', //1101
    'swamp-left-grass', //1110
    [ 
      'swamp-tlconcave-grass', 'swamp-trconcave-grass', 'swamp-brconcave-grass', 'swamp-blconcave-grass', 'swamp'
    ]
  ]
};

Tile.prototype.setTileset = function(tileset) {
  this.tileset = tileset;
}

Tile.prototype.setPosition = function(x,y) {
  this.x = x;
  this.y = y;
  if(this.displayObject !== null) {
    this.displayObject.x = this.x;
    this.displayObject.x = this.y;
  }
};

Tile.prototype.getDisplayObject = function() {
  var textureName = null;
  if(typeof tileLookup[this.type] == 'string') {
    textureName = tileLookup[this.type];
  } else {
    var neighbours = this.getNeighboursFrom(this.tileset);
    var textureName = this.getTextureNameFrom(neighbours);
    if(textureName === null) textureName = this.type;
  }

  if(this.displayObject === null) {
    this.displayObject = textureName ? new PIXI.Sprite.fromFrame(textureName) : new PIXI.DisplayObject;
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
Tile.prototype.getNeighboursFrom = function(worldCells) {
  return [
    worldCells.getCell(this.i-1,this.j-1), // 0: top-left
    worldCells.getCell(this.i,this.j-1),   // 1: top
    worldCells.getCell(this.i+1,this.j-1), // 2: top-right
    worldCells.getCell(this.i+1,this.j),   // 3; right
    worldCells.getCell(this.i+1,this.j+1), // 4: bottom-right
    worldCells.getCell(this.i,this.j+1),   // 5: bottom
    worldCells.getCell(this.i-1,this.j+1), // 6: bottom-left
    worldCells.getCell(this.i-1,this.j),   // 7: left
  ];
};

/**
 * Return the texture name, given an array of neighbours
 * @param  {[type]} neighbours [description]
 * @return {[type]}            [description]
 */
Tile.prototype.getTextureNameFrom = function(neighbours) {
  var lookupIdx = 0;
  if(!neighbours[DIR_TOP] || neighbours[DIR_TOP].type == this.type) lookupIdx += 8;
  if(!neighbours[DIR_RIGHT] || neighbours[DIR_RIGHT].type == this.type) lookupIdx += 4;
  if(!neighbours[DIR_BOTTOM] || neighbours[DIR_BOTTOM].type == this.type) lookupIdx += 2;
  if(!neighbours[DIR_LEFT] || neighbours[DIR_LEFT].type == this.type) lookupIdx += 1;

  var result = tileLookup[this.type][lookupIdx];

  // Diagonals count - look for differences
  if(result !== null && typeof result != 'string') {
    if(neighbours[DIR_TL] && neighbours[DIR_TL].type != this.type) return result[0];
    else if(neighbours[DIR_TR] && neighbours[DIR_TR].type != this.type) return result[1];
    else if(neighbours[DIR_BR] && neighbours[DIR_BR].type != this.type) return result[2];
    else if(neighbours[DIR_BL] && neighbours[DIR_BL].type != this.type) return result[3];
    else return result[4];
  }

  return result;
};

/**
 * Return a JSON (non-string) representation of this cell, suitable for API transmission.
 */
Tile.prototype.toJSON = function() {
  return {
    'i': this.i,
    'j': this.j,
    'type': this.type
  };
}


module.exports = Tile;
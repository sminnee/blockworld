var World = require('./World.js');
var CellularTileSet = require('./CellularTileSet.js');
var Tile = require('./Tile.js');
var Agent = require('./Agent.js');

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

    var data = sumArrays([
      noiseArray(w,h,64,-1,1),
      noiseArray(w,h,32,-1,1),
      noiseArray(w,h,16,-1,1),
      noiseArray(w,h,8,-1,1),
      noiseArray(w,h,4,-1,1),
      noiseArray(w,h,2,-0.3,0.3),
      noiseArray(w,h,1,-0.3,0.3),
    ]);

    // Ensure rocks are in 2x2 blocks at the smallest
    for(i=1;i<w;i++) {
      for(j=1;j<h;j++) {
        if(data[i][j] >= 0.5) {
          data[i-1][j-1] = 0.5;
          data[i][j-1] = 0.5;
          data[i-1][j] = 0.5;
        }
      }
    }

    // Initialize ground - scattering a few rocks
    for(i=0;i<w;i++) {
      for(j=0;j<h;j++) {
        tileset.addChild(new Tile(i,j, data[i][j] >= 0.5 ? 'swamp':'grass'));
      }
    }

    world = new World(tileset);

    var animals = ['dog','cat','chicken','sheep','cow','horse','wolf','butterfly'];

     var agentI, agentJ;
    for(i=0;i<numAgents;i++) {
      agentI = agentJ = null;
      while(agentI === null || tileset.getCell(agentI,agentJ).type != 'grass') {
        agentI = Math.floor(Math.random()*WORLD_W);
        agentJ = Math.floor(Math.random()*WORLD_H);
      }

      world.addAgent(new Agent(agentI, agentJ,
        animals[Math.floor(Math.random()*animals.length)]
      ));
    }


    return world;
  }
};

/**
 * Sum up arrays of the same dimensions
 */
function sumArrays(arrays) {
  var i,j,output = [];

  arrays.forEach(function(array) {
    for(i=0;i<array.length;i++) {
      if(!output[i]) output[i] = []; 
      for(j=0;j<array[0].length;j++) {
        if(!output[i][j]) output[i][j] = 0;
        output[i][j] += array[i][j];
      }
    }
  });

  return output;
}

/**
 * Generate an array of noise
 * With wavelength > 1, the noise is smoothed
 */
function noiseArray(w, h, wavelength, min, max) {
  var i,j;

  // Generate purse noise
  if(wavelength > 1) {
    var noiseW = Math.ceil(w/wavelength)+1;
    var noiseH = Math.ceil(h/wavelength)+1;
  } else {
    var noiseW = w;
    var noiseH = h;
  }

  var sourceNoise = [];
  for(i=0;i<noiseW;i++) {
    sourceNoise[i] = [];
    for(j=0;j<noiseH;j++) {
      sourceNoise[i][j] = (Math.random() * (max-min)) + min;
    }
  }

  if(wavelength == 1) return sourceNoise;

  // Smooth the noise
  var output = [];
  var divI, divJ, sourceI, sourceJ, weightI, weightJ;
  for(i=0;i<w;i++) {
    // Lookup params - row
    divI = (i/wavelength);
    sourceI = Math.floor(divI);
    weightI = 1-(divI-sourceI);

    output[i] = [];
    for(j=0;j<h;j++) {
      // Lookup params - col
      divJ = (j/wavelength);
      sourceJ = Math.floor(divJ);
      weightJ = 1-(divJ-sourceJ);

      // Weighted average of 4 relevant noise points
      output[i][j] 
        = sourceNoise[sourceI][sourceJ]     * weightI     * weightJ
        + sourceNoise[sourceI+1][sourceJ]   * (1-weightI) * weightJ
        + sourceNoise[sourceI][sourceJ+1]   * weightI     * (1-weightJ)
        + sourceNoise[sourceI+1][sourceJ+1] * (1-weightI) * (1-weightJ);

    }
  }
  return output;
}

module.exports = WorldGenerator;
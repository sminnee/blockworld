////////////////////////////////////////////////////////////////////
// Argument processing

var args = require('optimist').argv;

var inputFile = args.in || args.i;
if(!inputFile) {
	console.log("Please use --in");
	return;
}

var outputFile = args.out || args.o || inputFile.replace('.input','.json');

// Edge cases where input filename doesn't end in ".input"
if(outputFile == inputFile) outputFile = inputFile + '.json';

////////////////////////////////////////////////////////////////////
// Input file processing

var fs = require('fs');

fs.readFile(inputFile, 'utf8', function (err, inputText) {
  if (err) throw err;

  var dataChunks = inputText.split(/\n\n+/);
  var metadata = JSON.parse(dataChunks.shift());

  if(metadata.size.match(/^([0-9]+)x([0-9]+)$/)) {
    var sizeX = parseInt(RegExp.$1);
    var sizeY = parseInt(RegExp.$2);

  } else {
    console.log("Bad size '" + size + "'.  please use (width)x(height) format.");
    return;
  }

  // Gap between sprites - optional
  var gapX = 0, gapY = 0;
  if(metadata.gap && metadata.gap.match(/^([0-9]+)x([0-9]+)$/)) {
    var gapX = parseInt(RegExp.$1);
    var gapY = parseInt(RegExp.$2);
  }

  // Starting point for the output
  var output = {
    "frames" : {

    },
    "meta" : {
      "app": "http://sminnee.github.io/blockworld/",
      "version": "1.0",
      "image": metadata.img,
      "format": "RGBA8888",
      "size": {"w": null, "h": null},
      "scale": "1"
    }
  }

  // Iterate over all sprite names, filling out the frames
  var cols,x=0,y=0,maxX=0;
  dataChunks.forEach(function(row) {
    x = 0;
    cols = row.replace(/(^[\s]+|[\s]+$)/g, '').split("\n");
    cols.forEach(function(frameName) {

      // Add a frame
      output.frames[frameName] = {
        "frame": {"x":x,"y":y,"w":sizeX,"h":sizeY},
        "rotated": false,
        "trimmed": false,
        "spriteSourceSize": {"x":0,"y":0,"w":sizeX,"h":sizeY},
        "sourceSize": {"w":sizeX,"h":sizeY}
      }

      x += sizeX + gapX;
    });
    if(maxX < x) maxX = x;

    y += sizeY+ gapY;
  });

  output.meta.size.w = maxX + sizeX;
  output.meta.size.h = y + sizeY;

  fs.writeFile(outputFile, JSON.stringify(output, null, 2), function(err) {
    if (err) throw err;

    console.log("Written spritesheet to " + outputFile);
  });

  console.log();
});


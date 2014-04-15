// create an new instance of a pixi stage
var stage = new PIXI.Stage(0x333333);

// create a renderer instance.
var renderer = PIXI.autoDetectRenderer(400, 300);

// add the renderer view element to the DOM
document.body.appendChild(renderer.view);

var graphics = new PIXI.Graphics();
graphics.beginFill(0x00FF00);
graphics.drawRect(-10,-10,20,20);
graphics.endFill();
graphics.x = 50;
graphics.y = 50;

stage.addChild(graphics);

requestAnimFrame( animate );

function animate() {
	graphics.x++;

//	var point = stage.getMousePosition();


    requestAnimFrame( animate );

    // render the stage   
    renderer.render(stage);
}
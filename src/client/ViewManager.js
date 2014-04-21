/**
 * The ViewManager is responsible for managing the user's interaction with the world.
 * It interacts with three components
 *  - stage: used to trap mouse events
 *  - worldLayer: manipulated to browse around the world
 *  - viewRenderer: used to get the viewport dimensions
 */
ViewManager = function(viewRenderer) {
  this.viewRenderer = viewRenderer;
  this.worldLayer = this.viewRenderer.getWorldLayer();

  this.stage = this.viewRenderer.getStage();

  var __viewManager = this;
  this.stage.mousedown = this.stage.touchstart = function(data) { __viewManager.stageMouseDown(data); }
  this.stage.mouseup = this.stage.touchend = function(data) { __viewManager.stageMouseUp(data); }
  this.stage.mousemove = this.stage.touchmove = function(data) { __viewManager.stageMouseMove(data); }

  window.addEventListener("keydown", function(e) { __viewManager.onkeydown(e); });
  this.targetScale = null;
}

ViewManager.prototype.constructor = ViewManager;


/**
 * Return the position of the click.
 * @param data The data passed to the PIXI event handler
 * @param id 0 for the first touch, 1 for the second
 */
function touchPosition(data, stage, id) {
  if(!id) id = 0;

  // Touch handler
  if(data.originalEvent.touches) {
    if(data.originalEvent.touches[id]) {
      return { 'x': data.originalEvent.touches[id].pageX, 'y': data.originalEvent.touches[id].pageY };
    }

  // Mouse handler
  } else {
    if(id == 0) return data.getLocalPosition(stage);
  }

  return null;
}


/**
 * Handlers for drag "slippy map" behaviour
 */
ViewManager.prototype.stageMouseDown = function(data) {
  data.originalEvent.preventDefault();

  var pos = touchPosition(data, this.stage);

  this.stage.dragOffset = { x: pos.x-this.worldLayer.x,y:pos.y-this.worldLayer.y } ;

  var secondPos = touchPosition(data, this.stage, 1);
  if(secondPos) {
    this.stage.pinchZoom = {
      'p1': pos,
      'p2': secondPos,
      'startView' : {
        'x' : this.worldLayer.x,
        'y' : this.worldLayer.y,
        'scale' : this.worldLayer.scale
      }
    };
  }

};

ViewManager.prototype.stageMouseUp = function(data) {
  data.originalEvent.preventDefault()
  this.stage.dragOffset = null;
  this.stage.pinchZoom = null;
};

ViewManager.prototype.stageMouseMove = function(data) {
  data.originalEvent.preventDefault()

  var pos = touchPosition(data, this.stage);
  var secondPos = touchPosition(data, this.stage, 1);

  // Two pointer pinch/zoom/translate - kind of tricky
  if(this.stage.pinchZoom && secondPos) {
    var a1 = this.stage.pinchZoom.p1;
    var b1 = this.stage.pinchZoom.p2;
    var a2 = pos;
    var b2 = secondPos;
    var orig = this.stage.pinchZoom.startView;

    // Weight the two inputs by the starting distance between fingers on that axis
    var weightX = Math.abs(b1.x - a1.x);
    var weightY = Math.abs(b1.y - a1.y);
    // Little division/0 prevention
    var scaleFactorX = weightX ? (b2.x - a2.x) / (b1.x - a1.x) : 0;
    var scaleFactorY = weightY ? (b2.y - a2.y) / (b1.y - a1.y) : 0;
    // Weighted average
    var scaleFactor = (scaleFactorX * weightX + scaleFactorY * weightY) / (weightX + weightY);

    var newScale = scaleFactor * orig.scale.x;

    // Minimum level of zoom-out prevents crashes
    if(newScale < 0.25) {
      newScale = 0.25;
      scaleFactor = newScale/orig.scale.x;
    }

    this.worldLayer.scale = new PIXI.Point(newScale, newScale);

    // This (and the scale factor stuff) was derived from simulatenous equations
    // (-x + b1.x) / scale == -(x-adj) + b2.x / (scale * factor)
    // (-x + a1.x) / scale == -(x-adj) + a2.x / (scale * factor)
    this.worldLayer.x = orig.x - (scaleFactor * b1.x - b2.x + (1 - scaleFactor) *  orig.x);
    this.worldLayer.y = orig.y - (scaleFactor * b1.y - b2.y + (1 - scaleFactor) *  orig.y);
  
    this.viewRenderer.viewportChanged();

  // Single pointer translation - much simpler!
  } else if(this.stage.dragOffset) {
    this.worldLayer.x = pos.x - this.stage.dragOffset.x;
    this.worldLayer.y = pos.y - this.stage.dragOffset.y;

    this.viewRenderer.viewportChanged();
  }

};

/**
 * KeyDown handler for view
 */
ViewManager.prototype.onkeydown = function(e) {
  switch(e.keyCode) {
  // +
  case 187:
    if(this.targetScale !== null) {
      this.targetScale = this.targetScale * 2;
    } else {
      this.targetScale = this.worldLayer.scale.x * 2;
    }
    break;

  // -
  case 189:
    if(this.targetScale !== null) {
      this.targetScale = this.targetScale / 2;
    } else {
      this.targetScale = this.worldLayer.scale.x / 2;
    }
    break;

  }
};

/**
 * Clock tick - handles scaling animation
 */
ViewManager.prototype.tick = function(time) {
  if(this.targetScale !== null) this.scaleTick();
}

/**
 * Rescale the given layer, preserving the location of a given point.
 * 
 * @param DisplayObject worldLayer The layer to update
 * @param DisplayObject orig The starting point to preserve. Must contain .x, .y, and .scale.x
 * @param int newScale The new scale
 * @param PIXI.Point centre The centre point to preserve. Must contain .x and .y
 */
function rescaleLayer(worldLayer, orig, centre, newScale) {
  var scaleFactor = newScale/orig.scale.x;

  worldLayer.scale = new PIXI.Point(newScale, newScale);

  // Maintain the centre point. Adjustment is a derivation of
  // (-x + centre.x) / scale) == (-(x-adj) + centre.x) / (scale * scaleFactor)
  worldLayer.x = orig.x - (((scaleFactor-1) * centre.x) + (1-scaleFactor)*orig.x);
  worldLayer.y = orig.y - (((scaleFactor-1) * centre.y) + (1-scaleFactor)*orig.y);
}

/**
 * Adjust the scaling by a clock-tick increment
  */
ViewManager.prototype.scaleTick = function() {
  var newScale;

  if(this.worldLayer.scale.x < this.targetScale) {
    newScale = Math.min(this.targetScale, this.worldLayer.scale.x*1.05);
  } else {
    newScale = Math.max(this.targetScale, this.worldLayer.scale.x/1.05);
  }

  var windowCentre = {x: this.viewRenderer.getWidth()/2, y: this.viewRenderer.getHeight()/2};
  rescaleLayer(this.worldLayer, this.worldLayer, windowCentre, newScale);

  if(newScale == this.targetScale) this.targetScale = null;

  this.viewRenderer.viewportChanged();
}

module.exports = ViewManager;
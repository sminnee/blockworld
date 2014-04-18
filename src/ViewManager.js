define([
	"pixijs",
	"src/Animation.js"
], function(PIXI, Animation) {

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
		this.stage.mousedown = function() { __viewManager.stageMouseDown(); }
		this.stage.mouseup = function() { __viewManager.stageMouseUp(); }
		this.stage.mousemove = function() { __viewManager.stageMouseMove(); }

		window.addEventListener("keydown", function(e) { __viewManager.onkeydown(e); });
		this.targetScale = null;
	}

	ViewManager.prototype.constructor = ViewManager;

	/**
	 * Handlers for drag "slippy map" behaviour
	 */
	ViewManager.prototype.stageMouseDown = function() {
		var pos = this.stage.getMousePosition();
		this.stage.dragOffset = { x: pos.x-this.worldLayer.x,y:pos.y-this.worldLayer.y } ;
	};

	ViewManager.prototype.stageMouseUp = function() {
		this.stage.dragOffset = null;
	};

	ViewManager.prototype.stageMouseMove = function() {
		if(this.stage.dragOffset) {
			var point = this.stage.getMousePosition();
			this.worldLayer.x = point.x - this.stage.dragOffset.x;
			this.worldLayer.y = point.y - this.stage.dragOffset.y;

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
	 * Adjust the scaling by a clock-tick increment
	  */
	ViewManager.prototype.scaleTick = function() {
		var newScale;

		if(this.worldLayer.scale.x < this.targetScale) {
			newScale = Math.min(this.targetScale, this.worldLayer.scale.x*1.05);
		} else {
			newScale = Math.max(this.targetScale, this.worldLayer.scale.x/1.05);
		}

		var scaleFactor = newScale/this.worldLayer.scale.x;

		this.worldLayer.scale = new PIXI.Point(newScale, newScale);

		// Maintain the centre point. Adjustment is a derivation of
		// (w - 2x) / 2 * scale) == (w - 2(x-adj)) / (2 * scale * scaleFactor)
		this.worldLayer.x -= ((scaleFactor-1) * this.viewRenderer.getWidth()/2) + (1-scaleFactor)*this.worldLayer.x;
		this.worldLayer.y -= ((scaleFactor-1) * this.viewRenderer.getHeight()/2) + (1-scaleFactor)*this.worldLayer.y;

		if(newScale == this.targetScale) this.targetScale = null;

		this.viewRenderer.viewportChanged();
	}

	return ViewManager;
});
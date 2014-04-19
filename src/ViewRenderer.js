define([
	"pixijs",
	"js/JobQueue.js"
], function(PIXI, JobQueue) {

	/**
	 * The ViewRenderer is responsible looking after PIXI rendering.
	 * It will ensure that off-screen content uses a minimum amount of memory.
	 */
	ViewRenderer = function() {
		// create an new instance of a pixi stage
		this.stage = new PIXI.Stage(0x333333);

		// create a world layer
		this.worldLayer = new PIXI.DisplayObjectContainer();
		this.stage.addChild(this.worldLayer);

		this.viewportRange = null;

		// A list of items that will have refreshParentContainer() called on them whenever the viewport changes
		this.renderOnDemandList = [];

		// create a renderer instance.
		this.renderer = PIXI.autoDetectRenderer(window.innerWidth,window.innerHeight);
		document.body.appendChild(this.renderer.view);

		// create a queue for managing slow jobs (e.g. cell rendering)
		this.renderQueue = new JobQueue;

		var __viewRenderer = this;
		window.addEventListener('resize', function() { __viewRenderer.resizeRenderer(window); } );
	}

	ViewRenderer.prototype.constructor = ViewRenderer;

	ViewRenderer.prototype.render = function() {
		if(this.renderer) this.renderer.render(this.stage);   
	}

	ViewRenderer.prototype.getWorldLayer = function() {
		return this.worldLayer;
	}
	ViewRenderer.prototype.getStage = function() {
		return this.stage;
	}


	/**
	 * Add an item to be rendered on demand.
	 * As the viewport shifts, the following function will be called:
	 *   item.refreshParentContainer(viewRenderer, target, minI, minJ, maxI, maxJ)
	 * I and J refer to 40x40 tileset cells
	 */
	ViewRenderer.prototype.renderOnDemand = function(item, target) {
		this.renderOnDemandList.push({ item: item, target: target });
	}

	/**
	 * Resize the renderer to fill the dimensions of the given window
	 */
	ViewRenderer.prototype.resizeRenderer = function(window) {
		this.renderer.resize(window.innerWidth,window.innerHeight);
		this.viewportChanged();
	};

	/**
	 * Viewport width
	 */
	ViewRenderer.prototype.getWidth = function() {
		return this.renderer.width;
	}

	/**
	 * Viewport height
	 */
	ViewRenderer.prototype.getHeight = function() {
		return this.renderer.height;
	}

	/**
	 * Called by ViewManager whenever the viewport has been chagned.
	 * Changes to the viewport are done by manipulating the worldLayer
	 */
	ViewRenderer.prototype.viewportChanged = function() {
		var scale = this.worldLayer.scale.x; // assume x==y

		// Get the min/max dimensions of items to show
		var minX = -this.worldLayer.x / scale;
		var minY = -this.worldLayer.y / scale;
		var maxX = minX + this.renderer.width / scale;
		var maxY = minY + this.renderer.height / scale;

		// Turn these into tileset cell coordinates: i,j
		var minI = Math.max(0,Math.floor(minX/40));
		var minJ = Math.max(0,Math.floor(minY/40));
		var maxI = Math.floor(maxX/40);
		var maxJ = Math.floor(maxY/40);

		// Don't bother triggering if the viewport range hasn't actually moved
		var viewportRange = minI+','+minJ+','+maxI+','+maxJ;
		if(this.viewportRange == viewportRange) return;

		// Refresh the contents of load-on-demand sets (map tileset, agents, etc)
		// This is the core of ensuring that only necessary content is on-screen
		var __viewRenderer = this;
		this.renderOnDemandList.forEach(function(entry) {
			entry.item.refreshParentContainer(__viewRenderer, entry.target, minI, minJ, maxI, maxJ);
		});

		this.viewportRange = viewportRange;
	}

	return ViewRenderer;
});
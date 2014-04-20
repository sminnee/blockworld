var $ = require('jquery');
var io = require('socket.io-browserify');

var CellularTileSet = require('../shared/CellularTileSet.js');
var Agent = require('../shared/Agent.js');


/**
 * The WorldFetcher is responsible for fetching the World from the server.
 * It maintains a websocket with the server, to receive events in real time
 */
var WorldFetcher = function(world, viewRenderer) {
	this.world = world;
	this.viewRenderer = viewRenderer;
	// Always connect direct to Node for websockets. I haven't been able to figure out how to get Nginx properly proxying
	// the websockets yet :-(
	this.socket = io.connect('ws://' + location.hostname + ':3000');

	__worldFetcher = this;

	this.socket.on('worldChanges', function (data) {
		__worldFetcher.processWorldChanges(data);
	});
}
WorldFetcher.prototype.constructor = WorldFetcher;

/**
 * Load the tileset into the given world objedct
 */
WorldFetcher.prototype.loadWorld = function() {
	__world = this.world;
	$.getJSON('/api/tiles', function(data) {
		__world.setTileset(CellularTileSet.fromJSON(data));
	})
};

WorldFetcher.prototype.refreshParentContainer = function(viewRenderer, dummy, minI, minJ, maxI, maxJ) {
	this.socket.emit('setViewport', {
		'minI': minI,
		'minJ': minJ,
		'maxI': maxI,
		'maxJ': maxJ
	});
};

/**
 * Process world changes being send through from the server
 */
WorldFetcher.prototype.processWorldChanges = function(changes) {
	var __agents = this.world.getAgents();
	var __viewRenderer = this.viewRenderer;

	changes.forEach(function(change) {
		switch(change.type) {
		case 'agentUpdate':
			// Update
			if(__agents[change.agent.identifier]) {
				__agents[change.agent.identifier].updateFromJSON(change.agent);

			// Create
			} else {
				__agents[change.agent.identifier] = Agent.fromJSON(change.agent);
				__viewRenderer.getWorldLayer().addChild(__agents[change.agent.identifier].getSprite());
			}
			break;
		}
	});
}

module.exports = WorldFetcher;
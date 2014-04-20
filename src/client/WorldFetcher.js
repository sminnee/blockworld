var $ = require('jquery');
var io = require('socket.io-browserify');

var CellularTileSet = require('../shared/CellularTileSet.js');
var Agent = require('../shared/Agent.js');


/**
 * The WorldFetcher is responsible for fetching the World from the server.
 * It maintains a websocket with the server, to receive events in real time
 */
var WorldFetcher = function(world) {
	this.world = world;
	this.socket = io.connect('http://localhost:3000');

	__worldFetcher = this;

	this.socket.on('worldChanges', function (data) {
		__worldFetcher.processWorldChanges(data);
		console.log('worldChanges');
		console.log(data);
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
	$.getJSON('/api/agents', function(data) {
		var agents = {};
		agents.forEach = function(callback) {
			for(var i in this) {
				if(i == 'forEach') continue;
				callback(this[i]);
			}
		}
		agents.forEach.enumerable = false;
		data.forEach(function(element) {
			var agent = Agent.fromJSON(element);
			agents[agent.identifier] = agent;
		});
		__world.setAgents(agents);
	});
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
	__agents = this.world.getAgents();
	changes.forEach(function(change) {
		switch(change.type) {
		case 'agentUpdate':
			console.log('updating',change.agent);
			__agents[change.agent.identifier].updateFromJSON(change.agent);
			break;
		}
	});
}

module.exports = WorldFetcher;
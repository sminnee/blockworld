var $ = require('jquery');
var io = require('socket.io-client');

var CellularTileSet = require('../shared/CellularTileSet.js');
var Agent = require('../shared/Agent.js');


/**
 * The WorldFetcher is responsible for fetching the World from the server.
 * It maintains a websocket with the server, to receive events in real time
 */
var WorldFetcher = function(world, viewRenderer) {
	this.world = world;
	this.viewRenderer = viewRenderer;

	// Works on any port, HTTP or HTTPS. http->ws; https->wss
	this.socket = io.connect(location.protocol.replace('http','ws') + '//' + location.hostname + ':' + location.port);

	__worldFetcher = this;

	this.socket.on('worldChanged', function (data) {
		__worldFetcher.processWorldChanges(data);
	});

	// This will store the calculated timing offset
	this.timeOffset = 0;

	// Private arrays to store in-progress timing offset data
	var timeOffsets = [];

	this.socket.on('pong', function (data) {
		data.end = (new Date()).getTime();
		data.delay = (data.end - data.start)/2;

		// Calculate the time offset; add to server times before comparing to client times
		data.timeOffset = data.start + data.delay - data.server;
		timeOffsets.push(data.timeOffset);

		// Use the average last 5 values to set this.timeOffset. This is a magic number derived from watching
		// the prod server.  Analysing the std dev of the data would be a better approach.
		if(timeOffsets.length > 5) {
			var i,sum=0;
			for(i=1;i<=5;i++) {
				sum += timeOffsets[timeOffsets.length-i];
			}
			__worldFetcher.timeOffset = sum/5;
		}

		console.log(timeOffsets);
		console.log(__worldFetcher.timeOffset);
	});

	// Repeated ping handler; uses setTimeout() to delay subsequent pings
	var ping = function(socket, count) {
		socket.emit('ping', { 'start': (new Date()).getTime() });
		if(count > 1) setTimeout(function() { ping(socket, count-1); }, 1000);
	}

	// Run 5 pings and get the average
	ping(this.socket, 10);
}

WorldFetcher.prototype.constructor = WorldFetcher;

/**
 * Load the tileset into the given world objedct
 */
WorldFetcher.prototype.loadWorld = function() {
	__world = this.world;
	//this.world.setTileset(new CellularTileSet(256,256,8))
	$.getJSON('/api/tiles', function(data) {
		__world.setTileset(CellularTileSet.fromJSON(data));
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
	var __agents = this.world.getAgents();
	var __viewRenderer = this.viewRenderer;
	var __world = this.world;
	var __worldFetcher = this;

	var timestamp = changes.timestamp;

	changes.changes.forEach(function(change) {
		var agent;

		switch(change.type) {
		// List the visible agents by their identifiers; delete the rest
		case 'setVisibleAgents':
			__agents.forEach(function(agent) {
				if(change.identifiers.indexOf(agent.identifier) == -1) {
					__world.removeAgent(agent.identifier);
				}
			});
			break;

		// Update or create an agent
		case 'agentUpdate':
			// Update
			if(agent = __agents[change.agent.identifier]) {
				if(!agent.lastServerUpdate || agent.lastServerUpdate < timestamp) {
					//console.log(agent.identifier, timestamp, (new Date()).getTime() - timestamp);
					agent.updateFromJSON(change.agent);
					agent.lastServerUpdate = timestamp;
				} else {
					console.log('stale', agent.identifier, timestamp)
				}

			// Create
			} else {
				__world.addAgent(Agent.fromJSON(change.agent));
			}
			break;
		}
	});
}

module.exports = WorldFetcher;
var $ = require('jquery');
var CellularTileSet = require('../shared/CellularTileSet.js');
var Agent = require('../shared/Agent.js');

/**
 * The WorldFetcher is responsible for fetching the World from the server
 */
var WorldFetcher = function() {

}
WorldFetcher.prototype.constructor = WorldFetcher;

/**
 * Load the tileset into the given world objedct
 */
WorldFetcher.prototype.loadTilesetInto = function(world) {
	$.getJSON('/api/tiles', function(data) {
		world.setTileset(CellularTileSet.fromJSON(data));
	})
	$.getJSON('/api/agents', function(data) {
		var agents = [];
		data.forEach(function(element) {
			agents.push(Agent.fromJSON(element));
		});
		world.setAgents(agents);
	});
}

module.exports = WorldFetcher;
define([
], function() {

	/**
	 * The World object contains all terrain and agents that make up the world.
	 * The world can exist without any user interaction or display.
	 */
	World = function(tileset, agents) {
		this.tileset = tileset;
		this.agents = agents;

	}
	World.prototype.constructor = World;

	World.prototype.getTileset = function() {
		return this.tileset;
	}

	World.prototype.tick = function(time) {
		this.agents.forEach(function(agent) {
			agent.tick(time);
		});
	}

	return World;
});

/**
 * The World object contains all terrain and agents that make up the world.
 * The world can exist without any user interaction or display.
 */
World = function(tileset, agents) {
  this.tileset = tileset;
  this.agents = agents;

}
World.prototype.constructor = World;

World.prototype.setTileset = function(tileset) {
  this.tileset = tileset;
}
World.prototype.getTileset = function() {
  return this.tileset;
}

World.prototype.getAgents = function() {
  return this.agents;
}
World.prototype.setAgents = function(agents) {
  this.agents = agents;
}

World.prototype.tickClient = function(time) {
  this.agents.forEach(function(agent) {
    agent.tickClient(time);
  });
}

World.prototype.tickServer = function(time) {
  this.agents.forEach(function(agent) {
    agent.tickServer(time);
  });
}

module.exports = World;
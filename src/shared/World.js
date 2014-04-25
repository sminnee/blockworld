var EventEmitter = require('events').EventEmitter;

/**
 * The World object contains all terrain and agents that make up the world.
 * The world can exist without any user interaction or display.
 * 
 * Emits: agentsUpdate, addAgent
 */
World = function(tileset, agents) {
 if(!agents) {
    agents = {};
    agents.forEach = function(callback) {
      for(var i in this) {
        if(i == 'forEach') continue;
        callback(this[i]);
      }
    }
    agents.forEach.enumerable = false;
  }
 
  this.tileset = tileset;
  this.agents = agents;
  this.heartbeatCounter = 0;
}

World.prototype = Object.create(EventEmitter.prototype);
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
World.prototype.addAgent = function(agent) {
  this.agents[agent.identifier] = agent;

  this.emit('addAgent', agent);
  this.emit('agentsUpdate', [agent]);
}
World.prototype.getAgentByID = function(identifier) {
  return this.agents[identifier];
}

var lastTick = null;

World.prototype.tickClient = function(time) {
  var thisTick = new Date().getTime();

  var ticks = 1;
  if(lastTick !== null) {
    ticks = (thisTick-lastTick)/25;
  }

  this.agents.forEach(function(agent) {
    agent.tickClient(ticks);
  });

  lastTick = thisTick;

}

World.prototype.tickServer = function(time) {
  var changedAgents = [];

  var __world = this;

  // Refresh all clients every 40 ticks - every 1 second
  this.heartbeatCounter = (this.heartbeatCounter + 1) % 40;

  // Tick all Agents
  this.agents.forEach(function(agent) {
    if(agent.tickServer(time, __world) || (__world.heartbeatCounter == 0)) {
      changedAgents.push(agent);
    }
  });

  this.emit('agentsUpdate', changedAgents);
}

module.exports = World;
var EventEmitter = require('events').EventEmitter;

/**
 * The WorldWatcher will watch for changes within a particular viewport of the world.
 * and send worldchange data back by emitting worldChanged events.  When hooked up to
 * a websocket, this provides the client with data about the world.
 *
 * Emits: worldChanged
 */
WorldWatcher = function(world) {
  self = this;

  this.minI = null;
  this.minJ = null;
  this.maxI = null;
  this.maxJ = null;

  this.world = world;

  world.on('agentsUpdate', this.processAgents.bind(this));
}
//  this.watchers[watcherID].visibleAgents = this.visibleAgentsFor(this.watchers[watcherID]);

WorldWatcher.prototype = Object.create(EventEmitter.prototype);
WorldWatcher.prototype.constructor = WorldWatcher;

/**
 * Given a list of world-wide agents, pass the ones within this watcher's viewport
 * through as a worldChanged event
 */
WorldWatcher.prototype.processAgents = function(changedAgents) {
  // The viewport hasn't been configured yet; do nothing
  if(this.minI == null) return;

  var watcherChanges = [];

  changedAgents.forEach(function(agent) {
    if(agent.isWithinTileRect(this.minI, this.minJ, this.maxI, this.maxJ)) {
      watcherChanges.push({
        'type': 'agentUpdate',
        'agent': agent.toJSON()
      });
    }
  }.bind(this));

  if(watcherChanges.length) {
    console.log('worldChanged');
    this.emit('worldChanged', {
      'timestamp': (new Date()).getTime(),
      'changes': watcherChanges
    });
  }    
}

/**
 * Refresh a watcher, resending all agent data to it
 */
World.prototype.refreshWatcher = function(watcherID) {
  this.processAgents(this.world.getAgetnts());
}

/**
 * Set the region of the world for which this watcher will send updates - its "viewport"
 */
WorldWatcher.prototype.setViewport = function(minI, minJ, maxI, maxJ) {
  this.minI = minI;
  this.minJ = minJ;
  this.maxI = maxI;
  this.maxJ = maxJ;
}

/**
 * Return an array of identifiers of the agents within the viewport
 */
WorldWatcher.visibleAgents = function() {
  visibleAgents = [];

  this.world.getAgents().forEach(function(agent) {
    if(agent.isWithinTileRect(this.minI, this.minJ, this.maxI, this.maxJ)) {
      visibleAgents.push(agent.identifier);
    }
  }.bind(this));

  return visibleAgents;
}


module.exports = WorldWatcher;
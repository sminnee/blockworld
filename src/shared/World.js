/**
 * The World object contains all terrain and agents that make up the world.
 * The world can exist without any user interaction or display.
 */
World = function(tileset, agents) {
  this.tileset = tileset;
  this.agents = agents;
  this.watchers = {};
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
    agent.tickClient(time, this);
  });
}

World.prototype.tickServer = function(time) {
  var changedAgents = [];

  // Tick all Agents
  this.agents.forEach(function(agent) {
    if(agent.tickServer(time, this)) {
      changedAgents.push(agent);
    }
  });

  // Pass information to watchers
  var watcherChanges, watcher, watcherID;
  for(watcherID in this.watchers) {
    watcherChanges = [];
    watcher = this.watchers[watcherID];

    changedAgents.forEach(function(agent) {
      if(watcher.visibleAgents.indexOf(agent.identifier) != -1) {
        watcherChanges.push({
          'type': 'agentUpdate',
          'agent': agent.toJSON()
        });
      }
    })

    if(watcherChanges.length) {
      watcher.callback(watcherChanges);
    } 
  }
}


/**
 * Add a watcher to this world
 * Watchers will receive events that occur within the given grid of tiles
 * @return watcherID A code to pass back to removeWatcher()
 */
World.prototype.addWatcher = function(minI, minJ, maxI, maxJ, callback) {
  var watcherID = 'watcher-' + Math.floor(Math.random()*1000000000);
  this.watchers[watcherID] = {
    'minI': minI,
    'minJ': minJ,
    'maxI': maxI,
    'maxJ': maxJ,
    'callback': callback
  };

  this.watchers[watcherID].visibleAgents = this.visibleAgentsFor(this.watchers[watcherID]);
  console.log('Watching',this.watchers[watcherID].visibleAgents.length);

  return watcherID;
}

/**
 * Remo
 * Watchers will receive events that occur within the given grid of tiles
 */
World.prototype.removeWatcher = function(watcherID) {
  delete this.watchers[watcherID];
}

/**
 * Set visible agents in a watcher
 */
World.prototype.visibleAgentsFor = function(watcher) {
  visibleAgents = [];

  this.agents.forEach(function(agent) {
    if(agent.isWithinTileRect(watcher.minI, watcher.minJ, watcher.maxI, watcher.maxJ)) {
      visibleAgents.push(agent.identifier);
    }
  });

  return visibleAgents;
}

module.exports = World;
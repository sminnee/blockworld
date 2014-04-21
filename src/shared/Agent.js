// TODO: drop this dependency
var Animation = require('../client/Animation.js');

function animationsFor(animal) {
  return {
    'walk-right': [
      [animal + '-right-1',3],
      [animal + '-right-2',3],
      [animal + '-right-3',3],
      [animal + '-right-2',3]
    ],
    'walk-left': [
      [animal + '-left-1',3],
      [animal + '-left-2',3],
      [animal + '-left-3',3],
      [animal + '-left-2',3]
    ],
    'walk-up': [
      [animal + '-up-1',3],
      [animal + '-up-2',3],
      [animal + '-up-3',3],
      [animal + '-up-2',3]
    ],
    'walk-down': [
      [animal + '-down-1',3],
      [animal + '-down-2',3],
      [animal + '-down-3',3],
      [animal + '-down-2',3]
    ]
  };
}

/** 
 * The agent class represents a single agent in the world
 * Agents are dynamic: they can change themselves and their environment
 */
var Agent = function(i,j,animal) {
  this.i = i;
  this.j = j;
  this.x = i*TILE_SIZE;
  this.y = j*TILE_SIZE;
  this.dX = 0;
  this.dY = 0;
  this.animationSet = animationsFor(animal);
  this.animation = new Animation(this.animationSet['walk-right']);
  this.identifier = 'agent-' + Math.floor(Math.random() * 1000000000);
  this.sprite = null;
}

Agent.prototype.constructor = Agent;

Agent.prototype.sprite = null;

Agent.prototype.getSprite = function() {
  if(this.sprite === null) {
    this.sprite = this.animation.getSprite();
    this.sprite.x = this.x;
    this.sprite.y = this.y;
  }
  return this.sprite;
};

Agent.prototype.tickClient = function(ticks) {
  this.move(this.dX*ticks,this.dY*ticks);
  this.animation.tick(ticks);
}

/**
 * Frame-tick for the Agent.
 * @return true if a change that needs to be sent to clients happens
 */
Agent.prototype.tickServer = function(time, world) {
  this.move(this.dX,this.dY);

  if(Math.random() > 0.99) {
    this.setDirection(Math.floor(Math.random()*4)*2+1);
    return true;
  }

  return false;
};

/**
 * Returns true if this agent lies within the given tile rectangle
 */
Agent.prototype.isWithinTileRect = function(minI, minJ, maxI, maxJ) {
  return this.i >= minI && this.i <= maxI && this.j >= minJ && this.j <= maxJ;
};

Agent.prototype.move = function(x,y) {
  this.x += x;
  this.y += y;

  this.i = Math.floor(this.x/TILE_SIZE);
  this.j = Math.floor(this.y/TILE_SIZE);

  if(this.sprite !== null) {
    this.sprite.x = this.x;
    this.sprite.y = this.y;
  }
}

Agent.prototype.setDirection = function(dir) {
  switch(dir) {
  case DIR_TOP:
    this.animation = new Animation(this.animationSet['walk-up'], this.sprite);
    this.dX = 0;
    this.dY = -1;
    break;

  case DIR_BOTTOM:
    this.animation = new Animation(this.animationSet['walk-down'], this.sprite);
    this.dX = 0;
    this.dY = 1;
    break;

  case DIR_LEFT:
    this.animation = new Animation(this.animationSet['walk-left'], this.sprite);
    this.dX = -1;
    this.dY = 0;
    break;

  case DIR_RIGHT:
    this.animation = new Animation(this.animationSet['walk-right'], this.sprite);
    this.dX = 1;
    this.dY = 0;
    break;
  }
}

/**
 * Generate an API-ready JSON representation of this object
 */
Agent.prototype.toJSON = function() {
  return {
    identifier: this.identifier,
    x: this.x,
    y: this.y,
    dX: this.dX,
    dY: this.dY,
    i: this.i,
    j: this.j,
    animation: this.animation.toJSON(),
  }
}

/**
 * Update this agent with information provided by the JSON API
 */
Agent.prototype.updateFromJSON = function(data) {
  if(data.identifier != this.identifier) {
    throw "Can't update " + this.identifier + " with data from " + data.identifier;
  }

  this.x = data.x;
  this.y = data.y;
  this.i = Math.floor(this.x/TILE_SIZE);
  this.j = Math.floor(this.y/TILE_SIZE);
  this.dX = data.dX;
  this.dY = data.dY;

  this.animation = Animation.fromJSON(data.animation, this.sprite);
};

/**
 * Crete an object from its API JSON representation.
 * @static
 */
Agent.fromJSON = function(data) {
  var i = Math.floor(data.x/TILE_SIZE);
  var j = Math.floor(data.y/TILE_SIZE);
  var agent = new Agent(i,j,null);

  agent.identifier = data.identifier;
  agent.x = data.x;
  agent.y = data.y;
  agent.dX = data.dX;
  agent.dY = data.dY;
  agent.animation = Animation.fromJSON(data.animation);
  return agent;
}

module.exports = Agent;
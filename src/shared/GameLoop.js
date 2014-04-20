var Animation = require('animation').Animation;

/**
 * GameLoop implements the game loop pattern.
 * Specifically, it will call tick(time) on every subsystem that is passed into the subsystems constructor arg.
 */
GameLoop = function(subsystems) {
  this.animation = new Animation({frame:'25ms'});
  this.subsystems = subsystems;

  this.animation.on('tick', function(time) {
    subsystems.forEach(function(subsystem) {
      subsystem[0][subsystem[1]](time);
    }); 
  });
}
GameLoop.prototype.constructor = GameLoop;

GameLoop.prototype.start = function() {
  this.animation.start();
}

module.exports = GameLoop;
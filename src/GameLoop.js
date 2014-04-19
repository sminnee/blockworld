define([
], function() {

	/**
	 * GameLoop implements the game loop pattern.
	 * Specifically, it will call tick(time) on every subsystem that is passed into the subsystems constructor arg.
	 */
	GameLoop = function(subsystems) {
		this.subsystems = subsystems;
	}
	GameLoop.prototype.constructor = GameLoop;

	GameLoop.prototype.start = function() {
		__subsystems = this.subsystems;

		function animate(time) {
			__subsystems.forEach(function(subsystem) {
				subsystem.tick(time);
			})

			requestAnimFrame(animate);
		}

		requestAnimFrame(animate);
	}

	return GameLoop;
});


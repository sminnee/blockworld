
	/**
	 * GameLoop implements the game loop pattern.
	 * Specifically, it will call tick(time) on every subsystem that is passed into the subsystems constructor arg.
	 */
	GameLoop = function(requestAnimFrame, subsystems) {
		this.requestAnimFrame = requestAnimFrame;
		this.subsystems = subsystems;
	}
	GameLoop.prototype.constructor = GameLoop;

	GameLoop.prototype.start = function() {
		var __subsystems = this.subsystems;
		var __raf = this.requestAnimFrame;

		function animate(time) {
			__subsystems.forEach(function(subsystem) {
				subsystem.tick(time);
			})

			__raf(animate);
		}

		__raf(animate);
	}

	module.exports = GameLoop;



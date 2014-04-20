/**
 * JobQueue will work its way through a set of jobs, defined as closures.
 * It implements priority, and unique job identifiers, so that the same job added to the queue is called only
 * once.
 * 
 * It is used by ViewRenderer as a render queue.
 */
JobQueue = function() {
  this.queue = [];
  this.running = false;
  this.jobsByIdentifier = {};
};

JobQueue.prototype.constructor = JobQueue;

/**
 * Add a job to the queue
 */
JobQueue.prototype.add = function(job, priority, identifier) {
  if(!parseInt(priority)) priority = 0;
  
  var toEnqueue = null;
  // identified jobs have their name put on the queue
  if(identifier) {
    this.jobsByIdentifier[identifier] = job;
    toEnqueue = identifier;
  
  // unidentified jobs have the closure put on the queue
  } else {
    toEnqueue = job;
  }

  // Add new item into the queue
  if(!this.queue[priority]) this.queue[priority] = [];

  this.queue[priority].push(toEnqueue);

  if(!this.running) {
    this.running = true;
    this.delayedRun();
  }
};

/**
 * Cancel all jobs of a given priority.
 */
JobQueue.prototype.cancelByPriority = function(priority) {
  delete this.queue[priority];
}

JobQueue.prototype.delayedRun = function() {
  var __jobQueue = this;
  setTimeout(function() {
    __jobQueue.run();
  }, 10);
};

JobQueue.prototype.run = function() {
  if(!this.queue.length) return;

  var job = null;
  this.running = true;
  for(var idx in this.queue) {
    while(this.queue[idx] && (job === null)) {
      var next = this.queue[idx].shift();
      if(!this.queue[idx].length) delete this.queue[idx];
      
      // A string is an identifier; look up the actual job
      if(typeof next == 'string') {
        job = this.jobsByIdentifier[next] ? this.jobsByIdentifier[next] : null;
        // Deleting from these will indicate that the job shouldn'tbe re-run, even if it is
        // queued multiple times
        delete this.jobsByIdentifier[next];
      
      } else {
        job = next;
      }
    }

    if(job !== null) break;
  }

  if(job) job();

  if(this.queue.length) {
    // Continue
    this.delayedRun();
  } else {
    // Finish and clean up
    this.jobsByIdentifier = {}
    this.running = false;
  }
};

module.exports = JobQueue;
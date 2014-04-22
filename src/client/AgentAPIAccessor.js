var $ = require('jquery');

/**
 * The AgentAPIAccessor is responsible for accessing the agent API
 * Right now this is only used to edit code.
 */

var AgentAPIAccessor = function() { 
}

AgentAPIAccessor.prototype.constructor = AgentAPIAccessor;

AgentAPIAccessor.prototype.getCode = function(identifier, callback) {
  $.get('/api/agent/' + identifier + '/code', callback);
};

AgentAPIAccessor.prototype.setCode = function(identifier, code, callback) {
  $.ajax({
    url: '/api/agent/' + identifier + '/code', 
    type: 'put',
    contentType: 'text/plain',
    data: code, 
    success: function() {
      callback(true);
    },
    error: function() {
      callback(false);
    }
  });
};

module.exports = AgentAPIAccessor;
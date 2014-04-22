/**
 * CodeManager manages the manipulation of the code assigned to each agent.
 */ 
var CodeManager = function(world) {
  var self = this;
  this.world = world;
  this.codeStrings = {};
  this.defaultCode = null;

  var fs = require('fs');

  fs.readFile('src/agents/wolf.js', 'utf8', function (err, code) {
    if(err) throw(err);

    self.defaultCode = self.compileCode(code);

    self.world.agents.forEach(function(agent) {
      self.codeStrings[agent.identifier] = code;
      agent.setCode(self.defaultCode);
    });

  });
}

CodeManager.prototype.constructor = CodeManager;

CodeManager.prototype.getCode = function(identifier) {
  return this.codeStrings[identifier];
}

CodeManager.prototype.setCode = function(identifier, code) {
  this.codeStrings[identifier] = code;
  var agent = this.world.getAgentByID(identifier);
  if(agent) {
    agent.setCode(this.compileCode(code));
  } else {
    throw "Can't find agent '" + identifier + "'";
  }
}

/**
 * Compile the given code and validate it
 */
CodeManager.prototype.compileCode = function(code) {
  // Super simple for now
  var compiled = eval("(function() {\n" + code + "\n})();");

  if(!compiled) throw "The code didn't return anything";
  if(!compiled.tick) throw "Compiled code didn't inlcude a 'tick' element";
  if(!compiled.animations) throw "Compiled code didn't inlcude a 'animations' element";

  return compiled;
}

module.exports = CodeManager;
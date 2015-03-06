var child = require('child_process');
var fs = require('fs');
var path = require('path');
var state = require('../lib/state');

module.exports = function(topic) {
  return {
    topic: topic,
    command: 'run',
    description: 'runs the built docker image',
    help: `help text for ${topic}:run`,
    variableArgs: true,
    run: function(context) {
      startB2D();
      var imageId = state.get(context.cwd).imageId;
      runCommand(imageId, context.cwd, context.args);
    }
  };
};

function startB2D() {
  console.log('starting boot2docker...');
  child.execSync('boot2docker start');
}

function runCommand(imageId, cwd, args) {
  var command = args.join(' ');
  child.execSync(`docker run -v ${cwd}:/app/src -w /app/src --rm -it ${imageId} ${command}`, {
    stdio: [0, 1, 2]
  });

}
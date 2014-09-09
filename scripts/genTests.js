/**
*  Generate stubbed mocha integration tests from Swagger api specs
*/
var swagger = require('node-swagger-api');
var commander = require('commander');
var path = require('path');
var util = require('./util');

commander
  .usage('node ./scripts/genControllers [options]')
  .option('-s, --src [path]', 'Path to Swagger API definition files')
  .option('-d, --dest [path]', 'Path to output build directory')
  .option('-m, --models [path]', 'Path to Swagger Model definition files')
  .option('-c, --clean', 'Clean recording directory before generation')
  .option('-c, --copy [path]', 'copy generated output to this directory')
  .parse(process.argv);


var options = {};
options.apiSrc = commander.src || './api';
options.modelSrc = commander.models || (options.apiSrc + '/models');
options.outputDir = commander.dest || './build';
if (commander.clean) options.clean = true;

// make sure we have a full path, not a relative one
if (!options.apiSrc.match(/^\//)) {
  options.apiSrc = path.normalize(__dirname + '/../' + options.apiSrc);
}
if (!options.modelSrc.match(/^\//)) {
  options.modelSrc = path.normalize(__dirname + '/../' + options.modelSrc);
}


swagger.generateTests.run(options, function(err, buildDir) {
  if (err) console.log("Error: " + err);
  // copy results to chosen destination
  if (commander.copy) {
    util.copy(buildDir, commander.copy, function(err) {
      if (err) console.log("Error copying results: " + err);
    });
  }
});
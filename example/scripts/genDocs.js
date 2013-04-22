/**
*  Generate Swagger documentation views from Swagger api specs
*/
var swagger = require('node-swagger-api');
var commander = require('commander');
var path = require('path');
var util = require('./util');

// define command line input options
commander
  .usage('node ./scripts/genDocs [options]')
  .option('-s, --src [path]', 'Path to Swagger API definition files')
  .option('-d, --dest [path]', 'Path to output build directory')
  .option('-m, --models [path]', 'Path to Swagger Model definition files')
  .option('-p, --basePath [http://localhost:3030]', 'copy generated files to public dir')
  .option('-c, --copy [path]', 'copy generated output to this directory')
  .parse(process.argv);

var options = {};
options.apiSrc = commander.src || './api';
options.modelSrc = commander.models || (options.apiSrc + '/models');
options.outputDir = commander.dest || './build';
options.basePath = commander.basePath || 'http://localhost:3030';
options.apiVersion = commander.apiVersion || "0.1";

// make sure we have a full path, not a relative one
if (!options.apiSrc.match(/^\//)) {
  options.apiSrc = path.normalize(__dirname + '/../' + options.apiSrc);
}
if (!options.modelSrc.match(/^\//)) {
  options.modelSrc = path.normalize(__dirname + '/../' + options.modelSrc);
}


swagger.generateDocs.run(options, function(err, buildDir) {
  if (err) console.log("Error: " + err);
  // copy results to chosen destination
  if (commander.copy) {
    util.copy(buildDir, commander.copy, function(err) {
      if (err) console.log("Error copying results: " + err);
    });
  }
});

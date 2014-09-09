'use strict';

/**
* Build a simple express app to demo swagger documentation
*/
var express = require('express');
var commander = require('commander');
var router = require('./router');
// var _ = require('underscore');
var fs = require('fs.extra');
// var dir = require('node-dir');

// simple helpful check for documentation
function checkSwaggerDocs() {
  var swaggerFilePath = __dirname + '/public/swagger/index.html';
  if (!fs.existsSync(swaggerFilePath)) {
    console.log('Error:  missing Swagger view: ' + swaggerFilePath);
    console.log('Generate views via:  `npm run-script docs`');
    return false;
  }
  return true;
}

// plug in minimal middleware for this example
function middleware(app) {
  app.use(express.static(__dirname + '/public'));
}


// ===== Command line interface ==========================================

commander
  .usage('[NODE_ENV=<env>] node app [options]')
  .option('-p, --port [number]', 'server port')
  .option('-w, --weburl [string]', 'full public base url of app, including port')
  .parse(process.argv);



if (!checkSwaggerDocs()) {
  process.exit();
}

// create/init express server
var app = express();
middleware(app);

// build/bind routes
var controllerDir = __dirname + '/app/controllers';
router.buildRoutes(app, controllerDir, function(err) {
  if (err) {
    console.log('Error: ' + err);
    process.exit();
  }
  // start server
  var port = commander.port ? commander.port : 3030;
  var weburl = commander.weburl ? commander.weburl : 'http://localhost:3030';
  app.listen(port);
  console.log('Listening on port ' + port);
  console.log('Supported route list:  ' + weburl);
  console.log('Online swagger docs: ' + weburl + '/api-docs');
});

// Expose the public dir
app.use(express.static(__dirname + '/public')); 

// Export the app for use in unit tests
module.exports.testthis = app;

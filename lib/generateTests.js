// var fs = require('fs.extra');
var async = require('async');
var apiSupport = require('./apiSupport');
var modelSupport = require('./modelSupport');
var util = require('./util');


function testForPath(info, api, op, modelInfo, templates) {
  // change path parameters from {id} to :id
  var path = api.path.replace(/{/g, ':');
  path = path.replace(/}/g,'');
  var method = (op && op.httpMethod) ? op.httpMethod.toLowerCase() : 'get';

  var test = templates.testmethod || '';
  test = test.replace(/{{path}}/g, path);
  test = test.replace(/{{method}}/g, method);
  return(test);
}


function testContents(apiInfo, modelInfo, templates, callback) {
  var results = [];
  var contents;
  var tests = [];
  apiInfo.forEach(function(info) {
    info.apis.forEach(function(api) {
      api.operations.forEach(function(op) {
        tests.push(testForPath(info, api, op, modelInfo, templates));
      });
    });
    contents = templates.testfile || '';
    contents = contents.replace(/{{name}}/g, info.name);
    contents = contents.replace('{{pathToController}}', '../app/controllers/' + info.name + 'Controller');
    contents = contents.replace('{{tests}}', tests.join("\n\n"));
    results.push({filename: info.name + 'Test.js', contents: contents});
  });
  callback(null, results);
}


/**
* - options
*   - apiSrc: directory where swager api docs reside
*   - modelSrc: directory where swagger model classes reside
*   - outputDir: destination build directory
*   - clean: if true, clean build directory first
*/
module.exports.run = function(options, callback) {
  if (!options || !options.apiSrc || !options.outputDir) {
    return callback("missing apiSrc or outputDir");
  }

  var destDir, apiInfo, modelInfo, templateInfo, fileInfo;
  var steps = {};
  steps.setupDirs = function(cb) {
    options.subdir = "/tests";
    util.setupDirs(options, function(err, buildDir) {
      destDir = buildDir;
      return cb(err, buildDir);
    });
  };
  steps.loadApis = function(cb) {
    apiSupport.loadApis(options.apiSrc, options, function(err, info) {
      apiInfo = info;
      return cb(err, info);
    });
  };
  if (options.modelSrc) {
    steps.loadModels = function(cb) {
      modelSupport.loadModels(options.modelSrc, function(err, modelDirectory) {
        modelInfo = modelDirectory;
        return cb(err, modelInfo);
      });
    };
  }
  steps.loadTemplates = function(cb) {
    var templatePath = __dirname + '/../templates/tests';
    util.readTemplates(templatePath, function(err, templates) {
      templateInfo = templates;
      cb(err, templates);
    });
  };
  steps.testContents = function(cb) {
    testContents(apiInfo, modelInfo, templateInfo, function(err, contents) {
      fileInfo = contents;
      cb(err, contents);
    });
  };
  steps.writeFiles = function(cb) {
    util.writeFiles(destDir, fileInfo, cb);
  };
  async.series(steps, function(err, results) {
    callback(err, destDir);
  });
};
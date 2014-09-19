'use strict';

var fs = require('fs.extra');
var async = require('async');
var _ = require('underscore');
var path = require('path');
var apiSupport = require('./apiSupport');
var modelSupport = require('./modelSupport');


// annotate api's
// save within public directory
function saveApis(apiInfo, destDir, options, callback) {
  if (!apiInfo || !destDir) {
    return callback('missing apiInfo');
  }

  // translate args into filename/contents
  var fileInfo = _.map(apiInfo, function(info) {
    var contents = {};
    contents.apiVersion = (options && options.apiVersion) ? options.apiVersion : '?';
    contents.swaggerVersion = (options && options.swaggerVersion) ? options.swaggerVersion : '?';
    contents.basePath = (options && options.basePath) ? options.basePath : 'http://localhost:3030';
    contents.apis = info.apis;
    if (options && options.modelsSpec) {
      contents.models = options.modelsSpec;
    }
    return {
      filePath: path.normalize(destDir + '/' + info.name),
      contents: JSON.stringify(contents)
    };
  });

  function writeFile(fileInfo, callback) {
    fs.writeFile(fileInfo.filePath, fileInfo.contents, function (err) {
      if (err) {
          return callback(err);
      }
      console.log('Saved ' + fileInfo.filePath);
      return callback(null, fileInfo.filePath);
    });
  }

  async.forEach(fileInfo, writeFile, callback);
}


/**
* generateApiResourceSummary
* Read api's within apiPath, and create summary resource file stored at outputFilePath
* - options
*   - apiPath
*   - outputFilePath
*/
function generateApiSummary(apiInfo, apiResourceFilePath, options, callback) {
  if (!apiInfo ) {
    return callback('missing apiInfo');
  }
  var contents = {};
  contents.apiVersion = (options && options.apiVersion) ? options.apiVersion : '?';
  contents.swaggerVersion = (options && options.swaggerVersion) ? options.swaggerVersion : '?';
  contents.apis = [];
  apiInfo.forEach(function(info) {
    contents.apis.push({
      path: '/' + info.name,
      description: ''
    });
  });
  fs.writeFile(apiResourceFilePath, JSON.stringify(contents), function (err) {
    if (err) {
        return callback(err);
    }
    console.log('Saved ' + apiResourceFilePath);
    return callback(null, apiResourceFilePath);
  });
}


/**
  - options
    - outputDir = commander.dest || '../build';
    - basePath = commander.basePath || 'http://localhost:3030';
    - apiDestPath = '/api';
    - apiResourceFilename = 'resources.json';
*/
function setupDirs(options, callback) {
  // figure out all the directories we're gonna need
  var targetDir = options.outputDir + '/public';
  var apiDocDir = targetDir + options.apiDestPath;
  var dirInfo = {
    targetDir: targetDir,
    apiDocDir:  apiDocDir,
    apiResourceFilePath:  apiDocDir + '/' + options.apiResourceFilename,
    apiResourceUrl: options.basePath + options.apiDestPath + '/' + options.apiResourceFilename,
    swaggerSrc: path.normalize(__dirname + '/../node_modules/swagger-ui/dist'),
    swaggerIndexSrc: path.normalize(__dirname + '/../swagger-index.html'),
    swaggerDest: targetDir + '/swagger',
    swaggerIndexDest: targetDir + '/swagger/index.html'
  };
  // clean out our target dir
  if (fs.existsSync(dirInfo.targetDir)) {
    fs.removeSync(dirInfo.targetDir);
  }
  // create new dirs
  fs.mkdirRecursiveSync(apiDocDir);
  console.log('Created ' + apiDocDir);
  // copy swagger distribution
  fs.copyRecursive(dirInfo.swaggerSrc, dirInfo.swaggerDest, function (err) {
    if (err) {
        return callback(err, dirInfo);
    }
    console.log('Copied Swagger views to: ' + dirInfo.swaggerDest);
    // The customised swagger/index.html will have been overwritten, so delete it and
    // replace it with the stored one.
    fs.unlink(dirInfo.swaggerIndexDest);
    fs.copy(dirInfo.swaggerIndexSrc, dirInfo.swaggerIndexDest, function(err) {
        if (err) {
            return callback(err, dirInfo);
        }
        return callback(null, dirInfo);
    });
  });
}

/**
  - options
    - apiSrc: path to swagger api specifications
    - outputDir: output build directory
    - basePath: url to embed within client views: 'http://localhost:3030';
    - apiDestPath: sub path within public directory
    - apiResourceFilename: 'resources.json';
    - apiVersion: version embedded in swagger views;
*/
module.exports.run = function(options, callback) {
  if (!options || !options.apiSrc || !options.outputDir || !options.basePath) {
    return callback('missing apiSrc, outputDir, or basePath');
  }
  if (!options.apiDestPath) {
      options.apiDestPath = '/api'; // subfolder within public
  }
  if (!options.apiResourceFilename) {
      options.apiResourceFilename = 'resources.json';
  }
  if (!options.apiVersion) {
      options.apiVersion = '?';
  }
  options.swaggerVersion = '0.1.13';  // swagger-ui version?

  var dirInfo;
  var apiInfo;
  var steps = {};
  steps.setupDirs = function(cb) {
    setupDirs(options, function(err, info) {
      dirInfo = info;
      return cb(err, info);
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
        options.modelsSpec = modelSupport.spec(modelDirectory);
        return cb(err, options.modelsSpec);
      });
    };
  }
  steps.saveApis = function(cb) {
    saveApis(apiInfo, dirInfo.apiDocDir, options, cb);
  };
  steps.generateApiSummary = function(cb) {
    generateApiSummary(apiInfo, dirInfo.apiResourceFilePath, options, cb);
  };
  async.series(steps, function(err) {
    callback(err, dirInfo.targetDir);
  });
};

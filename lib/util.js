var fs = require('fs.extra');
var async = require('async');
var path = require('path');
var dir = require('node-dir');


/**
  - options
    - outputDir = commander.dest || '../build';
    - clean
    - subdir
*/
module.exports.setupDirs = function(options, callback) {
  if (!options || !options.outputDir) {
    return callback("missing outputDir");
  }
  var baseDir = options.outputDir + (options.subdir || '');
  var targetDir = baseDir + '/' + Date.now();
  if (options && options.clean && fs.existsSync(baseDir)) {
    fs.removeSync(baseDir);
    console.log("Removed " + baseDir);
  }
  fs.mkdirRecursiveSync(targetDir);
  console.log("Created " + targetDir);
  return callback(null, targetDir);
};


module.exports.readTemplates = function(templatePath, callback) {
  var batched = {};
  var filename;
  dir.files(templatePath, function(err, files) {
    if (err) return callback(err);
    files.forEach(function(filePath) {
      batched[path.basename(filePath)] = function(cb) {
        fs.readFile(filePath, 'utf8', cb);
      };
    });
    async.parallel(batched, callback);
  });
};


module.exports.writeFiles = function(destDir, fileInfo, callback) {
  if (!fs.existsSync(destDir)) {
    fs.mkdirRecursiveSync(destDir);
  }
  var batched = {};
  fileInfo.forEach(function(finfo) {
    batched[finfo.filename] = function(cb) {
      var filePath = destDir + '/' + finfo.filename;
      fs.writeFile(filePath, finfo.contents, function(err) {
        console.log("Created " + filePath);
        cb(err);
      });
    };
  });
  async.parallel(batched, callback);
};
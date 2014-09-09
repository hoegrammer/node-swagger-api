var exec = require('child_process').exec;
var fs = require('fs.extra');

module.exports.copy = function(srcDir, destDir, callback) {
  if (!fs.existsSync(srcDir)) {
    return callback("missing srcDir: " + srcDir);
  }
  if (!fs.existsSync(destDir)) {
    fs.mkdirRecursiveSync(destDir);
    console.log("Created " + destDir);
  }
  exec("cp -r " + srcDir + "/* " + destDir, function(err) {
    if (err) return callback(err);
    console.log("Copied " + srcDir + "/* to " + destDir);
    return callback();
  });
};
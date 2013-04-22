var fs = require('fs.extra');
var dir = require('node-dir');
var _ = require('underscore');
var path = require('path');


/**
Given a filePath like this:  (/Users/barbara/dev/api/airbnb-api-core/example/app/apis/v1/helloApi.js')
infer the resource (hello) and the version (v1)
*/
function inferResourceName(filePath, rootDir) {
  var pieces = _.compact(filePath.replace(rootDir, '').split('/'));
  var info = null;
  var matched, index;
  if (pieces.length > 0) {
    // extract the name off the last element
    matched = pieces[pieces.length -1].match(/^(.*)Api.js$/);
    if (matched) {
      info = {};
      info.resourceName = matched[1];
    }
  }
  // if (pieces.length > 1) {
  //   // extract version of the second-to-last element
  //   matched = pieces[pieces.length - 2].match(/^(.*)$/);
  //   info.version = matched[1];
  // }
  return info;
}


/**
  Given an apiPath, for each file underneath that directory, return an info hash containing
  the resource name, version, and api spec. (where name and version are inferred from the filePath, 
  and the api spec is exported content from that file)

  - apiSrc: full path to api source definition
  - options
    - apiDestPath: subpath under public directory where swagger resources are stored
*/
module.exports.loadApis = function(apiSrc, options, callback) {
  if (!apiSrc) {
    return callback("missing apiSrc");
  }
  if (!fs.existsSync(apiSrc)) {
    return callback("api directory '" + apiSrc + "' does not exist");
  }
  var apiInfo = [];
  var info, resource;
  var apiDestPath = (options && options.apiDestPath) ? options.apiDestPath : '';
  dir.files(apiSrc, function(err, files) {
    if (err) return callback(err);
      files.forEach(function(fullPath) {
        if (fullPath.match(/.js$/)) {
          resource = require(fullPath);
          info = inferResourceName(fullPath, apiDestPath);
          if (info && info.resourceName) {
            apiInfo.push({
              name: info.resourceName,
              //version: info.version,
              apis:resource.apis
            });
          }
        }
      });
    return callback(null, apiInfo);
  });
};


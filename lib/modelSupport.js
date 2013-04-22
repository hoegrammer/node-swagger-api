/**
* Load Swagger Models
*/
var fs = require('fs');
var path = require('path');
var _ = require('underscore');


function toTitleCase(str)
{
  return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1);});
}


/**
*  Return a hash of model names, each mapping to swagger spec
*  See:  https://github.com/wordnik/swagger-core/wiki/Datatypes
*/
module.exports.spec = function(modelDirectory) {
  swaggerSpec = {};
  _.each(modelDirectory, function(value, name) {
    swaggerSpec[name] = value.spec;
  });
  return swaggerSpec;
};


/**
  Given path to model files, build a hash with model name key and two member values:  spec and stub.  The
  spec key points to the swagger js spec for that model. The stub is a function that will return sample
  output.
*/
module.exports.loadModels = function(modelSrc, callback) {
  if (!modelSrc) {
    return callback("missing modelSrc");
  }
  if (!fs.existsSync(modelSrc)) {
    return callback("model directory '" + modelSrc + "' does not exist");
  }
  modelDirectory = {};
  var model;
  // read all model js files in directory
  fs.readdirSync(modelSrc).forEach(function(filename) {
    var name = path.basename(filename, '.js');
    model = require(modelSrc + '/' + filename);
    // if model supports spec() and stub(), add them to our swaggerSpec
    if (model && model.spec && model.stub) {
      modelDirectory[toTitleCase(name)] = {spec: model.spec, stub: model.stub};
    }
  });
  return callback(null, modelDirectory);
};


module.exports.modelString = function(modelInfo, modelClass) {
  if (!modelInfo || !modelClass) return null;

  var model = null;
  // direct model name match
  if (modelInfo[modelClass]) {
    model = modelInfo[modelClass].stub();
    if (model) model = JSON.stringify(model);
    return model;
  }

  // clumsily handle list case
  var matched = modelClass.match(/List\[([^\]]*)\]/);
  if (matched) {
    var name = matched[1];
    if (modelInfo[name]) {
      model = modelInfo[name].stub();
      if (model) model = JSON.stringify([model]);
      return model;
    }
  }
};


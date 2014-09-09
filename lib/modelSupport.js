'use strict';

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
  var swaggerSpec = {};
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
    return callback('missing modelSrc');
  }
  if (!fs.existsSync(modelSrc)) {
    return callback('model directory "' + modelSrc + '" does not exist');
  }
  
  var modelDirectory = {};
  var model;
  // read all model js files in directory
  fs.readdirSync(modelSrc).forEach(function(filename) {
    var name = path.basename(filename, '.js');
    model = require(modelSrc + '/' + filename);
    if (model && model.spec) {
        // generate stub and list-stub from sample files
        var sampleBase =  __dirname+'/../api/sampledata/' + model.spec.id.toLowerCase(); 
        var stubFile = sampleBase + '.json';
        var stub;
        if (fs.existsSync(stubFile)) {
           stub = JSON.parse(fs.readFileSync(stubFile, {encoding: 'utf8'}));
        }
        var listStubFile = sampleBase + '.list.json';
        var listStub;
        if (fs.existsSync(listStubFile)) {
            listStub = JSON.parse(fs.readFileSync(listStubFile, {encoding: 'utf8'}));
        }
        modelDirectory[toTitleCase(name)] = {spec: model.spec, stub: stub, listStub: listStub};
    }
  });
  return callback(null, modelDirectory);
};

/**
* Returns sample data
*/
module.exports.modelString = function(modelInfo, modelClass) {
  if (!modelInfo || !modelClass) {
      return null;
  }

  var sample = null;
  // direct model name match
  if (modelInfo[modelClass]) {
    sample = modelInfo[modelClass].stub;
    if (sample) {
        sample = JSON.stringify(sample);
    } else {
        console.warn('No sample data for single ' + modelClass);
    }
    return sample;
  }

  // list case
  var matched = modelClass.match(/List\[([^\]]*)\]/);
  if (matched) {
    var name = matched[1];
    if (modelInfo[name]) {
      sample = modelInfo[name].listStub;
      if (sample) {
          sample = JSON.stringify(sample);
      } else {
            console.warn('No sample data for ' + name + ' list');
      }
      return sample;
    }
  }
};


'use strict';

var async = require('async');
var apiSupport = require('./apiSupport');
var modelSupport = require('./modelSupport');
var util = require('./util');


function routeForApiOp(info, api, op) {
  // change path parameters from {id} to :id
  var path = api.path.replace(/{/g, ':');
  path = path.replace(/}/g, '');
  var route = {method: op.httpMethod.toLowerCase(),
               path:path,
               action: op.nickname,
               role:'guest'};
  return '    ' + JSON.stringify(route);
}

function commentForApiOp(info, api, op, modelInfo) {
  var comment = [];
  var modelJson;
  comment.push('/**');
  comment.push('* ' + op.nickname);
  if (op.parameters) {
    comment.push('* Input:');
    op.parameters.forEach(function(p) {
      if (p.name) {
        comment.push('*   ' + p.name + ': ' + p.description);
      } else if (p.dataType && modelInfo[p.dataType]) {
        modelJson = modelInfo[p.dataType].stub;
        if (modelJson) {
          comment.push('*   ' + p.dataType + ': eg:' + JSON.stringify(modelJson));
        }
      }
    });
  }
  comment.push('* Response:');
  comment.push('*   callback(err, js)');
  comment.push('*/');
  return comment.join('\n');
}

function responseForApiOp(info, api, op, modelInfo) {
  var response =  modelSupport.modelString(modelInfo, op.responseClass) || '"OK"';
  return response;
}

function actionForApiOp(info, api, op, modelInfo, templates) {
  var code = templates.action || '';
  code = code.replace('{{comment}}', commentForApiOp(info, api, op, modelInfo, templates));
  code = code.replace('{{action}}', op.nickname);
  code = code.replace('{{response}}', responseForApiOp(info, api, op, modelInfo, templates));
  return code;
}


function controllerContents(apiInfo, modelInfo, templates, callback) {
  var results = [];
  var routes, actions, contents;
  apiInfo.forEach(function(info) {
    routes = [];
    actions = [];
    info.apis.forEach(function(api) {
      api.operations.forEach(function(op) {
        routes.push(routeForApiOp(info, api, op, templates));
        actions.push(actionForApiOp(info, api, op, modelInfo, templates));
      });
    });
    contents = templates.controller || '';
    contents = contents.replace('{{controllerName}}', info.name + 'Controller');
    contents = contents.replace('{{routes}}', routes.join(',\n'));
    contents = contents.replace('{{actions}}', actions.join('\n\n'));
    results.push({filename: info.name + 'Controller.js', contents: contents});
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
    return callback('missing apiSrc or outputDir');
  }

  var destDir, apiInfo, modelInfo, templateInfo, fileInfo;
  var steps = {};
  steps.setupDirs = function(cb) {
    options.subdir = '/controllers';
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
    var templatePath = __dirname + '/../templates/controllers';
    util.readTemplates(templatePath, function(err, templates) {
      templateInfo = templates;
      cb(err, templates);
    });
  };
  steps.controllerContents = function(cb) {
    controllerContents(apiInfo, modelInfo, templateInfo, function(err, contents) {
      fileInfo = contents;
      cb(err, contents);
    });
  };
  steps.writeControllers = function(cb) {
    util.writeFiles(destDir, fileInfo, cb);
  };
  async.series(steps, function(err) {
    callback(err, destDir);
  });
};

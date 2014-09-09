var _ = require('underscore');
var fs = require('fs.extra');
var dir = require('node-dir');

// strip off controllerDir prefix and .js|.coffee suffix, then replace any
// slashes with _'s
function extractControllerName(path, controllerDir) {
  var name = path.replace(controllerDir, '');
  name = name.replace(/^\//, '');
  name = name.replace(/.js$|.coffee$/, '');
  name = name.replace(/\//g, '_');
  return name;
}

// Collect route configurations from each controller beneath controllerDir
function controllerRouteInfo(controllerDir, callback) {
  var routes = [];
  var controller, controllerName;
  // recursively find files from controllerDir
  dir.files(controllerDir, function(err, files) {
    if (err) return callback(err);
    files.forEach(function(fullPath) {
      // only accept files that end in .js or .coffee
      if (fullPath.match(/.js$|.coffee$/)) {
        // load resource and see if routes are defined
        controller = require(fullPath);
        if (controller.routes) {
          controllerName = extractControllerName(fullPath, controllerDir);
          controller.routes().forEach(function(r) {
            if (r.path && r.action) {
              // decorate the route with correct defaults
              if (!r.method) r.method = 'get';    // set correct method
              r.path = r.path;                    // apply route prefix to path
              r.controller = controller;          // render needs access to real controller
              r.controllerPath = fullPath;        // might be useful
              r.controllerName = controllerName;  // assign name, useful for autogen tests
              routes.push(r);                     // collect it
            }
          });
        }
      }
    });
    return callback(null, routes);
  });
}

// collect route summary
function routeSummary(app) {
  var summary = [];
  _.each(app.routes, function(routes, method) {
    _.each(routes, function(r) {
      summary.push(method + ' ' + r.path);
    });
  });
  return summary;
}

// Given a function that retrieves the data, consistently send the response
function render(route) {
  return function(req, res, next) {
    // extract params from request
    params = req.query || {};
    req.route.keys.forEach(function(routeKey) {
      params[routeKey.name] = req.route.params[routeKey.name];
    });

    // get correct controller/action that will retrieve the data
    route.controller[route.action](req, params, function(err, json) {
      if (err) {
        // handle error in some consistent way
        next(err);
      } else {
        res.json(json);
      }
      // DO NOT FORWARD TO NEXT -- END CHAIN HERE
    });
  };
}



// bind routes to our express app
module.exports.buildRoutes = function(app, controllerDir, callback) {
  app.get('/api-docs', function(req, res) {
    res.redirect('/swagger/index.html');
  });
  app.get('/hello', function(req, res) {
    var body = 'Hello World';
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Length', body.length);
    res.end(body);
  });
  app.get('/', function(req, res) {
    res.json(routeSummary(app));
  });
  controllerRouteInfo(controllerDir, function(err, routes) {
    if (routes) {
      routes.forEach(function(r) {
        app[r.method](r.path, render(r));
      });
    }
    return callback(err, routes);
  });
};


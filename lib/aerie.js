var fs = require('fs');
var path = require('path');
var jade = require('jade');
var util = require('util');
var View = require('./view');

var Aerie = module.exports = {};

/**
 * A hash of registered View objects.
 *
 * This gets populated when a view is extended.
 */
Aerie.views = {};

/**
 * A hash of compiled templates.
 *
 * This gets populated when templates get pre-compiled
 */
Aerie.compiled = {};

Aerie.cacheConnector = null;

/**
 * Accepts a cache connector object
 */
Aerie.connect = function aerieConnect (cacheConnector) {
  Aerie.cacheConnector = cacheConnector;
  View.prototype.cacheConnector = cacheConnector;
};

Aerie.config = {
  views: '/views',
};


/**
 * Returns a new view
 */
Aerie.view = function aerieViewExtend(name, version, build) {
  var descriptor;

  function view(name, version, build) {
    var View = require('./view');
    View.call(this, name, version, build);
  }
  util.inherits(view, View);

  return view;
};

/**
 * Addes properties to the global locals
 *
 * @param {Object} properties Properties to add to this.locals
 * @returns {undefined}
 */
Aerie.locals = function aerieLocals(properties) {
  for (var prop in properties) {
    if (properties.hasOwnProperty(prop)) {
      Aerie._locals[prop] = properties[prop];
    }
  }
};

/**
 * Sets config properties
 *
 * @param {(string|Object)} key Single key or object literal
 * @param {string} [value] Key value is key is a string
 * @returns {undefined}
 */
Aerie.configure = function aerieConfigure(key, value) {
  if (typeof key === 'string') {
    var k = key;
    key = {};
    key[k] = value;
  }

  for (var prop in key) {
    if (key.hasOwnProperty(prop)) {
      if(prop === 'views' && key[prop].substr(-1) !== '/') {
        key[prop] += '/';
      }

      if (prop === 'compiled') {
        Aerie.compiled = require(key[prop]);
      }

      Aerie.config[prop] = key[prop];
    }
  }
};

/**
 * Express Middleware that detects partial requests and
 * updates locals
 */
Aerie.detectPartial = function aerieDetectPartial(req, res, next) {
  var partial = req.get('X-Partial');
  if(partial === 'true') {
    res.locals.partial = true;
  } else {
    res.locals.partial = false;
  }

  next();
};

Aerie.parsePath = function aerieParsePath(path) {
  var base = __dirname.replace('node_modules/jade-aerie/lib', '');
  return path.replace('.jade', '').replace(base, '');
};

Aerie.render = function aerieRender(viewPath, locals) {
  if(Aerie.views[viewPath]) {
    // Use view based rendering
    return Aerie.views[viewPath].render(locals);
  }

  compiledPath = Aerie.parsePath(viewPath);

  if(Aerie.compiled[compiledPath]) {
    // Use execute compiled template
    return Aerie.compiled[compiledPath](locals);
  } else {
    // Use file based rendering
    return jade.renderFile(viewPath, locals);
  }
};

Aerie.__express = function aerieExpress(viewPath, options, fn) {
  if (typeof options === 'function') {
    fn = options;
    options = undefined;
  }

  if (typeof fn === 'function') {
    var res;
    try {
      res = Aerie.__express(viewPath, options);
    } catch (e) {
      fn(e);
    }

    return fn(null, res);
  }

  options.filename = viewPath;

  var content;
  try {
    content = Aerie.render(viewPath, options);
    if (!options.partial) {
      options.content = content;
      content = Aerie.render(Aerie.config.topLevelTemplate, options);
    }
  } catch (err) {
    console.error(err);
    throw err;
  }

  return content;
};

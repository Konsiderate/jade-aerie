'use strict';

var fs = require('fs');
var merge = require('merge');
var path = require('path');
var jade = require('jade');

var Aerie = module.exports = {};
Aerie.config = {
  views: '/views',
  environment: 'development'
};
Aerie._locals = {
  layout: 'layout'
};
Aerie.compiled = {};

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

      Aerie.config[prop] = key[prop];
    }
  }
};

/*
var walk = function(dir, done) {
  var results = [];
  dir = path.normalize(dir);
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) {
      file = path.join(dir,file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          if(path.extname(file) === '.jade') {
            results.push(file);
          }

          if (!--pending) done(null, results);
        }
      });
    });
  });
};
*/

var walk = function(dir) {
  var results = [];
  var list = fs.readdirSync(dir);
  var i = 0;
  return function next() {
    var file = list[i++];
    if (!file) {
      return results;
    }
    file = path.join(dir, file);
    var stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
      return next();
    } else {
      results.push(file);
      return next();
    }
  }();
};

/**
 * Compile all templates in the views folder into functions
 */
Aerie.compileSync = function aerieCompileSync(views) {
  // Add tailing slash if it doesn't exist
  console.log('compile!');

  var files;
  try {
    files = walk(views);
  } catch(err) {
    throw new Error(err);
  }

  var compiled = {};
  for(var i = 0; i < files.length; i++) {
    var file = fs.readFileSync(files[i]);
    var name = Aerie.parseViewName(views, files[i]);
    compiled[name] = jade.compile(file);
  }

  Aerie.compiled = compiled;
  return Aerie.compiled;
};

/**
 * Express Middleware that detects partial requests and
 * updates locals
 */
Aerie.detectPartial = function aerieDetectPartial(req, res, next) {
  var partial = req.get('X-Partial');
  if(partial === 'true') {
    Aerie.locals({_partial: true});
  }

  next();
};

Aerie.__express = function aerieExpress(path, options, fn) {
  if (typeof options === 'function') {
    fn = options;
    options = undefined;
  }

  if (typeof fn === 'function') {
    var res;
    try {
      res = Aerie.__express(path, options);
    } catch (e) {
      fn(e);
    }

    return fn(null, res);
  }

  options = options || {};
  options = merge(options, Aerie._locals);

  var name = Aerie.parseViewName(options.settings.views, path);
  var compiled = options.settings.compiledViews || Aerie.compiled;
  var result;

  if (options.cache) {
    result = compiled[name](options);
  } else {
    // Render from file each time.
    result = jade.compile(fs.readFileSync(path))(options);
  }

  if(options._partial) {
    options.html = result;
    if (options.cache) {
      result = compiled[options.layout](options);
    } else {
      // Render from file each time.
      var p = options.settings.views + options.layout + '.jade';
      result = jade.compile(fs.readFileSync(p))(options);
    }
  }

  return result;
};

Aerie.parseViewName = function aerieParseViewName(views, file) {
  if(views && views.substr(-1) !== '/') {
    views += '/';
  }

  return file.replace('.jade', '').replace(views, '');
};
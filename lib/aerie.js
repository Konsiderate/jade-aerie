'use strict';

var fs = require('fs');
var path = require('path');
var jade = require('jade');

function Aerie() {
  this.config = {
    views: '/views',
    environment: 'development'
  };

  this._locals = {};

  this.compiled = {};

  console.log('new Aerie');
}

/**
 * Addes properties to the global locals
 *
 * @param {Object} properties Properties to add to this.locals
 * @returns {undefined}
 */
Aerie.prototype.locals = function aerieLocals(properties) {
  for (var prop in properties) {
    if (properties.hasOwnProperty(prop)) {
      this._locals[prop] = properties[prop];
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
Aerie.prototype.configure = function aerieConfigure(key, value) {
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

      this.config[prop] = key[prop];
    }
  }
};

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

/**
 * Compile all templates in the views folder into functions
 */
Aerie.prototype.compile = function aerieCompile(done) {
  // Find all templates
  var self = this;
  walk(this.config.views, function(err, files){
    if(err) {
      return done(err);
    }

    var pending = files.length;
    files.forEach(function(file){
      fs.readFile(file, function(err, data){
        var name = file.replace('.jade', '');
        name = name.replace(self.config.views, '');
        self.compiled[name] = jade.compile(data);
        if(!--pending){
          done();
        }
      });
    });
  });
};

Aerie.prototype.Aerie = Aerie;

module.exports = Aerie;
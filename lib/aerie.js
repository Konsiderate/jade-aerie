'use strict';

var path = require('path');

function Aerie() {
  this.config = {
    views: path.join(__dirname, '/views'),
    environment: 'development'
  };
  this._locals = {};

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
    this.config[key] = value;
  } else {
    for (var prop in key) {
      if (key.hasOwnProperty(prop)) {
        this.config[prop] = key[prop];
      }
    }
  }
};

Aerie.prototype.Aerie = Aerie;

module.exports = Aerie;

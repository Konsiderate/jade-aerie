'use strict';

/**
 * Aerie View Object
 *
 * @class
 * @param {string} name     View name
 * @param {string} version  View cache version
 * @param {Function} rebuild Function that fetches the data for a rebuild
 */
function View(name, version, rebuild) {
  if (!name) {
    throw new TypeError('name must be defined');
  }

  if (!version) {
    throw new TypeError('name must be defined');
  }

  if (!rebuild) {
    throw new TypeError('rebuild must be defined');
  }

  this.name = name;
  this.version = version;
  this.rebuild = rebuild;
}

module.exports = View;

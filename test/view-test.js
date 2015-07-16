var assert = require('assert');
var Aerie = require('../');
var View = require('../lib/view');

describe('View', function () {
  it('should be accessable via aeries index', function () {
    var actual = Aerie.View;
    var expected = View;

    assert.equal(actual, expected);
  });

  it('should accept a cache connector', function () {
    Aerie.connect({});
    assert(Aerie.cacheConnector);
  });
});

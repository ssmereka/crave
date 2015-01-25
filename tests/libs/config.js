var crave = require('../../libs/index.js');

var assert = require("assert"),
    should = require("should"),
    _ = require("lodash");

var exampleConfig = { 
  cache: { 
    enable: false,
    path: '/home/scott/Documents/oaklabs/crave/data/cache.json' 
  },
  debug: false,
  identification: { 
    type: 'string', 
    identifier: '~>' 
  } 
};

describe('Config', function() {
  var config = crave.getConfig();

  it('config is an object and defined', function() {
    assert.equal(_.isObject(config), true);
  });

  it('config has the required properties', function() {
    should(config).have.property('cache');
    assert.equal(_.isObject(config["cache"]), true);
    should(config["cache"]).have.property('enable');
    should(config["cache"]).have.property('path');
    should(config).have.property('debug');
    should(config).have.property('identification');
    assert.equal(_.isObject(config["identification"]), true);
    should(config["identification"]).have.property('type');
    should(config["identification"]).have.property('identifier');
  });

  it('config default values should be correct.', function() {
    assert.equal(config["cache"]["enable"], false);
    assert.equal(config["debug"], false);
    assert.equal(config["identification"]["type"], 'string');
    assert.equal(config["identification"]["identifier"], "~>");
  });

});


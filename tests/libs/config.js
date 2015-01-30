var crave = require('../../libs/index.js');

var assert = require("assert"),
    path = require("path"),
    should = require("should"),
    _ = require("lodash");

var defaultConfig = { 
  cache: { 
    enable: false,
    path: path.resolve(__dirname, "../../data/cache.json")
  },
  debug: false,
  identification: { 
    type: 'string', 
    identifier: '~>' 
  } 
};

describe('Config', function() {
  var config = crave.getConfig();

  it('config is an object and defined.', function() {
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
    assert.equal(config["cache"]["enable"], defaultConfig.cache.enable);
    config["cache"]["path"].should.be.ok
    assert.equal(config["debug"], defaultConfig.debug);
    assert.equal(config["identification"]["type"], defaultConfig.identification.type);
    assert.equal(config["identification"]["identifier"], defaultConfig.identification.identifier);
  });

  describe('default properties can be overridden.  ', function() {
    var modifiedConfig;

    it('Enable caching for all required files', function() {
      crave.setConfig({ cache: { enable: true } });
      modifiedConfig = crave.getConfig();
      assert.equal(modifiedConfig["cache"]["enable"], true);
      should(config["cache"]).have.property('path');
      crave.setConfig(config);
    });

    it('Disable caching for all required files', function() {
      crave.setConfig({ cache: { enable: false } });
      modifiedConfig = crave.getConfig();
      assert.equal(modifiedConfig["cache"]["enable"], false);
      should(config["cache"]).have.property('path');
      crave.setConfig(config);
    });

    it('Change cache path', function() {
      var tempPath = path.resolve(__dirname, "../../data/cache1.json");
      crave.setConfig({ cache: { path: tempPath } });
      modifiedConfig = crave.getConfig();
      assert.equal(modifiedConfig["cache"]["enable"], false);
      should(config["cache"]).have.property('path');
      assert.equal(modifiedConfig["cache"]["path"], tempPath);
      crave.setConfig(config);
    });

    it('Change cache path to an invalid location', function() {
      crave.setConfig({ cache: { path: undefined } });
      modifiedConfig = crave.getConfig();
      assert.equal(modifiedConfig["cache"]["enable"], false);
      should(config["cache"]).have.property('path');
      assert.equal(modifiedConfig["cache"]["path"], undefined);
      crave.setConfig(config);
    });

    it('Change debug mode', function() {
      crave.setConfig({ debug: true });
      modifiedConfig = crave.getConfig();
      assert.equal(modifiedConfig["debug"], true);
      crave.setConfig(config);
    });

    it('Change identification method to filenames', function() {
      crave.setConfig({ identification: { type: "filename", identifier: "_" } });
      modifiedConfig = crave.getConfig();
      assert.equal(modifiedConfig["identification"]["type"], "filename");
      assert.equal(modifiedConfig["identification"]["identifier"], "_");
      crave.setConfig(config);
    });
  });

});


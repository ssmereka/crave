// Require modules and libs.
var assert = require("assert"),
    Config = new (require("../../libs/config.js")),
    crave = require('../../libs/index.js')
    path = require("path"),
    should = require("should"),
    _ = require("lodash");

// Local-Global variable instances.
var debug = (process.env.CRAVE_DEBUG && (process.env.CRAVE_DEBUG === true || process.env.CRAVE_DEBUG.toLowerCase() === "true")),
    trace = (process.env.CRAVE_TRACE && (process.env.CRAVE_TRACE === true || process.env.CRAVE_TRACE.toLowerCase() === "true")),
    error =  (! (process.env.CRAVE_ERROR && (process.env.CRAVE_ERROR === false || process.env.CRAVE_ERROR.toLowerCase() === "false")));
    defaultConfig = { 
      cache: { 
        enable: false,
        path: path.resolve(__dirname, "../../data/cache.json")
      },
      debug: debug,
      error: error,
      identification: { 
        type: 'string', 
        identifier: '~>' 
      },
      trace: trace
    };


describe('Config', function() {
  var config = crave.getConfig();

  it('is an object and is defined.', function() {
    assert.equal(_.isObject(config), true);
  });

  it('has the required properties', function() {
    config.should.have.property('cache');
    assert.equal(_.isObject(config["cache"]), true);
    config["cache"].should.have.property('enable');
    config["cache"].should.have.property('path');
    config.should.have.property('debug');
    config.should.have.property('trace');
    config.should.have.property('error');
    config.should.have.property('identification');
    assert.equal(_.isObject(config["identification"]), true);
    config["identification"].should.have.property('type');
    config["identification"].should.have.property('identifier');
  });

  it('default values should be correct.', function() {
    assert.equal(config["cache"]["enable"], defaultConfig.cache.enable);
    config["cache"]["path"].should.be.ok
    assert.equal(config["debug"], defaultConfig.debug);
    assert.equal(config["trace"], defaultConfig.trace);
    assert.equal(config["error"], defaultConfig.error);
    assert.equal(config["identification"]["type"], defaultConfig.identification.type);
    assert.equal(config["identification"]["identifier"], defaultConfig.identification.identifier);
  });

  it('setConfig() and getConfig() should return the same object', function() {
    var setConfigObj = crave.setConfig({});
    var getConfigObj = crave.getConfig({});

    assert.equal(_.isEqual(setConfigObj,getConfigObj), true);
  });

  it('should return a valid log object', function() {
    // Get the current log object.
    var configObject = crave.setConfig(config),
        log = Config.getLog();

    // Validate the log object returned.    
    log.should.be.ok;
    assert.equal(log.debug, configObject.debug);
    assert.equal(log.trace, configObject.trace);
    assert.equal(log.error, configObject.error);

    // Toggle debug mode.
    configObject = crave.setConfig({debug: ! config.debug});
    log = Config.getLog();

    // Validate the new log object returned.
    log.should.be.ok;
    assert.equal(log.debug, configObject.debug);
    assert.equal(log.trace, configObject.trace);
    assert.equal(log.error, configObject.error);

    // Reset any changes we made.
    crave.setConfig(config);
  });

  describe('default properties can be overridden.  ', function() {
    var modifiedConfig;

    it('Enable caching for all required files', function() {
      crave.setConfig({ cache: { enable: true } });
      modifiedConfig = crave.getConfig();
      assert.equal(modifiedConfig["cache"]["enable"], true);
      config["cache"].should.have.property('path');
      crave.setConfig(config);
    });

    it('Disable caching for all required files', function() {
      crave.setConfig({ cache: { enable: false } });
      modifiedConfig = crave.getConfig();
      assert.equal(modifiedConfig["cache"]["enable"], false);
      config["cache"].should.have.property('path');
      crave.setConfig(config);
    });

    it('Change cache path', function() {
      var tempPath = path.resolve(__dirname, "../../data/cache1.json");
      crave.setConfig({ cache: { path: tempPath } });
      modifiedConfig = crave.getConfig();
      assert.equal(modifiedConfig["cache"]["enable"], false);
      config["cache"].should.have.property('path');
      assert.equal(modifiedConfig["cache"]["path"], tempPath);
      crave.setConfig(config);
    });

    it('Change cache path to an invalid location', function() {
      crave.setConfig({ cache: { path: undefined } });
      modifiedConfig = crave.getConfig();
      assert.equal(modifiedConfig["cache"]["enable"], false);
      config["cache"].should.have.property('path');
      assert.notEqual(modifiedConfig["cache"]["path"], undefined);
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

    it('New properties can be added to the config object', function() {
      var expectedConfigObject = config;
      expectedConfigObject["myNewBoolean"] = true;
      expectedConfigObject["myNewObject"] = { myNewArray: [ "a", "b", "c"] };
      var configObject = crave.setConfig({ myNewBoolean: true, myNewObject: { myNewArray: [ "a", "b", "c"] } });

      assert.equal(_.isEqual(expectedConfigObject, configObject), true);
      crave.setConfig(config);
    });

    it('Properties can be removed from the config object', function() {
      // Add new items to the configuration object.
      var expectedConfigObject = config;
      expectedConfigObject["myNewBoolean"] = true;
      expectedConfigObject["myNewObject"] = { myNewArray: [ "a", "b", "c"] };
      var configObject = crave.setConfig({ myNewBoolean: true, myNewObject: { myNewArray: [ "a", "b", "c"] } });
      assert.equal(_.isEqual(expectedConfigObject, configObject), true);
      configObject["myNewBoolean"].should.be.ok;
      configObject["myNewObject"].should.be.ok;

      // Make the new items invalid so they will be removed when merged.
      configObject.myNewBoolean = undefined;
      configObject.myNewObject = undefined;

      // Create the new config object.
      var newConfigObject = crave.setConfig(configObject);

      // Ensure the invalid items were removed from the merged config object.
      assert.equal("myNewBoolean" in newConfigObject, false);
      assert.equal("myNewObject" in newConfigObject, false);

      // Undo any changes we made.
      crave.setConfig(config);
    });

    it('Properties with null will not be removed from the config object', function() {
      // Add new items to the configuration object.
      var expectedConfigObject = config;
      expectedConfigObject["myNewBoolean"] = true;
      expectedConfigObject["myNewObject"] = { myNewArray: [ "a", "b", "c"] };
      var configObject = crave.setConfig({ myNewBoolean: true, myNewObject: { myNewArray: [ "a", "b", "c"] } });
      assert.equal(_.isEqual(expectedConfigObject, configObject), true);
      configObject["myNewBoolean"].should.be.ok;
      configObject["myNewObject"].should.be.ok;

      // Make the new items null.
      configObject.myNewBoolean = null;
      configObject.myNewObject = null;

      // Create the new config object.
      var newConfigObject = crave.setConfig(configObject);

      // Ensure the invalid items were removed from the merged config object.
      assert.equal("myNewBoolean" in newConfigObject, true);
      assert.equal(newConfigObject["myNewBoolean"], null);
      assert.equal("myNewObject" in newConfigObject, true);
      assert.equal(newConfigObject["myNewObject"], null);

      // Undo any changes we made.
      crave.setConfig(config);
    });

  });

});


var assert = require("assert"),
    crave = require('../../libs/index.js');
    debug = false,
    fs = require("fs"),
    path = require("path"),
    pathToExampleApp = path.resolve(__dirname, "../app"),
    should = require("should"),
    _ = require("lodash");

describe('Cache', function() {

  it('should be created if enabled', function(done) {
    crave.setConfig({ cache: { enable: true }, debug: debug });

    var callback = function(err) {
      if(err) {
        done(err);
      } else {
        var config = crave.getConfig();
        assert.equal(fs.existsSync(config.cache.path), true);
        done();
      }
    }

    crave.directory(pathToExampleApp, ["model", "controller"], callback, undefined, {});
  });
  
  it('should be removed if disabled', function() {
    var config = crave.setConfig({ cache: { enable: false }, debug: debug });
    assert.equal(fs.existsSync(config.cache.path), false);
  });


  it('should be removed if we clear the cache', function(done) {
    crave.setConfig({ cache: { enable: true }, debug: debug });

    var callback = function(err, files) {
      if(err) {
        done(err);
      } else {
        var config = crave.getConfig();
        assert.equal(fs.existsSync(config.cache.path), true);
        
        crave.clearCache(function(err) {
          if(err) {
            done(err);
          } else {
            assert.equal(fs.existsSync(config.cache.path), false);
            done();
          }
        });
      }
    }

    crave.directory(pathToExampleApp, ["model", "controller"], callback, undefined, {});
  });
});
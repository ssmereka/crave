var assert = require("assert"),
    crave = require('../../libs/index.js'),
    fs = require("fs"),
    path = require("path"),
    pathToExampleApp = path.resolve(__dirname, "../app"),
    should = require("should"),
    _ = require("lodash");


var cacheData = {
  "directory": pathToExampleApp,
  "files": [
    path.resolve(pathToExampleApp, "users/users_model.js"),
    path.resolve(pathToExampleApp, "users/users_controller.js")
  ]
}


describe('Cache', function() {

  it('should be created if enabled', function(done) {
    crave.setConfig({ cache: { enable: true } });

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

  it('should have the correct data', function(done) {
    var config = crave.getConfig();
    fs.readFile(config.cache.path, 'utf8', function(err, data){
      if(err) {
        return done(err);
      }

      try {
        cache = JSON.parse(data);
        cache = cache[0];
      } catch(err) {
        return done(err);
      }

      assert.equal(_.isObject(cache), true);
      assert.equal(cache["directory"], pathToExampleApp);
      assert.equal(_.isArray(cache["files"]), true);
      assert.equal(_.isEqual(cache["files"], cacheData.files), true);

      return done();
    });
  });

  it('should never change once created', function(done) {
    var callback = function(err) {
      if(err) {
        done(err);
      } else {
        var config = crave.getConfig();
        fs.readFile(config.cache.path, 'utf8', function(err, data){
          if(err) {
            return done(err);
          }

          try {
            cache = JSON.parse(data);
            cache = cache[0];
          } catch(err) {
            return done(err);
          }

          assert.equal(_.isObject(cache), true);
          assert.equal(cache["directory"], pathToExampleApp);
          assert.equal(_.isArray(cache["files"]), true);
          assert.equal(_.isEqual(cache["files"], cacheData.files), true);

          return done();
        });
      }
    }

    crave.directory(pathToExampleApp, ["controller"], callback, undefined, {});
  });

  it('should be removed if disabled', function() {
    var config = crave.setConfig({ cache: { enable: false } });
    assert.equal(fs.existsSync(config.cache.path), false);
  });

  it('should be removed if we clear the cache', function(done) {
    crave.setConfig({ cache: { enable: true } });

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

  describe('using filenames for identification.', function() {

    it('should be created if enabled', function(done) {
      crave.setConfig({ cache: { enable: true }, identification: { type: "filename", identifier: "_" } });

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

    it('should have the correct data', function(done) {
      var config = crave.getConfig();
      fs.readFile(config.cache.path, 'utf8', function(err, data){
        if(err) {
          return done(err);
        }

        try {
          cache = JSON.parse(data);
          cache = cache[0];
        } catch(err) {
          return done(err);
        }

        assert.equal(_.isObject(cache), true);
        assert.equal(cache["directory"], pathToExampleApp);
        assert.equal(_.isArray(cache["files"]), true);
        assert.equal(_.isEqual(cache["files"], cacheData.files), true);

        return done();
      });
    });


    it('should be removed if disabled', function() {
      var config = crave.setConfig({ cache: { enable: false } });
      assert.equal(fs.existsSync(config.cache.path), false);
    });
  });

});
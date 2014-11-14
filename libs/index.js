var fs = require('fs'),
    mkdirp = require('mkdirp'),
    path = require('path');

var CONFIG,
    CACHE = [],
    DEBUG = true;    // When enabled additional log messages are shown.

var log;

/* ************************************************** *
 * ******************** Cache
 * ************************************************** */

var cacheExample = [
  {
    directory: "/Path/To/My/Directory",
    files: [
      "/Path/To/A/File.js",
      "/Path/To/Another/File.js"
    ]
  }
];


/* ************************************************** *
 * ******************** Constructor
 * ************************************************** */

/**
 * Create a new instance of Crave.  You can configure
 * Crave by passing in an optional configuration object.
 * @param config is a full or partial configuration object.
 * @constructor
 */
var Crave = function(config) {
  handleCraveConfig(config);
};


/* ************************************************** *
 * ******************** Config
 * ************************************************** */

/**
 * Default configuration object containing default values
 * that can be overridden.
 */
var defaultConfig = {
  cache: {                                                // Values related to caching a list of files to require.
    enable: false,                                        // When true, the files you require are stored to disk to increase performance.
    path: path.resolve(__dirname, "../data/cache.json")   // Path to the file used to store the cache.
  },
  debug: false,                                           // When true, additional logs are displayed.
  identification: {                                       // Variables related to how to find and require files are stored here.
    type: "string",                                     // How to find files.  Available options: 'string', 'filename'
    identifier: "~>"                                    // How to identify the files.
  }
};

/**
 * Handle a change in the configuration object.
 * @param config is the new configuration object.
 */
var handleCraveConfig = function(config) {
  CONFIG = (config) ? deepPriorityMergeSync(config, defaultConfig) : defaultConfig;
  DEBUG = (CONFIG.debug);
  log = new Log(CONFIG.debug);
};

/**
 * Merge two objects attributes into a single object.
 * This will do a deep merge, meaning that if both objects 
 * contain an attribute that is also an object, then they 
 * will be merged as well.  This will give all priorty to
 * the first object, meaning if both objects have the same 
 * attribute, the first object's value will be preserved
 * while the second-object's value is not.
 */
var deepPriorityMergeSync = function(obj1, obj2) {
  var result = {};

  // Loop through all the attributes in the first object.
  for(var key in obj1) {
    
    // If obj1's property is an object and not an array
    if(obj1.hasOwnProperty(key) && obj1[key] !== null && typeof obj1[key] === 'object' && ! (obj1[key] instanceof Array)) {     
      
      // And obj2's attribute with the same key is also an object.
      if(obj2.hasOwnProperty(key) && obj2[key] !== null && typeof obj2[key] === 'object') {
        // recurse and merge those objects as well.
        result[key] = deepPriorityMergeSync(obj1[key], obj2[key]);
      } else {
        // Otherwise store the object in the result.
        result[key] = obj1[key];
      }
    } else {
      // If the attribute is not an object, store it in the results.
      result[key] = obj1[key];
    }
  }

  // Loop through and add all the attributes in object 2 that
  // are not already in object 1.
  for(i in obj2) {
    if(obj2.hasOwnProperty(i)) {
      // If the attribute is already in the result, skip it.
      if(i in result) {
        continue;
      }

      // Add the new attribute to the result object.
      result[i] = obj2[i];
    }
  }

  return result;
}


/* ************************************************** *
 * ******************** Cache
 * ************************************************** */

/**
 * Retrieve the cached json data from the file specified by the config object.
 * An error and/or cache is returned to the callback.
 * @param cb is a callback method where the result and/or error is returned.
 */
var loadCache = function(config, cb) {
  if( ! config.cache || ! config.cache.enable) {
    //return cb(new Error("Load Cache Error:  cache is not enabled."));
    log.t("\nLoad Cache: Cache only found in memory.\nCache Value: %s\n", JSON.stringify(CACHE, undefined, 2));
    return cb(undefined, CACHE);
  }

  if(! config.cache.path) {
    return cb(new Error("Invalid cache path."));
  }

  if( ! fs.existsSync(config.cache.path)) {
    log.t("\nLoad Cache: Cache not yet saved to disk, loading from memory.\nCache Value: %s\n", JSON.stringify(CACHE, undefined, 2));
    return cb(undefined, CACHE);
  }

  fs.readFile(config.cache.path, 'utf8', function(err, data){
    if(err) {
      return cb(err);
    }

    try {
      cache = JSON.parse(data);
    } catch(err) {
      return cb(err);
    }

    log.t("\nLoad Cache: Loaded from disk.\nCache Value: %s\n", JSON.stringify(cache, undefined, 2));
    return cb(err, cache, true);
  });
};

/**
 * Updates the global cache value and persist the cache to disk if the
 * caching option is enabled in the config.  An error and/or cache is
 * returned to the callback.
 * @param cache is the json cache object to be persisted.
 * @param cb is a callback method where the result and/or error is returned.
 */
var saveCache = function(cache, cb) {
  CACHE = cache;

  if( ! CONFIG.cache || ! CONFIG.cache.enable) {
    //return cb(new Error("Load Cache Error:  cache is not enabled."));
    log.t("\nSave Cache: Updated in memory. \n%s\n", JSON.stringify(cache, undefined, 2));
    return cb(undefined, cache)
  }

  if(! CONFIG.cache.path) {
    return cb(new Error("Invalid cache path."));
  }

  mkdirp(CONFIG.cache.path.substring(0, CONFIG.cache.path.lastIndexOf('/')), function(err) {
    if(err) {
      return cb(err);
    }

    fs.writeFile(CONFIG.cache.path, JSON.stringify(cache, undefined, 2), function(err) {
      if(err) {
        return cb(err);
      }

      log.t("Save Cache: Saved to disk\n%s\n", JSON.stringify(cache, undefined, 2));
      cb(undefined, cache, true);
    });
  });
};

var clearCache = function(cb) {
  if(CONFIG.cache && CONFIG.cache.path) {
    if(fs.exists(CONFIG.cache.path)) {
      fs.unlinkSync(CONFIG.cache.path);
    }
  }

  CACHE = [];
};

/**
 * Update a specific directory's list of files in the cache.
 * @param cache is the cache object to update.
 * @param directory is the directory to update.
 * @param files is an ordered array of file paths to require.
 * @param cb is a callback method where a result and/or error are returned.
 */
var updateDirectoryInCache = function(cache, directory, files, cb) {
  log.t("\nUpdate Directory In Cache: \t%s \n\tFiles: \t [ %s ]\n", directory, files);
  for(var i = 0; i < cache.length; i++) {
    if(_cache[i]["directory"] === directory) {
      cache[i] = files;
      return saveCache(cache, cb);
    }
  }

  cache.push({
    directory: directory,
    files: files
  });

  saveCache(cache, cb);
};

/**
 *
 * @param _cache
 * @param cb
 */
var createListFromCache = function(cache, cb) {
  var list = [];
  for(var y = 0; y < cache.length; y++) {
    for(var x = 0; x < cache[y]["files"].length; x++) {
      list.push(cache[y].files[x]);
    }
  }

  cb(undefined, list);
};

/* ************************************************** *
 * ******************** Logging
 * ************************************************** */

/**
 * Logs messages, if debug is enabled.
 * @param msg is the message to log.
 */
var Log = function (debug) {
  this.debug = debug;
  this.trace = debug;
  this.error = debug;
};

Log.prototype.d = function() {
  if(this.debug) {
    console.log.apply(this, arguments);
  }
};

Log.prototype.t = function() {
  if(this.trace) {
    console.log.apply(this, arguments);
  }
};

Log.prototype.e = function() {
  if(this.error) {
    console.log.apply(this, arguments);
  }
};


/* ************************************************** *
 * ******************** Private Methods
 * ************************************************** */

/**
 * Find all the files in a given directory and its subdirectories.  Perform an action
 * on all the files by calling the action parameter method for each file.
 * @param {String} directory is the absolute path to the root directory.
 * @param {Function} action is a method to be called for each file.
 * @param {Function} cb is a callback method where any results or errors will be returned to.
 */
var walkAsync = function(directory, action, cb) {
  if( ! directory) {
    return cb(new Error("Invalid directory value of '" + directory + "'"));
  }

  // Ensure the directory does not have a trailing slash.
  if(directory.substring(directory.length -1) === "/") {
    directory = directory.substring(0, directory.length -1);
  }

  // Get a list of all the files and folders in the directory.
  fs.readdir(directory, function(err, list) {
    if(err) {
      return cb(err, false);
    }

    // Create a count of the number of files and/or folders in the directory.
    var pending = list.length;

    // If we are at the end of the list, then return success!
    if( ! pending) {
      return cb(null, true);
    }

    // For each item in the list, perform an "action" and continue on.
    list.forEach(function(file) {

      // Check if the file is invalid; ignore invalid files.
      if(isFileInvalid(file)) {
        log.d("\tSkipping: " + directory + "/" + file);
        pending--;
        return cb(null, true);
      }

      // Add a trailing / and file to the directory we are in.
      file = directory + '/' + file;

      // Check if the item is a file or directory.
      fs.stat(file, function(err, stat) {
        if(err) {
          return cb(err, false);
        }

        // If a directory, add it to our list and continue walking.
        if (stat && stat.isDirectory()) {
          walkAsync(file, action, function(err, success) {
            if (!--pending) {
              cb(null, success);
            }
          });

          // If a file, perform the action on the file and keep walking.
        } else {
          action(file, function(err) {
            if(err) {
              cb(err, false);
            }

            if (!--pending) {
              cb(null, true);
            }
          });
        }
      });
    });
  });
};

/**
 * Checks if the file should be required or if the
 * folder should be searched for files to require.
 * This is a helper function of WalkAsync.
 * @param {String} file is a file name to be validated.
 */
var isFileInvalid = function(file) {

  // List of invalid file and folder names.  Names must be in lower case.
  var invalidFiles = ["node_modules"];

  // Skip all hidden files, aka those that begin with a .
  if(file.substring(0,1) === ".") {
    return true;
  }

  // Skip all files and folders in the invalid file array.
  for(var i = 0; i < invalidFiles.length; i++) {
    if(file.toLowerCase().indexOf(invalidFiles[i]) != -1) {
      return true;
    }
  }

  return false;
};


var buildDirectoryList = function(directory, types, cb) {
  log.t("Build Directory List: \n\tDirectory:\t%s\n\tTypes: \t\t[ %s ]\n", directory, types);
  
  var lists = [];
  for(var i = 0; i < types.length; i++) {
    lists[i] = [];
  };

  walkAsync(directory, function(file, cb) {
    log.t("\tChecking File: %s", file);
    switch(CONFIG.identification.type) {
      default:
      case 'string':
        fs.readFile(file, 'utf8', function(err, data) {
          // Check if the file contains a route tag.
          for(var i = 0; i < types.length; i++) {
            // If it contains a route tag, then add it to the list of files to require.
            if(data.toLowerCase().indexOf(CONFIG.identification.identifier + " " + types[i]) != -1) {
              lists[i].push(file);
              return cb();
            }
          }
          log.t("\tSkipping File: %s", file);
          return cb();
        });
        break;
      case 'filename':
        var fileName = file.substring(file.lastIndexOf('/')+1);
        for(var i = 0; i < types.length; i++) {
          if(fileName.toLowerCase().indexOf(CONFIG.identification.identifier + types[i]) != -1) {
            lists[i].push(file);
            return cb();
          }
        }
        log.t("\tSkipping File: %s", file);
        return cb();
        break;
    }
  }, function(err, success) {
    if(err) {
      return cb(err);
    }
    var list = [];
    for(var y = 0; y < lists.length; y++) {
      for(var x = 0; x < lists[y].length; x++) {
        list.push(lists[y][x]);
      }
    }
    updateDirectoryInCache(CACHE, directory, list, cb);
  });
};

/**
 * Attempt to require an ordered list of files and return a list
 * of files that were successfully required.
 * @param list is an ordered array of absolute paths to files to be required.
 * @param cb is a callback method where the result and/or error will be returned.
 */
var requireFiles = function(_list, _cb) {
  log.t("Require Files: \t[ %s ]\n", _list);
  var list = _list,
      cb = _cb;

  var _arguments = arguments;
  var _this = this;

  for(var i = 2; i < Object.keys(_arguments).length; i++) {
    if(_arguments[i]) {
      _arguments[i-2] = _arguments[i];
      delete _arguments[i];
    }
  }

  for (var i = 0; i < list.length; i++) {
    // Don't try to load a file you can't.
    if (list[i] === undefined || list[i] === '') {
      log("Can't require a file with path undefined.");
      list.splice(i, 1);
      i--;
      continue;
    }

    // Make sure there is a '/' at the start of the path.
    list[i] = (list[i].substring(0, 1) === '/') ? list[i] : '/' + list[i];
    if (!fs.existsSync(list[i])) {
      log("Can't require a file that doesn't exist.");
      list.splice(i, 1);
      i--;
      continue;
    }

    log.d("\tRequire: " + list[i]);
    require(list[i]).apply(_this, _arguments);
  }

  cb(undefined, list);
};

var loadDirectory = function(_directory, _types, _cb) {
  var cb = _cb,
      directory = _directory,
      types = _types;

  var _arguments = arguments;
  var _this = this;

  for(var i = 3; i < Object.keys(_arguments).length; i++) {
    if(_arguments[i]) {
      _arguments[i-1] = _arguments[i];
      delete _arguments[i];
    }
  }

  loadCache(CONFIG, function(err, cache) {
    if(err) {
      return cb(err);
    }

    if(cache["directory"]) {
      createListFromCache(cache, function (err, files) {
        _arguments[0] = files;
        _arguments[1] = cb;
        requireFiles.apply(null, _arguments);
      });
    } else {
      buildDirectoryList(directory, types, function (err, cache) {
        createListFromCache(cache, function (err, files) {
          _arguments[0] = files;
          _arguments[1] = cb;
          requireFiles.apply(null, _arguments);
        });
      });
    }
  });
};

var loadDirectories = function() {

};

var requireFile = function(_file, _cb) {
  var cb = _cb,
      file = _file;

  var _arguments = arguments;
  var _this = this;

  for(var i = 2; i < Object.keys(_arguments).length; i++) {
    if(_arguments[i]) {
      _arguments[i-2] = _arguments[i];
      delete _arguments[i];
    }
  }
  require(file).apply(_this, _arguments);
  cb(undefined, [ file ]);
};

/* ************************************************** *
 * ******************** Public API
 * ************************************************** */

Crave.prototype.directory = loadDirectory;
Crave.prototype.directories = loadDirectory;
Crave.prototype.files = requireFiles;
Crave.prototype.file = requireFile;

Crave.prototype.setConfig = handleCraveConfig;
Crave.prototype.clearCache = clearCache;

exports = module.exports = new Crave();
exports = Crave;
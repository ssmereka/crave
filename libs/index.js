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
    enable: true,                                         // When true, the files you require are stored to disk to increase performance.
    path: path.resolve(__dirname, "../data/cache.json")   // Path to the file used to store the cache.
  },
  debug: true,                                            // When true, additional logs are displayed.
  identification: {                                       // Variables related to how to find and require files are stored here.
    type: "string",                                       // How to find files.  Available options: 'string', 'filename'
    identifier: "~>"                                      // How to identify the files.
  }
};

/**
 * Handle a change in the configuration object.
 * @param config is the new configuration object.
 */
var handleCraveConfig = function(config) {
  CONFIG = (config) ? mergeObjects(config, defaultConfig) : defaultConfig;
  DEBUG = (CONFIG.debug);
  log = new Log(CONFIG.debug);
};

/**
 * Combine two object's properties into a single object.  When
 * both objects contain the same property then the obj1's
 * property is copied and the obj2's property is disregarded.
 * @param obj1 is an object to merge and is given priority.
 * @param obj2 is the other object to merge.
 * @returns a single, merged, object.
 */
function mergeObjects(obj1, obj2) {
  for (var key in obj2) {
    if (obj1[key] === undefined)
      obj1[key] = obj2[key];
  }
  return obj1;
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
    return cb(undefined, CACHE);
  }

  if(! config.cache.path) {
    return cb(new Error("Invalid cache path."));
  }

  if( ! fs.existsSync(config.cache.path)) {
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

    return cb(err, cache);
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
    log.t("Save Cache: Updated in memory. \n%s", JSON.stringify(cache, undefined, 2));
    return cb(undefined, cache)
  }

  if(! CONFIG.cache.path) {
    return cb(new Error("Invalid cache path."));
  }


  console.log(CONFIG.cache.path.substring(0, CONFIG.cache.path.lastIndexOf('/')));
  mkdirp(CONFIG.cache.path.substring(0, CONFIG.cache.path.lastIndexOf('/')), function(err) {
    if(err) {
      return cb(err);
    }

    fs.writeFile(CONFIG.cache.path, JSON.stringify(cache, undefined, 2), function(err) {
      if(err) {
        return cb(err);
      }

      log.t("Save Cache: Saved to disk\n%s", JSON.stringify(cache, undefined, 2));
      cb(undefined, cache);
    });
  });
};

/**
 * Update a specific directory's list of files in the cache.
 * @param cache is the cache object to update.
 * @param directory is the directory to update.
 * @param files is an ordered array of file paths to require.
 * @param cb is a callback method where a result and/or error are returned.
 */
var updateDirectoryInCache = function(cache, directory, files, cb) {
  log.t("Update Directory In Cache: \t%s \n\tFiles: \t%s", directory, files);
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

/**
 * Require all files of the given types.  For example:
 * "types = [controller, error]" will load all controller
 * files and then all error files.
 *
 * Note: This function will walk through all the files in
 * the given folder and search each file a few times.
 * This is a lengthy operation so limit the amount of
 * calls to this function.
 */
var requireTypesInFolder = function(_folder, _types, _next) {
  var files = {};

  var folder = _folder;
  var types = _types;
  var next = _next;

  var _arguments = arguments;
  var _this = this;

  for(var i = 3; i < Object.keys(_arguments).length; i++) {
    if(_arguments[i]) {
      _arguments[i-3] = _arguments[i];
      delete _arguments[i];
    }
  }

  types = (types) ? types : [ "static", "model", "controller", "error", "tracker"];

  // Initialize the files object.
  for(var i = 0; i < types.length; i++) {
    files[i] = [];
  }

  log.d("Selecting folders to load from: ");
  log.d("\tDirectory: " + folder);

  // Walk through all the files in the directory.
  walkAsync(folder, function(file, next) {
    fs.readFile(file, 'utf8', function(err, data) {

      // Check if the file contains a route tag.
      for(var i = 0; i < types.length; i++) {

        // If it contains a route tag, then add it to the list of files to require.
        if(data.toLowerCase().indexOf(routeTypeIdentifier + " " + types[i]) != -1) {
          files[i].push(file);
        }
      }
      next();
    });
  }, function(err, success){
    if(err || ! success) {
      next(err || new Error("There was a problem walking through the routes."));
    }

    // If successful, require all the files in the correct order.
    log.d("File Paths to Require: ");
    for(var key in files) {
      if(files.hasOwnProperty(key)) {
        files[key].forEach(function (file) {
          // Don't try to load a folder you can't.
          if (file === undefined || file === '') {
            return log.d("Can't require a file with path undefined.");
          }

          // Make sure there is a '/' at the start of the relative path.
          file = (file.substring(0, 1) === '/') ? file : '/' + file;
          if (!fs.existsSync(file)) {
            log.d("Can't require a file that doesn't exist.");
            return;
          }

          log.d("\tRequire: " + file);
          require(file).apply(_this, _arguments);
        });
      }
    }

    next(undefined, true);
  });
};


var buildDirectoryList = function(directory, types, cb) {
  log.t("Build Directory List: \n\tDirectory:\t%s\n\tTypes: \t\t[ %s ]", directory, types);
  var list = [];
  walkAsync(directory, function(file, cb) {
    list.push(file);
    cb();
  }, function(err, success) {
    if(err) {
      return cb(err);
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
  log.t("Require Files: \n\t[ %s ]", _list);
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
    console.log("Cache: ");
    console.log(cache);

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
//Crave.prototype.createFileList = createFileList;

exports = module.exports = new Crave();
exports = Crave;
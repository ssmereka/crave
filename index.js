var fs = require('fs');

var debug = false;
var routeTypeIdentifier = "~>";

/**
 * Logs messages, if debug is enabled.
 * @param msg is the message to log.
 */
var log =  function(msg) {
  if(debug) {
    console.log(msg);
  }
};

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
  //console.log(directory);

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
        log("\tSkipping: " + directory + "/" + file);
        pending--;
        return;
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

  log("Selecting folders to load from: ");
  log("\tDirectory: " + folder);

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
    log("File Paths to Require: ");
    for(var key in files) {
      files[key].forEach(function(file) {
        // Don't try to load a folder you can't.
        if(file === undefined || file === '') {
          return log("Can't require a file with path undefined.");
        }

        // Make sure there is a '/' at the start of the relative path.
        file = (file.substring(0,1) === '/') ? file : '/' + file;
        if(! fs.existsSync(file)) {
          log("Can't require a file that doesn't exist.");
          return;
        }

        log("\tRequire: " + file);
        require(file).apply(_this, _arguments);
      });
    }

    next(undefined, true);
  });
};

exports.directory = requireTypesInFolder;

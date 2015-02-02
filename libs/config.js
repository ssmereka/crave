// Require modules and libs.
var defaultConfig = require("../config/config.js"),
    Log = require('./log.js');

// Local-Global variable instances.
var currentConfig = defaultConfig,
    log;

/**
 * Constructor for configuration lib.  Initalizes
 * the current configuration object and log.
 */
var Config = function(config) {
  setConfig(config || defaultConfig);
}

/**
 * Handle all the setup required when setting or changing
 * the config object.  
 * Returns the most current configuration object.
 */
var setConfig = function(config) {
  var err;

  if(log === undefined) {
    log = new Log();
  }

  if(config) {
    config = deepPriorityMergeSync(config, currentConfig);

    if(config["enabled"] === true && isPathValid(config["path"]) === false) {
      currentConfig = config;
      currentConfig.enabled = false;
      err = "Could not enable cache because path is invalid.";
    } else {
      currentConfig = config;
    }

    //console.log(config);

    log.setLogMode(config.debug, config.trace, config.error);
  }

  return currentConfig;
}

/**
 * Return the current log object.
 */
var getLog = function() {
  return log;
}

/**
 * Validate the path string to prevent issues where cache is
 * being generated and saved correctly, but the location is 
 * wrong.
 */
var isPathValid = function(path) {
  if(path === undefined || path === null || path === "undefined" || path === "null") {
    return false;
  }

  return true;
}

/**
 * Return the current configuration object.
 */
var getConfig = function() {
  return currentConfig;
}

/**
 * Merge two objects attributes into a single object.
 * This will do a deep merge, meaning that if both objects 
 * contain an attribute that is also an object, then they 
 * will be merged as well.  This will give all priorty to
 * the first object, meaning if both objects have the same 
 * attribute, the first object's value will be preserved
 * while the second-object's value is not.  If an attribute
 * is undefined, then it will be removed from the final 
 * config object.  Note that NaN, null, and other values will
 * not cause the property to be removed.
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
      // If the attribute is not an object and not undefined, store it in the results.
      if(obj1[key] !== undefined) {
        result[key] = obj1[key];
      }
    }
  }

  // Loop through and add all the attributes in object 2 that
  // are not already in object 1.
  for(i in obj2) {
    if(obj2.hasOwnProperty(i) && obj2[i] !== undefined) {
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

Config.prototype.defaultConfig = defaultConfig;
Config.prototype.deepPriorityMergeSync = deepPriorityMergeSync;
Config.prototype.setConfig = setConfig;
Config.prototype.getConfig = getConfig;
Config.prototype.getLog = getLog;

exports = module.exports = Config;
exports = Config;
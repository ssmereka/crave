var defaultConfig = require("../config/config.js"),
    currentConfig = defaultConfig;


var Config = function(config) {
  setConfig(config || defaultConfig);
}


var setConfig = function(config) {
  if(config) {
    currentConfig = deepPriorityMergeSync(config, currentConfig);
  }

  return currentConfig;
}

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

Config.prototype.defaultConfig = defaultConfig;
Config.prototype.deepPriorityMergeSync = deepPriorityMergeSync;
Config.prototype.setConfig = setConfig;
Config.prototype.getConfig = getConfig;

exports = module.exports = Config;
exports = Config;
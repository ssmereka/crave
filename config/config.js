var path = require("path");

var debug = (process.env.CRAVE_DEBUG && (process.env.CRAVE_DEBUG === true || process.env.CRAVE_DEBUG.toLowerCase() === "true")) ? true : false,
    trace = (process.env.CRAVE_TRACE && (process.env.CRAVE_TRACE === true || process.env.CRAVE_TRACE.toLowerCase() === "true")) ? true : false,
    error = (process.env.CRAVE_ERROR && (process.env.CRAVE_ERROR === false || process.env.CRAVE_ERROR.toLowerCase() === "false")) ? false : true;

/**
 * Makes the default configuration object available
 * when requiring the file.
 */
exports = module.exports = {
  
  // Holds values related to caching a list of files to be require.
  cache: {   

    // When true, the files you require are stored to disk to increase performance.                                             
    enable: false,  

    // Path to the file used to store the cache.                           
    path: path.resolve(__dirname, "../data/cache.json")   
  },

  // When true, additional logs are displayed by crave.
  debug: debug, 

  // When true, logs related to error messages are displayed by crave.
  error: error,

  // Holds variables related to how to find and require files are stored here.                                          
  identification: {                                       
    
    // How to find files.  Available options: 'string' and 'filename'
    type: "string",      

    // Pro to identify the files                               
    identifier: "~>"                                    
  },

  // When true, additional trace logs are displayed by crave.
  // Trace messages relate to the events or actions that occur.
  trace: trace
};
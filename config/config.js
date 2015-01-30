var path = require("path");

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

  // When true, additional logs are displayed.
  debug: false, 

  // Holds variables related to how to find and require files are stored here.                                          
  identification: {                                       
    
    // How to find files.  Available options: 'string' and 'filename'
    type: "string",      

    // Pro to identify the files                               
    identifier: "~>"                                    
  }
};
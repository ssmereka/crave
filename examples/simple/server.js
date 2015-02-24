// Load crave from the repository.
var crave = require('../../libs/index.js');
// or
// Load crave from an installed npm module
// var crave = require('crave');


var express = require('express'),
    mongoose = require('mongoose'),
    path = require('path');

var config = {
  //
  // Server configs can be placed here.
  // 
};

// Create an express application object.
var app = express();

// Method to connect to a MongoDB database.
var connect = function(callback) {
  mongoose.connect('mongodb://localhost/crave-example-simple');
  mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
  mongoose.connection.once('open', function() {
    callback(undefined, mongoose);
  });
};

// Method to connect to database and start the server.
var start = function(err, files) {
  if(err) return console.log(err);

  //console.log(files);

  connect(function(err) {
    if(err) return console.log(err);

    var server = app.listen(3000, function() {
      var serverInfo = this.address();
      var address = (serverInfo.address === "::") ? "localhost" : serverInfo.address;
      
      console.log("Listening on http://%s:%s", address, serverInfo.port);
    });
  });
};

// Folder to load (aka require) files from recursively. 
var folderToLoad = path.resolve("./app");

// An ordered list of types to load.  Files without a type defined or files with 
// types not in this list will not be loaded (aka required) by crave.
var types = [ "model", "controller" ];

// You can setup crave using a configuration object.
crave.setConfig({
  cache: {                    // Values related to caching a list of files to require.
    enable: false             // When true, the files you require are stored to disk to increase performance.  The cache, once created, will not be updated until you issue the crave.clearCache() command.
  },
  identification: {           // Variables related to how to find and require files are stored here.
    //type: "filename",         // Determines how to find files.  Available options are: 'string', 'filename'
    //identifier: "_"           // Determines how to identify the files.
  }
});

// Recursively load all files of the specified type(s) that are also located in the specified folder.
// When loading these files the application and configuration objects will be passed in as parameters.
// You can pass any number of parameters by continuing to overload the function below.  Finally the start server method
// will be called.
crave.directory(folderToLoad, types, start, app, config);
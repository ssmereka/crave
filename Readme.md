# Crave

Locate and require node components (controllers, models, etc) dynamically within your application.

**Current Status:** In Development.

# Getting Started

Install crave using npm and save it as a dependancy in your package.json.

```javascript
npm install crave --save
```

You can require Crave just like every other node.js module.

```javascript
var crave = require('crave');
```

Controllers, modules, and other files you wish to require before starting your server should be structured like this:

```javascript
// This is required by Crave to signify what type of file this is.
// ~> Controller

// Export a function whose parameters are global values needed by
// your controller logic.
module.exports = function (app, config) {

  // Place your controller logic inside this method.

  // An example route that sends "Hello"
  app.get('/', function (req, res, next) {
    res.send("Hello");
  });

};
```

You can now use crave to require your files dynamically in an order you specify, no matter where they are located.  You can also pass in the parameters needed by your files.

```javascript
var crave = require('crave'),
    express = require('express');

// Create an express application object.
var app = express();

// Create a method to start the server.
var startServerMethod = function(err) {
  if(err) {
    return console.log(err);
  }

  var server = app.listen(config.server.port, function() {
    var serverInfo = this.address();
    console.log("Listening on %s http://%s:%s", serverInfo.family, , serverInfo.address, serverInfo.port);
  });
}

// Recursively load all files of the "Controller" type that are also located in the specified folder.
// When loading these files the application and configuration objects will be passed in as parameters.
// You can pass any number of parameters into the files being loaded.  Finally the start server method
// will be called.
crave.directory("/path/to/my/app/files", [ "controller" ], startServerMethod, app, config);
```

# Documentation

All documentation can be found in the [wiki](https://github.com/ssmereka/crave/wiki).


###[MIT License](http://www.tldrlegal.com/license/mit-license "MIT License")

<a href="https://i.imgur.com/kUpVtGD.gif" target="_blank">![Crave Text and Logo](http://i.imgur.com/e8I1abL.jpg)</a>

<a href="https://travis-ci.org/ssmereka/crave" target="_blank"><img src="https://travis-ci.org/ssmereka/crave.svg" /></a>
<a href="https://david-dm.org/ssmereka/crave" target="_blank"><img src="https://david-dm.org/ssmereka/crave.svg" /></a>
<a href="http://badge.fury.io/js/crave" target="_blank"><img src="https://badge.fury.io/js/crave.svg" /></a>

Structure a node project your way with the ability to require models, controllers, or any file dynamically.

# <a target="_blank" href="http://i.imgur.com/zKkNNBh.jpg">WAT</a><a target="_blank" href="http://i.imgur.com/yJreqHM.png">?</a>
Let me explain.  Crave gives you the ability to structure your application's files any way you like without the burden of manually requiring each file's location.  Take these file structures for example:

<a href="http://i.imgur.com/Pc6Nj1E.gif" target="_blank"><img src="http://i.imgur.com/H3fBKMR.png"></a>

**Left**:  A common node application file structure where each folder is required dynamically.  This works great, but restricts where your files must be located.

**Right**: Crave allows you to move files where ever you like and will require them dynamically.  This grouping by feature makes related code easier to find and transfer between projects.

# Getting Started

Install Crave using npm and save it as a dependancy in your package.json.

```javascript
npm install crave --save
```

You can require Crave just like every other node.js module.

```javascript
var crave = require('crave');
```

Controllers, modules, and other files you wish to require before starting your server should be structured like this:

```javascript
// This is the Crave type, it tells crave when and 
// if to load this file.  You can use any text you want.
// ~> Controller

// Export a function whose parameters are global values 
// needed in the controller's logic.
module.exports = function (app, config) {

  // Place your controller logic inside this method.

  // An example route that sends "Hello"
  app.get('/', function (req, res, next) {
    res.send("Hello");
  });
};
```

Use Crave's directory method to require your files dynamically.  They will be required in the order you specify and will recieve the parameters you pass.

```javascript
var crave = require('crave'),
    express = require('express');

// Create an express application object.
var app = express();

// Create a method to start the server.
var startServerMethod = function(err) {
  if(err) return console.log(err);

  var server = app.listen(3000, function() {
    console.log("Listening on http://127.0.0.1:3000");
  });
}

// Define the directory where Crave will search for files in.
// Crave will do a recursive search, looking in children folders.
var directoryToLoad = '/path/to/my/app/files';

// Define an ordered list of file types for Crave to load.
// This is the Crave type we just talked about in the 
// earlier example:  " // ~> Controller "
var types = [ "controller" ];

// Crave will now load the files in the given directory with the specified types.
// Each file will recieve the application and configuration objects as parameters.
// You can pass any number of parameters into the files being loaded by continuing
// to overload the crave.driectory method.  Once Crave has loaded all the files
// the callback method will be called, aka startServerMethod.
crave.directory(directoryToLoad, types, startServerMethod, app, config);
```

# Cache

```//TODO: This feature works, but needs to be documented and tested.```

# Config
You can configure Crave using the ```setConfig(myConfigObject)``` method.  Pass along an object with any of the properties you wish to override.  For example:

```javascript
var crave = require('crave');
var express = require(express);

var app = express();

crave.setConfig({
  cache: {
    enable: true
  },
  debug: true,
  identification: {
    type: 'string',
    identifier: "(>^_^)>"
  }
})

crave.directory("/path/to/directory", [ "controller" ], function(err) { console.log(err || "success"), app);
```

The available properties are:

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| **cache** | Object |  | An object containing configuration properties related to file path caching. |
| **cache.enable** | Boolean | ```false``` | when true, the file path cache is used. | 
| **cache.path** | String | ```/data/cache.json``` | An absolute path to where the file path cache is stored or will be stored. |
| **debug** | Boolean | ```false``` | When true, Crave will display log messages. |
| **identification** | Object |  | An object containing configuration properties related to how files are recognized and grouped. |
| **identification.type** | String | ```string``` | Describes the method on each file to find an identifier.  Available options are ```string``` or ```filename```, where either the file is searched or a filename is searched looking for the identifier specified, respectively. |
| **identification.identifier** | String | ```~>``` | A unique string used to indicate the following string indicates the grouping name for a file. |


# Documentation

Further documentation can be found in the [wiki](https://github.com/ssmereka/crave/wiki).


###[MIT License](http://www.tldrlegal.com/license/mit-license "MIT License")

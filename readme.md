<a href="https://i.imgur.com/kUpVtGD.gif" target="_blank">![Crave Text and Logo](http://i.imgur.com/e8I1abL.jpg)</a>

<a href="https://nodei.co/npm/crave/" target="_blank"><img src="https://nodei.co/npm/crave.png?downloads=true&downloadRank=true"></a>

<a href="https://travis-ci.org/ssmereka/crave" target="_blank"><img src="https://travis-ci.org/ssmereka/crave.svg" /></a> <a href="https://david-dm.org/ssmereka/crave" target="_blank"><img src="https://david-dm.org/ssmereka/crave.svg" /></a> <a href="https://gratipay.com/ScottSmereka/" target="_blank"><img src="http://img.shields.io/gratipay/ScottSmereka.svg" /> <a href="https://codecov.io/github/ssmereka/crave?branch=master" target="_blank"><img src="https://codecov.io/github/ssmereka/crave/coverage.svg?branch=master" /></a>

# <a target="_blank" href="http://i.imgur.com/zKkNNBh.jpg">WAT</a><a target="_blank" href="http://i.imgur.com/yJreqHM.png">?</a>
Crave gives you the ability to structure your application's files any way you like without the burden of manually requiring each file's location.  Take these file structures for example:

<a href="http://i.imgur.com/Pc6Nj1E.gif" target="_blank"><img src="http://i.imgur.com/H3fBKMR.png"></a>

**Left**:  A common node application file structure where each folder is required dynamically.  This works great, but restricts where your files must be located.

**Right**: Crave allows you to move files where ever you like and will require them dynamically.  This grouping by feature makes related code easier to find and transfer between projects.






<a href="gettingStarted" />
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
var startServerMethod = function(err, filesRequired, returnValues) {
  if(err) return console.log(err);

  // A list of files that were required by crave, or where attempted to be
  // required by crave are listed in the filesRequired parameter.
  console.log(filesRequired);
  
  // A list of returned values, or errors, from each file required are located in the 
  // returnValues parameter.
  console.log(returnValues);

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

# Errors
There are two types of errors ```passive``` and ```blocking```.  A blocking error is typically non-recoverable or requires the server to respond in some way.  Where a passive error can be ignored, allowing the server to operate as normal or close to normal.

All errors are logged to the console by default and can be toggle off using the ```error``` flag in the Crave configuration object.

## Blocking Errors
If a blocking error occurs while requiring files crave will return the error instantly to the callback method provided.  Your server can then determine the best course of action.

```javascript
// ...
var startServerMethod = function(err) {
  if(err) return console.log(err);
}
// ...
crave.directory(directoryToLoad, types, startServerMethod, app, config);
```

## Passive Errors
If, for example, a file contains an error and as a result Crave fails to require the file, then a passive error would be generated.  Passive errors are passed to the callback method in the 3rd parameter, known as ```returnValues```.  Where ```returnValues``` is a list of values returned from each required file in the same order as the list of ```filesRequired```.

```javascript
// ...
var startServerMethod = function(err, filesRequired, returnValues) {
  if(err) return console.log(err);
  
  console.log(returnValues);
}
// ...
crave.directory(directoryToLoad, types, startServerMethod, app, config);
```

Instead of ```undefined``` or the expected return value you will instead see something like the following:

```json
{
  "error": "~/crave/examples/simple/app/error/errors_controller.js contains an error an therefore could not be required by Crave.",
  "stack": "TypeError: undefined is not a function\n    at requireFiles (~/crave/libs/index.js:450:32)\n    at ~/crave/libs/index.js:512:28\n    at createListFromCache (~/crave/libs/index.js:242:3)\n    at ~/crave/libs/index.js:506:11\n    at saveCache (~/crave/libs/index.js:111:12)\n    at updateDirectoryInCache (~/crave/libs/index.js:218:3)\n    at ~/crave/libs/index.js:402:5\n    at ~/crave/libs/index.js:304:15\n    at ~/crave/libs/index.js:316:15\n    at ~/crave/libs/index.js:371:22"
}
```


<a href="config" />
# Config
You can configure Crave using the ```setConfig(myConfigObject)``` method.  Pass along an object with any of the properties you wish to override.  For example:

```javascript
var crave = require('crave');
var express = require(express);

var app = express();

crave.setConfig({
  cache: {
    enable: true              // Enable caching of the list of files to require.
  },
  debug: true,                // Display log messages in crave.
  identification: {
    type: 'string',           // Search for a string after an identifier in each file.
    identifier: "(>^_^)>"     // The identifier preceding the string.  Example: (>^_^)> Controller
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
| **error** | Boolean | ```true``` | When true, Crave will display error log messages. |
| **identification** | Object |  | An object containing configuration properties related to how files are recognized and grouped. |
| **identification.type** | String | ```string``` | Describes the method on each file to find an identifier.  Available options are ```string``` or ```filename```, where either the file is searched or a filename is searched looking for the identifier specified, respectively. |
| **identification.identifier** | String | ```~>``` | A unique string used to indicate the following string indicates the grouping name for a file. |
| **trace** | Boolean | ```false``` | When true, Crave will display trace log messages. |


<a href="fileIdentification" />
# File Identification
You may have noticed that you can change how Crave identifies a file as a ```model```, ```controller```, or etc.  There are two ways to identify a file, either using a ```string``` of text in the file or by ```filename```.

<a href="fileIdentificationString" />
## String
When using the ```string``` option, crave will search all the text in every file looking for the unique identifier you specify.  Once an identifier is found the following string will be evaluated as a possible type (e.g. ```controller```).

String identification is the default for Crave and an example can be found in the [Getting Started](#gettingStarted) section.

<a href="fileIdentificationFilename" />
## Filename
When using the ```filename``` option, crave will search each filename for the unique identifier you specified.  Once an identifier is found the following characters will be evaluated as a possible type (e.g. ```controller```).

Crave can be configured to use filenames using the configuration object.  Here is an example:

```javascript
var crave = require('crave');
var express = require(express);

var app = express();

crave.setConfig({
  identification: {
    type: 'filename',
    identifier: "_"
  }
})

crave.directory("/path/to/directory", [ "model", "controller" ], function(err) { console.log(err || "success"), app);
```

Using the configuration described above the following file structure:

![](http://i.imgur.com/QrKzzXp.png)


Crave would generate a list of files to require that looks like this:

```
~/myproject/app/device/device_model.js
~/myproject/app/user/user_model.js
~/myproject/app/device/device_controller.js
~/myproject/app/user/user_controller.js
```




<a href="cache" />
# Cache
Searching for files or inside files can take some time.  In a development environment this time is negligible, however in a production environment we should avoid it.  So when in production you should enable the cache.

```
crave.setConfig({
  cache: {
    enable: true
  }
});
```

Once the cache is enabled and ```crave.directory()``` is called, then crave will save the ordered list of files to a file.  After that each time ```crave.directory()``` is called the same list of files will be required until it is cleared, even if the server is restarted or new files are added.  

<a href="clearCache" />
## Clear Cache
Crave can of course delete the cache using the ```clearCache()``` method.  Once the cache is deleted, a new list will be generated and saved the next time ```crave.directory()``` is called.  Lets look at an example:

```javascript
// Keeps track of how many time we have restarted the server.
var restartCounter = 0;

// Create a method to start the server.
var startServerMethod = function(err) {
  if(err) return console.log(err);

  var server = app.listen(3000, function() {
    console.log("Listening on http://127.0.0.1:3000");

    if(restartCounter < 1) {
      console.log("Restarting server for the " + restartCounter + " time."); // 1st

      // Increment the restart counter and restart the server
      restartCounter++;
      app.close();

      // Crave recognizes that the cache is enabled and already exists.  The cached
      // list is used to require all the files.  Even though we requested that "model"
      // also be included, they will not.
      crave.directory("/path/to/directory", [ "controller", "model" ], startServerMethod, app);
    } else if(restartCounter < 2) {
      console.log("Restarting server for the " + restartCounter + " time."); // 2nd

      // Increment the restart counter and restart the server
      restartCounter++;
      app.close();

      // Clear the cache
      crave.clearCache();

      // Crave recognizes that the cache is enabled and does not exist.  This triggers
      // crave to search for all the files to require and rebuild the cache.  This time
      // "model" will be included.
      crave.directory("/path/to/directory", [ "controller", "model" ], startServerMethod, app);
    }
  });
}

// Enable the cache for crave.
crave.setConfig({
  cache: {
    enable: true
  }
});

// Trigger crave to search for all the files to require.  Once found this ordered
// list will be saved to a file.  Once this file is created, it will never change
// until you tell crave to remove it.
crave.directory("/path/to/directory", [ "controller" ], startServerMethod, app);
```

<a href="cachePath" />
## Cache Path
The cache file is stored by default in the crave module folder at ```/data/cache.json```.  You can change this location by specifying an absolute path in the ```path``` property of the configuration object.

```
crave.setConfig({
  cache: {
    enable: true,
    path: "/Absolute/Path/To/Custom/Cache/File.json"
  }
})
```

<a href="debug" />
# Debug
Debugging crave can be done using the ```debug```, ```trace```, and ```error``` flags that can be toggled on/off using the config.  When enabling these flags additional logging will be enabled allowing you to find issues within Crave easier.


<a href="documentation" />
# Documentation

Further documentation can be found in the [wiki](https://github.com/ssmereka/crave/wiki).


<a href="license" />
### <a href="http://www.tldrlegal.com/license/mit-license" target="_blank">MIT License</a>

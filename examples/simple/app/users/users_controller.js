/* Crave Type  
   This is required by Crave to signify what type of file this is.
   You can name it what ever you want, as long as you reference it
   correctly when using Crave. 
*/
// ~> Controller

/* Export File
   Crave treats your files like a module by requiring them.  This allows you to 
   pass arguments along to your files.

   You can see that the express application object and a configuration 
   object have been based into each file.
*/
module.exports = function (app, config) {

  //
  // Place all your controller logic inside this method.
  //
  
  var db = require("mongoose");

  // Get the User schema from the database object.
  var User = db.model("User");

  // A route to find and return all users in the database.
  app.get('/users', function (req, res, next) {
    User.find().exec(function(err, users) {
      res.send(err || (( ! users || users.length == 0) ? undefined : users) || "There are no users in the database.");
    });
  });

  // A route to add an example user to the database.
  app.get('/users/addExample', function(req, res, next) {
    var user = new User({ username: "JohnSmith" });
    user.save();
    res.send(user);
  });

};
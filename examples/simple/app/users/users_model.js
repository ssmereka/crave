/* Crave Type  
   This is required by Crave to signify what type of file this is.
   You can name it what ever you want, as long as you reference it
   correctly when using Crave. 
*/
// ~> Model

/* Export File
   Crave treats your files like a module by requiring them.  This allows you to 
   pass arguments along to your files.

   You can see that the express application object and a configuration 
   object have been based into each file.
*/
module.exports = function(app, config) {
   
  //
  // Place all your model logic inside this method.
  //

  var db = require("mongoose");

  // Define the user schema in the database.
  var User = new db.Schema({
    username: String,
    passwordHash: String
   });

  // Export the user schema into the database object.
  db.model('User', User);
};
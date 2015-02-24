// ~> Controller

// This file can be used to simulate a user-driven error in Crave. By
// not exporting a function, this controller cannot be required properly
// by Crave.  Instead of crashing, Crave should throw a user friendly message.
//
// To simulate this error, comment out the line below and start the server.

module.exports = function (app, config) { }

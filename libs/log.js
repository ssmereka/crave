/* ************************************************** *
 * ******************** Logging
 * ************************************************** */

/**
 * Logs messages, if debug is enabled.
 * @param msg is the message to log.
 */
var Log = function (debug) {
  this.debug = debug;
  this.trace = debug;
  this.error = debug;
};

Log.prototype.d = function() {
  if(this.debug) {
    console.log.apply(this, arguments);
  }
};

Log.prototype.t = function() {
  if(this.trace) {
    console.log.apply(this, arguments);
  }
};

Log.prototype.e = function() {
  if(this.error) {
    console.log.apply(this, arguments);
  }
};

exports = module.exports = Log;
exports = Log;
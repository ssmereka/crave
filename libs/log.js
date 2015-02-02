/**
 * Logs messages, if debug is enabled.
 * @param msg is the message to log.
 */
var Log = function (debug, trace, error) {
  this.setLogMode((debug === true || debug === false) ? debug : process.env.CRAVE_DEBUG, trace, error);
};

/**
 * Enable or Disable debug mode for the logger.
 * This will toggle the display of all logs.
 */
Log.prototype.setLogMode = function(debug, trace, error) {
  debug = (debug === true || debug === false) ? debug : false;
  trace = (trace === true || trace === false) ? trace : debug; 
  error = (error === true || error === false) ? error : true; 

  this.debug = (debug);
  this.trace = (trace);
  this.error = (error);

  //if(debug) {
  //  this.t("Logging for debug, trace, and error messages enabled.");
  //}
}

Log.prototype.d = function() {
  if(this.debug) {
    if(arguments && arguments.length > 0) {
      arguments[0] = "[Crave Debug]: " + arguments[0];
    }
    console.log.apply(this, arguments);
  }
};

Log.prototype.t = function() {
  if(this.trace) {
    if(arguments && arguments.length > 0) {
      arguments[0] = "[Crave Trace]: " + arguments[0];
    }

    console.log.apply(this, arguments);
  }
};

Log.prototype.e = function() {
  if(this.error) {
    if(arguments && arguments.length > 0) {
      arguments[0] = "[Crave Error]: " + arguments[0];
    }

    console.log.apply(this, arguments);
  }
};

exports = module.exports = Log;
exports = Log;
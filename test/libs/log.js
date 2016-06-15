// Require modules and libs.
var assert = require("assert"),
    Log = require("../../libs/log.js"),
    should = require("should"),
    _ = require("lodash");

var debug = (process.env.CRAVE_DEBUG && (process.env.CRAVE_DEBUG === true || process.env.CRAVE_DEBUG.toLowerCase() === "true")) ? true : false,
    trace = (process.env.CRAVE_TRACE && (process.env.CRAVE_TRACE === true || process.env.CRAVE_TRACE.toLowerCase() === "true")) ? true : false,
    error = (process.env.CRAVE_ERROR && (process.env.CRAVE_ERROR === false || process.env.CRAVE_ERROR.toLowerCase() === "false")) ? false : true;


/*
function doesLogMessage(method, value, message, cb) {
  var oldLog = console.log.apply,
      result = false;

  console.log.apply = function(s) {
    if (s == message) {
      result = true;
    }

    
    //cb(undefined, result);
  };

  method(value);

  console.log.apply = oldLog;
  return result;
}*/

describe('Log', function() {

  it('constructor should initalize default attributes properly', function() {
    var log = new Log();
    
    log.should.be.ok;
    log.debug.should.be.eql(debug);
    log.trace.should.be.eql(trace);
    log.error.should.be.eql(error);
  });

  it('constructor should initalize it\'s attributes properly', function() {
    var log = new Log(true, true, false);

    log.should.be.ok;
    log.debug.should.be.true;
    log.trace.should.be.true;
    log.error.should.be.false;
  });

  it('method setLogMode() should reinitalize attributes properly', function() {
    var log = new Log(true, true, true);

    log.should.be.ok;
    log.debug.should.be.true;
    log.trace.should.be.true;
    log.error.should.be.true;

    log.setLogMode(false, false, false);

    log.should.be.ok;
    log.debug.should.be.false;
    log.trace.should.be.false;
    log.error.should.be.false;
  });

  it('an error message when an log.e is called and config.error is true', function() {
    var consoleLog = console.log,
        log = new Log(true, true, true),
        value;

    console.log = function(message) {
      value = message;
    }

    log.e("test error");
    console.log = consoleLog;
    assert.equal("[Crave Error]: test error", value);    
  });

  it('nothing when log.e is called and config.error is false', function() {
    var consoleLog = console.log,
        log = new Log(true, true, false),
        value;

    console.log = function(message) {
      value = message;
    }

    log.e("test error");
    console.log = consoleLog;
    assert.equal(undefined, value);    
  });

  it('a trace message when log.t is called and config.trace is true', function() {
    var consoleLog = console.log,
        log = new Log(true, true, true),
        value;

    console.log = function(message) {
      value = message;
    }

    log.t("test trace");
    console.log = consoleLog;
    assert.equal("[Crave Trace]: test trace", value);    
  });

  it('nothing when log.t is called and config.trace is false', function() {
    var consoleLog = console.log,
        log = new Log(true, false, true),
        value;

    console.log = function(message) {
      value = message;
    }

    log.t("test error");
    console.log = consoleLog;
    assert.equal(undefined, value);    
  });

  it('a debug message when log.d is called and config.debug is true', function() {
    var consoleLog = console.log,
        log = new Log(true, true, true),
        value;

    console.log = function(message) {
      value = message;
    }

    log.d("test debug");
    console.log = consoleLog;
    assert.equal("[Crave Debug]: test debug", value);    
  });

  it('nothing when log.d is called and config.debug is false', function() {
    var consoleLog = console.log,
        log = new Log(false, true, true),
        value;

    console.log = function(message) {
      value = message;
    }

    log.d("test debug");
    console.log = consoleLog;
    assert.equal(undefined, value);    
  });

});
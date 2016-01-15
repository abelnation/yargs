'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ArgConsumer = require('./arg-consumer');

var Parser = function () {
  function Parser(context) {
    _classCallCheck(this, Parser);

    this.context = context;
  }

  _createClass(Parser, [{
    key: 'parse',
    value: function parse(argv, cb) {
      // argv can be a string, an array, or an ArgConsumer
      // regardless, we ensure argv ends up as an ArgConsumer
      argv = ArgConsumer.cleanArgv(argv);

      var lastContext = this;
      var result = { _: [] };

      // parse args, relying on helpers to parse different arg types
      while (argv.hasNext()) {
        // peek at first to help determine type of arg
        var next = argv.peek();

        if (/^--$/.test(next)) {
          // When '--' is encountered, stop analyzing and push rest of args
          // on to _ arg array
          argv.next();
          result._ = result._.concat(argv.next(argv.numRemaining()));
        } else if (/^--/.test(next)) {
          this.consumeLongFormOption(next, argv, result);
        } else if (/^-/.test(next)) {
          // ArgConsumer ensures all short options are split apart
          // so we can safely consume an arg once per short option
          this.consumeShortFormOption(next, argv, result);
        } else if (next in this.context.commands) {
          // let sub-command parse the rest, and merge results
          var subresult = this.consumeCommand(next, argv, result);
          lastContext = subresult.context;
          this.mergeResults(result, subresult.result);
        } else {
          this.consumeArg(next, argv, result);
        }
      }

      // assign default values
      this.fillInDefaults(result);

      var toReturn = {
        result: result,
        context: lastContext
      };

      if (cb) {
        return cb(null, toReturn);
      } else {
        return toReturn;
      }
    }

    // helper methods

  }, {
    key: 'consumeLongFormOption',
    value: function consumeLongFormOption(arg, argv, result) {
      var optionName = arg.replace(/^--/, '');
      this.consumeOption(optionName, argv, result);
    }
  }, {
    key: 'consumeShortFormOption',
    value: function consumeShortFormOption(arg, argv, result) {
      var optionName = arg.replace(/^-/, '');
      this.consumeOption(optionName, argv, result);
    }
  }, {
    key: 'consumeOption',
    value: function consumeOption(optionName, argv, result) {
      if (optionName in this.context.options) {
        var opt = this.context.options[optionName];
        var name = opt.name;
        var type = opt.type;

        if (type === TYPE_BOOLEAN) {
          this.consumeBoolean(name, argv, result);
        } else if (type === TYPE_COUNT) {
          this.consumeCount(name, argv, result);
        } else if (type === TYPE_STRING) {
          this.consumeString(name, argv, result);
        } else if (type === TYPE_NUMBER) {
          this.consumeNumber(name, argv, result);
        }
      } else {
        this.consumeBoolean(optionName, argv, result);
      }
    }
  }, {
    key: 'consumeCommand',
    value: function consumeCommand(commandName, argv, result) {
      if (!result.command) {
        result.command = commandName;
      } else {
        result.command += ' ' + commandName;
      }

      argv.next();

      var cmd = this.context.commands[commandName];
      return new Parser(cmd.context).parse(argv);
    }
  }, {
    key: 'consumeArg',
    value: function consumeArg(arg, argv, result) {
      // add to args
      result._.push(arg);
      argv.next();
    }
  }, {
    key: 'consumeNumber',
    value: function consumeNumber(optionName, argv, result) {
      var value = argv.peek(2)[1];
      if (!/^--/.test(value)) {
        result[optionName] = parseFloat(value);
        argv.next(2);
      } else {
        argv.next();
      }
    }
  }, {
    key: 'consumeCount',
    value: function consumeCount(optionName, argv, result) {
      if (optionName in result) {
        result[optionName] = result[optionName] + 1;
      } else {
        result[optionName] = 1;
      }
      argv.next();
    }
  }, {
    key: 'consumeString',
    value: function consumeString(optionName, argv, result) {
      var value = argv.peek(2)[1];
      if (!/^--/.test(value)) {
        result[optionName] = value;
        argv.next(2);
      } else {
        argv.next();
      }
    }
  }, {
    key: 'consumeBoolean',
    value: function consumeBoolean(optionName, argv, result) {
      result[optionName] = true;
      argv.next();
    }
  }, {
    key: 'fillInDefaults',
    value: function fillInDefaults(result) {
      for (var optName in this.context.optDefaults) {
        if (typeof result[optName] === 'undefined') {
          result[optName] = this.context.options[optName].defaultValue;
        }
      }
    }
  }, {
    key: 'mergeResults',
    value: function mergeResults(result, subresult) {
      // merge result with sub-command result
      result._ = result._.concat(subresult._);

      if (subresult.command) {
        result.command = result.command + Parser.COMMAND_DELIM + subresult.command;
      }

      for (var key in subresult) {
        if (key !== '_' && key !== 'command') {
          result[key] = subresult[key];
        }
      }
    }
  }]);

  return Parser;
}();

Parser.COMMAND_DELIM = ' ';

module.exports = Parser;
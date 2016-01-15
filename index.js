'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Completer = require('./lib/completer');
var Parser = require('./lib/parser');

var TYPE_STRING = 'string';
var TYPE_COUNT = 'count';
var TYPE_BOOLEAN = 'boolean';
var TYPE_NUMBER = 'number';

var YargsError = function (_Error) {
  _inherits(YargsError, _Error);

  function YargsError() {
    _classCallCheck(this, YargsError);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(YargsError).apply(this, arguments));
  }

  return YargsError;
}(Error);

var Yargs = function () {
  function Yargs() {
    _classCallCheck(this, Yargs);

    this.options = {};
    this.commands = {};
    this.optDefaults = {};
    this.requiredOpts = {};
  }

  // Main methods

  _createClass(Yargs, [{
    key: 'parse',
    value: function parse(argv, cb) {
      return new Parser(this).parse(argv, cb).result;
    }
  }, {
    key: 'complete',
    value: function complete(line, cb) {
      return new Completer(this).getCompletions(line, cb);
    }
  }, {
    key: 'usage',
    value: function usage() {
      // TODO: stub
      return this.usage;
    }

    // Configuration Methods

  }, {
    key: 'version',
    value: function version(_version) {
      this.version = _version;
      return this;
    }
  }, {
    key: 'usage',
    value: function usage(msg) {
      this.usage = msg;
      return this;
    }
  }, {
    key: 'nargs',
    value: function nargs(min, max) {
      if (typeof max === 'undefined') {
        max = min;
      }

      if (max < min) {
        throw new YargsError('max must be >= min');
      }

      this.nargsMin = min;
      this.nargsMax = max;

      return this;
    }
  }, {
    key: 'option',
    value: function option(name, config) {
      var demand = config.demand;
      var required = config.required;
      var desc = config.desc;
      var describe = config.describe;
      var description = config.description;
      var alias = config.alias;
      var choices = config.choices;
      var defaultValue = config.defaultValue;
      var type = config.type;
      var string = config.string;
      var boolean = config.boolean;
      var number = config.number;
      var count = config.count;

      // Create canonical option object

      var opt = {
        name: name,
        description: desc || describe || description,
        required: demand || required
      };

      if (opt.required) {
        this.requiredOpts[name] = true;
      }

      if (typeof alias === 'string') {
        opt.aliases = [name, alias];
      } else if ((typeof alias === 'undefined' ? 'undefined' : _typeof(alias)) === 'object') {
        opt.aliases = [name].concat(_toConsumableArray(alias));
      }

      if (typeof choices !== 'undefined') {
        opt.choices = choices;
      }

      if (typeof defaultValue !== 'undefined') {
        opt.defaultValue = defaultValue;
        this.optDefaults[name] = true;
      }

      // Parse type
      type = type || TYPE_BOOLEAN;
      if (boolean) {
        type = TYPE_BOOLEAN;
      }
      if (string) {
        type = TYPE_STRING;
      }
      if (number) {
        type = TYPE_NUMBER;
      }
      if (count) {
        type = TYPE_COUNT;
      }

      opt.type = type;

      // Register config for all names
      this.options[name] = opt;
      if (typeof alias === 'string') {
        this.options[alias] = opt;
      } else if ((typeof alias === 'undefined' ? 'undefined' : _typeof(alias)) === 'object') {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = alias[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var label = _step.value;

            this.options[label] = opt;
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }

      return this;
    }
  }, {
    key: 'optionSet',
    value: function optionSet(configs) {
      for (var key in configs) {
        var config = configs[key];
        this.option(key, config);
      }

      return this;
    }
  }, {
    key: 'command',
    value: function command(name, config, cb) {
      var cmd = { name: name };
      for (var key in config) {
        cmd[key] = config[key];
      }

      // allow passing in a pre-constructed yargs object as context
      if (cb && cb.constructor === Yargs) {
        cmd.context = cb;
      } else {
        cmd.context = new Yargs();
        if (typeof cb === 'function') {
          cb(cmd.context);
        }
      }

      this.commands[name] = cmd;

      return this;
    }

    // Getters

  }, {
    key: 'getOptionNames',
    value: function getOptionNames() {
      return Object.keys(this.options);
    }
  }, {
    key: 'getCommandNames',
    value: function getCommandNames() {
      return Object.keys(this.commands);
    }
  }, {
    key: 'getCommand',
    value: function getCommand(command) {
      var context = this;
      var result = undefined;
      var commands = command.split(Parser.COMMAND_DELIM);
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = commands[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var token = _step2.value;

          if (!(token in this.commands)) {
            throw new YargsError('Invalid command: ' + token);
          }
          result = context.commands[token];
          context = result.context;
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      return result;
    }
  }], [{
    key: 'parse',
    value: function parse(argv) {
      return new Yargs().parse(argv);
    }
  }]);

  return Yargs;
}();

module.exports = Yargs;
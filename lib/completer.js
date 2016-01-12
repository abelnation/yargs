'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Parser = require('./parser');
var ArgConsumer = require('./arg-consumer');

var Completer = function () {
  function Completer(context) {
    _classCallCheck(this, Completer);

    this.context = context;
  }

  _createClass(Completer, [{
    key: 'getCompletions',
    value: function getCompletions(line, cb) {
      var argv = ArgConsumer.cleanArgv(line);

      var lastChar = line.charAt(line.length - 1);
      var lastTokenIsEmpty = lastChar === ' ';
      var hasPreviousToken = argv.numRemaining() >= (lastTokenIsEmpty ? 1 : 2);

      var tokensMinusCurrent = undefined;
      if (hasPreviousToken) {
        tokensMinusCurrent = lastTokenIsEmpty ? argv : argv.peek(argv.numRemaining() - 1);
      } else {
        tokensMinusCurrent = [];
      }

      var partialParseResult = new Parser(this.context).parse(tokensMinusCurrent);
      var lastContext = partialParseResult.parser;

      var optionNames = lastContext.getOptionNames();
      var commandNames = lastContext.getCommandNames();

      var prevToken = undefined;
      if (hasPreviousToken) {
        if (lastTokenIsEmpty) {
          prevToken = argv.peekLast();
        } else {
          prevToken = argv.peekLast(2)[0];
        }
      }

      var toComplete = lastTokenIsEmpty ? '' : argv.peekLast();

      var result = this.getMatchesWithChoices(toComplete, commandNames);

      if (/^--/.test(toComplete)) {
        // complete long option name
        result = this.getMatchesWithChoices(toComplete.replace(/^--/, ''), optionNames).map(function (x) {
          return '--' + x;
        });
      } else if (/^-$/.test(toComplete)) {
        // treat '-' as a special case
        result = optionNames.map(function (x) {
          return '--' + x;
        });
      } else if (/^-/.test(toComplete)) {
        // don't attempt to complete short opts, since they can
        // be combined together into one long string e.g. '-abcv'
        result = [];
      } else if (hasPreviousToken) {
        // check to see if argument for previous option
        if (/^-/.test(prevToken)) {
          var prevOption = this.context.options[prevToken.replace(/^-(-?)/, '')];
          if (prevOption.choices && (prevOption.type === TYPE_STRING || prevOption.type === TYPE_NUMBER)) {
            result = this.getMatchesWithChoices(toComplete, prevOption.choices);
          }
        }
      }

      if (cb) {
        return cb(null, result);
      } else {
        return result;
      }
    }
  }, {
    key: 'getMatchesWithChoices',
    value: function getMatchesWithChoices(partial, choices) {
      return choices.filter(function (choice) {
        return new RegExp('^' + partial).test(choice);
      });
    }
  }]);

  return Completer;
}();

module.exports = Completer;
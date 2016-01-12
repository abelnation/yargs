'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function normalizeArgs(args) {
	var result = [];

	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator = args[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var arg = _step.value;

			if (/^--/.test(arg)) {
				result.push(arg);
			} else if (/^-/.test(arg)) {
				var options = arg.replace(/^-/, '');
				var _iteratorNormalCompletion2 = true;
				var _didIteratorError2 = false;
				var _iteratorError2 = undefined;

				try {
					for (var _iterator2 = options[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
						var option = _step2.value;

						result.push('-' + option);
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
			} else {
				result.push(arg);
			}
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

	return result;
}

var ArgConsumer = function () {
	function ArgConsumer(args) {
		_classCallCheck(this, ArgConsumer);

		this.args = normalizeArgs(args);
		this.current = this.args.slice(0);
	}

	_createClass(ArgConsumer, [{
		key: 'peek',
		value: function peek(num) {
			if (num) {
				return this.current.slice(0, num);
			} else {
				return this.current[0];
			}
		}
	}, {
		key: 'peekLast',
		value: function peekLast(num) {
			if (num) {
				return this.current.slice(this.current.length - num, this.current.length);
			} else {
				return this.current[this.current.length - 1];
			}
		}
	}, {
		key: 'next',
		value: function next(num) {
			var result = undefined;
			if (num) {
				result = this.current.slice(0, num);
				this.current = this.current.slice(num);
			} else {
				result = this.current[0];
				this.current = this.current.slice(1);
			}
			return result;
		}
	}, {
		key: 'hasNext',
		value: function hasNext() {
			return this.current.length > 0;
		}
	}, {
		key: 'numRemaining',
		value: function numRemaining() {
			return this.current.length;
		}
	}]);

	return ArgConsumer;
}();

module.exports = ArgConsumer;
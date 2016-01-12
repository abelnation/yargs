'use strict';

var yargs = require('../index');

describe('yargs', function () {
	it('should work', function (done) {
		var parser = require('./fixtures/basic');
		console.dir(parser.parse('-V --num 123 --verbose --force -n abel a b c'));
		done();
	});
});
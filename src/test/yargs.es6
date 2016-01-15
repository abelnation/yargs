
const yargs = require('../index')

describe('yargs', () => {
	it('should work', (done) => {
    const parser = require('./fixtures/basic')
		console.dir(parser.parse('-V --num 123 --verbose --force -n abel a b c'))
		done()
	})
})

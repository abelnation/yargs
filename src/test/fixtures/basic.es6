const yargs = require('../../index')

let fixture = new yargs()
fixture
  .version('0.0.1')
  .usage('test parser')
  .optionSet({
    force: {
      alias: [ 'F' ],
      boolean: true
    },
    verbose: {
      alias: 'V',
      count: true
    },
    num: {
      number: true,
      defaultValue: 0
    },
    name: {
      alias: 'n',
      defaultValue: 'defaultName',
      string: true
    }
  })
  .command('foo', { description: 'foo command' }, (parser) => {
    parser
      .option('fooopt', { alias: 'f' })
      .command('foo2', { description: 'foo2 subcommand' })
  })
  .command('bar', { description: 'bar command' }, (parser) => {
    parser.option('baropt', { alias: 'b' })
  })

module.exports = fixture

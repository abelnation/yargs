
const Parser = require('./parser')
const ArgConsumer = require('./arg-consumer')

class Completer {
  constructor(context) {
    this.context = context
  }

  getCompletions (line, cb) {
    let argv = ArgConsumer.cleanArgv(line)

    const lastChar = line.charAt(line.length - 1)
    const lastTokenIsEmpty = (lastChar === ' ')
    const hasPreviousToken = (argv.numRemaining() >= (lastTokenIsEmpty ? 1 : 2))

    let tokensMinusCurrent
    if (hasPreviousToken) {
      tokensMinusCurrent = lastTokenIsEmpty ? argv : argv.peek(argv.numRemaining() - 1)
    } else {
      tokensMinusCurrent = []
    }

    const partialParseResult = new Parser(this.context).parse(tokensMinusCurrent)
    const lastContext = partialParseResult.parser

    const optionNames = lastContext.getOptionNames()
    const commandNames = lastContext.getCommandNames()

    let prevToken
    if (hasPreviousToken) {
      if (lastTokenIsEmpty) {
        prevToken = argv.peekLast()
      } else {
        prevToken = argv.peekLast(2)[0]
      }
    }

    const toComplete = lastTokenIsEmpty ? '' : argv.peekLast()

    let result = this.getMatchesWithChoices(toComplete, commandNames)

    if (/^--/.test(toComplete)) {
      // complete long option name
      result = this.getMatchesWithChoices(toComplete.replace(/^--/, ''), optionNames)
        .map(x => `--${ x }`)
    } else if (/^-$/.test(toComplete)) {
      // treat '-' as a special case
      result = optionNames.map(x => `--${ x }`)
    } else if (/^-/.test(toComplete)) {
      // don't attempt to complete short opts, since they can
      // be combined together into one long string e.g. '-abcv'
      result = []
    } else if (hasPreviousToken) {
      // check to see if argument for previous option
      if (/^-/.test(prevToken)) {
        const prevOption = this.context.options[prevToken.replace(/^-(-?)/, '')]
        if (prevOption.choices &&
          (prevOption.type === TYPE_STRING || prevOption.type === TYPE_NUMBER)) {
          result = this.getMatchesWithChoices(toComplete, prevOption.choices)
        }
      }
    }

    if (cb) {
      return cb(null, result)
    } else {
      return result
    }
  }

  getMatchesWithChoices (partial, choices) {
    return choices.filter(choice => {
      return (new RegExp('^' + partial)).test(choice)
    })
  }
}

module.exports = Completer


const ArgConsumer = require('./arg-consumer')

class Parser {
  constructor(context) {
    this.context = context
  }

  parse(argv, cb) {
    // argv can be a string, an array, or an ArgConsumer
    // regardless, we ensure argv ends up as an ArgConsumer
    argv = ArgConsumer.cleanArgv(argv)

    let lastContext = this
    let result = { _: [] }

    // parse args, relying on helpers to parse different arg types
    while (argv.hasNext()) {
      // peek at first to help determine type of arg
      let next = argv.peek()

      if (/^--$/.test(next)) {
        // When '--' is encountered, stop analyzing and push rest of args
        // on to _ arg array
        argv.next()
        result._ = result._.concat(argv.next(argv.numRemaining()))
      } else if (/^--/.test(next)) {
        this.consumeLongFormOption(next, argv, result)
      } else if (/^-/.test(next)) {
        // ArgConsumer ensures all short options are split apart
        // so we can safely consume an arg once per short option
        this.consumeShortFormOption(next, argv, result)
      } else if (next in this.context.commands) {
        // let sub-command parse the rest, and merge results
        const subresult = this.consumeCommand(next, argv, result)
        lastContext = subresult.context
        this.mergeResults(result, subresult.result)
      } else {
        this.consumeArg(next, argv, result)
      }
    }

    // assign default values
    this.fillInDefaults(result)

    const toReturn = {
      result: result,
      context: lastContext
    }

    if (cb) {
      return cb(null, toReturn)
    } else {
      return toReturn
    }
  }

  // helper methods

  consumeLongFormOption (arg, argv, result) {
    const optionName = arg.replace(/^--/, '')
    this.consumeOption(optionName, argv, result)
  }

  consumeShortFormOption (arg, argv, result) {
    const optionName = arg.replace(/^-/, '')
    this.consumeOption(optionName, argv, result)
  }

  consumeOption (optionName, argv, result) {
    if (optionName in this.context.options) {
      const opt = this.context.options[optionName]
      const { name, type } = opt
      if (type === TYPE_BOOLEAN) {
        this.consumeBoolean(name, argv, result)
      } else if (type === TYPE_COUNT) {
        this.consumeCount(name, argv, result)
      } else if (type === TYPE_STRING) {
        this.consumeString(name, argv, result)
      } else if (type === TYPE_NUMBER) {
        this.consumeNumber(name, argv, result)
      }
    } else {
      this.consumeBoolean(optionName, argv, result)
    }
  }

  consumeCommand (commandName, argv, result) {
    if (!result.command) {
      result.command = commandName
    } else {
      result.command += ' ' + commandName
    }

    argv.next()

    const cmd = this.context.commands[commandName]
    return (new Parser(cmd.context)).parse(argv)
  }

  consumeArg (arg, argv, result) {
    // add to args
    result._.push(arg)
    argv.next()
  }

  consumeNumber (optionName, argv, result) {
    let value = argv.peek(2)[1]
    if (!/^--/.test(value)) {
      result[optionName] = parseFloat(value)
      argv.next(2)
    } else {
      argv.next()
    }
  }

  consumeCount (optionName, argv, result) {
    if (optionName in result) {
      result[optionName] = result[optionName] + 1
    } else {
      result[optionName] = 1
    }
    argv.next()
  }

  consumeString (optionName, argv, result) {
    let value = argv.peek(2)[1]
    if (!/^--/.test(value)) {
      result[optionName] = value
      argv.next(2)
    } else {
      argv.next()
    }
  }

  consumeBoolean (optionName, argv, result) {
    result[optionName] = true
    argv.next()
  }

  fillInDefaults (result) {
    for (let optName in this.context.optDefaults) {
      if (typeof result[optName] === 'undefined') {
        result[optName] = this.context.options[optName].defaultValue
      }
    }
  }

  mergeResults (result, subresult) {
    // merge result with sub-command result
    result._ = result._.concat(subresult._)

    if (subresult.command) {
      result.command = result.command + Parser.COMMAND_DELIM + subresult.command
    }

    for (let key in subresult) {
      if (key !== '_' && key !== 'command') {
        result[key] = subresult[key]
      }
    }
  }
}

Parser.COMMAND_DELIM = ' '

module.exports = Parser

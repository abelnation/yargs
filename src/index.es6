
const Completer = require('./lib/completer')
const Parser = require('./lib/parser')

const TYPE_STRING = 'string'
const TYPE_COUNT = 'count'
const TYPE_BOOLEAN = 'boolean'
const TYPE_NUMBER = 'number'

class YargsError extends Error {}

class Yargs {
  constructor () {
    this.options = {}
    this.commands = {}
    this.optDefaults = {}
    this.requiredOpts = {}
  }

  // Main methods

  parse (argv, cb) {
    return (new Parser(this)).parse(argv, cb).result
  }

  complete (line, cb) {
    return (new Completer(this)).getCompletions(line, cb)
  }

  usage() {
    // TODO: stub
    return this.usage;
  }

  // Configuration Methods

  version (version) {
    this.version = version
    return this
  }

  usage (msg) {
    this.usage = msg
    return this
  }

  nargs (min, max) {
    if (typeof max === 'undefined') {
      max = min
    }

    if (max < min) {
      throw new YargsError('max must be >= min')
    }

    this.nargsMin = min
    this.nargsMax = max

    return this
  }

  option (name, config) {
    let {
      demand,
      required,
      desc,
      describe,
      description,
      alias,
      choices,
      defaultValue,
      type,
      string,
      boolean,
      number,
      count
    } = config

    // Create canonical option object
    var opt = {
      name: name,
      description: desc || describe || description,
      required: demand || required
    }

    if (opt.required) {
      this.requiredOpts[name] = true
    }

    if (typeof alias === 'string') {
      opt.aliases = [ name, alias ]
    } else if (typeof alias === 'object') {
      opt.aliases = [ name, ... alias ]
    }

    if (typeof choices !== 'undefined') {
      opt.choices = choices
    }

    if (typeof defaultValue !== 'undefined') {
      opt.defaultValue = defaultValue
      this.optDefaults[name] = true
    }

    // Parse type
    type = type || TYPE_BOOLEAN
    if (boolean) { type = TYPE_BOOLEAN }
    if (string) { type = TYPE_STRING }
    if (number) { type = TYPE_NUMBER }
    if (count) { type = TYPE_COUNT }

    opt.type = type

    // Register config for all names
    this.options[name] = opt
    if (typeof alias === 'string') {
      this.options[alias] = opt
    } else if (typeof alias === 'object') {
      for (let label of alias) {
        this.options[label] = opt
      }
    }

    return this
  }

  optionSet (configs) {
    for (let key in configs) {
      const config = configs[key]
      this.option(key, config)
    }

    return this
  }

  command (name, config, cb) {
    let cmd = { name: name }
    for (let key in config) {
      cmd[key] = config[key]
    }

    // allow passing in a pre-constructed yargs object as context
    if (cb && cb.constructor === Yargs) {
      cmd.context = cb
    } else {
      cmd.context = new Yargs()
      if (typeof cb === 'function') {
        cb(cmd.context)
      }
    }

    this.commands[name] = cmd

    return this
  }

  // Getters

  getOptionNames () {
    return Object.keys(this.options)
  }

  getCommandNames () {
    return Object.keys(this.commands)
  }

  getCommand (command) {
    let context = this
    let result
    const commands = command.split(Parser.COMMAND_DELIM)
    for (let token of commands) {
      if (!(token in this.commands)) {
        throw new YargsError('Invalid command: ' + token)
      }
      result = context.commands[token]
      context = result.context
    }
    return result
  }

  static parse (argv) {
    return new Yargs().parse(argv)
  }
}

module.exports = Yargs

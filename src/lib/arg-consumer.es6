
const shellParse = require('shell-quote').parse

function normalizeArgs (args) {
  let result = []

  if (!args) {
    return result
  }

	for (let arg of args) {
		if (/^--/.test(arg)) {
			result.push(arg)
		} else if (/^-/.test(arg)) {
			let options = arg.replace(/^-/, '')
			for (let option of options) {
				result.push(`-${ option }`)
			}
		} else {
			result.push(arg)
		}
	}

	return result
}

class ArgConsumer {
	constructor(args) {
		this.args = normalizeArgs(args)
		this.current = this.args.slice(0)
	}

	peek(num) {
		if (num) {
			return this.current.slice(0, num)
		} else {
			return this.current[0]
		}
	}

  peekLast(num) {
    if (num) {
      return this.current.slice(this.current.length - num, this.current.length)
    } else {
      return this.current[this.current.length - 1]
    }
  }

	next(num) {
		let result
		if (num) {
			result = this.current.slice(0, num)
			this.current = this.current.slice(num)
		} else {
			result = this.current[0]
			this.current = this.current.slice(1)
		}
		return result
	}

	hasNext() {
		return this.current.length > 0
	}

  numRemaining() {
    return this.current.length
  }

  static cleanArgv(argv) {
    if (typeof argv === 'string') {
      argv = shellParse(argv)
    }

    if (typeof argv !== 'object') {
      throw new YargsError('Invalid argv value')
    }

    if (argv.constructor !== ArgConsumer) {
      argv = new ArgConsumer(argv)
    }

    return argv
  }
}

module.exports = ArgConsumer

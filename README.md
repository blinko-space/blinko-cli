# blinko-cli

A command line tool for managing Blinko plugins

[![Version](https://img.shields.io/npm/v/blinko-cli.svg)](https://npmjs.org/package/blinko-cli)
[![Downloads/week](https://img.shields.io/npm/dw/blinko-cli.svg)](https://npmjs.org/package/blinko-cli)
[![License](https://img.shields.io/npm/l/blinko-cli.svg)](https://github.com/blinko-cli/blinko-cli/blob/main/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

# Usage

You can run it directly with npx:
```bash
$ npx blinko-cli COMMAND
```

Or install it globally:
```bash
$ npm install -g blinko-cli
$ blinko-cli COMMAND
```

# Commands

<!-- commands -->
* [`blinko-cli release plugin`](#blinko-cli-release-plugin)

## `blinko-cli release plugin`

Release plugin to Blinko marketplace

```
USAGE
  $ blinko-cli release plugin [-d <value>]

FLAGS
  -d, --dir=<value>  [default: .] Directory containing plugin.json and release folder

DESCRIPTION
  Release plugin to Blinko marketplace

EXAMPLES
  $ blinko-cli release plugin
  Releasing plugin from current directory...

  $ blinko-cli release plugin --dir ./my-plugin
  Releasing plugin from ./my-plugin directory...
```

_See code: [src/commands/release/plugin.ts](https://github.com/blinko-cli/blinko-cli/blob/v0.0.1/src/commands/release/plugin.ts)_
<!-- commandsstop -->

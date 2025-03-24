# blinko-cli

A command line tool for managing Blinko plugins

[![Version](https://img.shields.io/npm/v/blinko-cli.svg)](https://npmjs.org/package/blinko-cli)
[![Downloads/week](https://img.shields.io/npm/dw/blinko-cli.svg)](https://npmjs.org/package/blinko-cli)
[![License](https://img.shields.io/npm/l/blinko-cli.svg)](https://github.com/blinko-cli/blinko-cli/blob/main/package.json)

<!-- toc -->
* [blinko-cli](#blinko-cli)
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
* [`blinko-cli dev server`](#blinko-cli-dev-server)
* [`blinko-cli help [COMMAND]`](#blinko-cli-help-command)
* [`blinko-cli plugins`](#blinko-cli-plugins)
* [`blinko-cli plugins add PLUGIN`](#blinko-cli-plugins-add-plugin)
* [`blinko-cli plugins:inspect PLUGIN...`](#blinko-cli-pluginsinspect-plugin)
* [`blinko-cli plugins install PLUGIN`](#blinko-cli-plugins-install-plugin)
* [`blinko-cli plugins link PATH`](#blinko-cli-plugins-link-path)
* [`blinko-cli plugins remove [PLUGIN]`](#blinko-cli-plugins-remove-plugin)
* [`blinko-cli plugins reset`](#blinko-cli-plugins-reset)
* [`blinko-cli plugins uninstall [PLUGIN]`](#blinko-cli-plugins-uninstall-plugin)
* [`blinko-cli plugins unlink [PLUGIN]`](#blinko-cli-plugins-unlink-plugin)
* [`blinko-cli plugins update`](#blinko-cli-plugins-update)
* [`blinko-cli release plugin`](#blinko-cli-release-plugin)

## `blinko-cli dev server`

Start a development server for Blinko plugins with hot-reloading

```
USAGE
  $ blinko-cli dev server [--ws-port <value>] [--http-port <value>] [--dist-dir <value>] [--plugin-json <value>]
    [--vite-command <value>]

FLAGS
  --dist-dir=<value>      [default: ./dist] Directory containing build output
  --http-port=<value>     [default: 3000] HTTP documentation server port
  --plugin-json=<value>   [default: ./plugin.json] Path to plugin.json file
  --vite-command=<value>  [default: vite] Vite command to run
  --ws-port=<value>       [default: 8080] WebSocket server port

DESCRIPTION
  Start a development server for Blinko plugins with hot-reloading

EXAMPLES
  $ blinko-cli dev server
  Starting Blinko development server...

  $ blinko-cli dev server --ws-port=9000 --http-port=4000
  Starting Blinko development server with custom ports...
```

_See code: [src/commands/dev/server.ts](https://github.com/blinko-cli/blinko-cli/blob/v0.0.3/src/commands/dev/server.ts)_

## `blinko-cli help [COMMAND]`

Display help for blinko-cli.

```
USAGE
  $ blinko-cli help [COMMAND...] [-n]

ARGUMENTS
  COMMAND...  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for blinko-cli.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.2.25/src/commands/help.ts)_

## `blinko-cli plugins`

List installed plugins.

```
USAGE
  $ blinko-cli plugins [--json] [--core]

FLAGS
  --core  Show core plugins.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ blinko-cli plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.33/src/commands/plugins/index.ts)_

## `blinko-cli plugins add PLUGIN`

Installs a plugin into blinko-cli.

```
USAGE
  $ blinko-cli plugins add PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into blinko-cli.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the BLINKO_CLI_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the BLINKO_CLI_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ blinko-cli plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ blinko-cli plugins add myplugin

  Install a plugin from a github url.

    $ blinko-cli plugins add https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ blinko-cli plugins add someuser/someplugin
```

## `blinko-cli plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ blinko-cli plugins inspect PLUGIN...

ARGUMENTS
  PLUGIN...  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ blinko-cli plugins inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.33/src/commands/plugins/inspect.ts)_

## `blinko-cli plugins install PLUGIN`

Installs a plugin into blinko-cli.

```
USAGE
  $ blinko-cli plugins install PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into blinko-cli.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the BLINKO_CLI_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the BLINKO_CLI_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ blinko-cli plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ blinko-cli plugins install myplugin

  Install a plugin from a github url.

    $ blinko-cli plugins install https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ blinko-cli plugins install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.33/src/commands/plugins/install.ts)_

## `blinko-cli plugins link PATH`

Links a plugin into the CLI for development.

```
USAGE
  $ blinko-cli plugins link PATH [-h] [--install] [-v]

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help          Show CLI help.
  -v, --verbose
      --[no-]install  Install dependencies after linking the plugin.

DESCRIPTION
  Links a plugin into the CLI for development.

  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ blinko-cli plugins link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.33/src/commands/plugins/link.ts)_

## `blinko-cli plugins remove [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ blinko-cli plugins remove [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ blinko-cli plugins unlink
  $ blinko-cli plugins remove

EXAMPLES
  $ blinko-cli plugins remove myplugin
```

## `blinko-cli plugins reset`

Remove all user-installed and linked plugins.

```
USAGE
  $ blinko-cli plugins reset [--hard] [--reinstall]

FLAGS
  --hard       Delete node_modules and package manager related files in addition to uninstalling plugins.
  --reinstall  Reinstall all plugins after uninstalling.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.33/src/commands/plugins/reset.ts)_

## `blinko-cli plugins uninstall [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ blinko-cli plugins uninstall [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ blinko-cli plugins unlink
  $ blinko-cli plugins remove

EXAMPLES
  $ blinko-cli plugins uninstall myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.33/src/commands/plugins/uninstall.ts)_

## `blinko-cli plugins unlink [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ blinko-cli plugins unlink [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ blinko-cli plugins unlink
  $ blinko-cli plugins remove

EXAMPLES
  $ blinko-cli plugins unlink myplugin
```

## `blinko-cli plugins update`

Update installed plugins.

```
USAGE
  $ blinko-cli plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.33/src/commands/plugins/update.ts)_

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

_See code: [src/commands/release/plugin.ts](https://github.com/blinko-cli/blinko-cli/blob/v0.0.3/src/commands/release/plugin.ts)_
<!-- commandsstop -->

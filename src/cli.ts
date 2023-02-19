#!/usr/bin/env node
'use strict'

import * as colors from 'kleur/colors'
import yargs from 'yargs-parser'
import { perf } from './perf'
import { getOwnVersion } from './version'

export type Arguments = yargs.Arguments

export enum Commands {
  HELP = 'help',
  VERSION = 'version',
  PERF = 'perf',
}

export type Command = 'help' | 'version' | 'perf'

export interface CLIState {
  cmd: Command
  options: {
    foo?: string
  }
}

/** Determine which action the user requested */
export const resolveArgs = (flags: Arguments): CLIState => {
  const options: CLIState['options'] = {
    foo: typeof flags.foo === 'string' ? flags.foo : undefined,
  }

  if (flags.version) {
    return { cmd: 'version', options }
  } else if (flags.help) {
    return { cmd: 'help', options }
  }

  const cmd: Command = flags._[2] as Command
  switch (cmd) {
    case 'help':
      return { cmd: 'help', options }
    case 'perf':
      return { cmd: 'perf', options }
    default:
      return { cmd: 'version', options }
  }
}

/** Display --help flag */
const printHelp = () => {
  console.error(`
  ${colors.bold('perf')} - does perf

  ${colors.bold('Commands:')}
    perf          Does perf.
    version               Show the program version.
    help                  Show this help message.

  ${colors.bold('Flags:')}
    --foo <string>        A value to use in the CLI
    --version             Show the version number and exit.
    --help                Show this help message.

  ${colors.bold('Example(s):')}
    npx @jsheaven/perf --foo X
`)
}

/** display --version flag */
const printVersion = async () => {
  console.log((await getOwnVersion()).version)
}

/** The primary CLI action */
export const cli = async (args: string[]) => {
  const flags = yargs(args)
  const state = resolveArgs(flags)
  const options = { ...state.options }

  console.log(
    colors.dim('>'),
    `${colors.bold(colors.yellow('perf'))} @ ${colors.dim((await getOwnVersion()).version)}: ${colors.magenta(
      colors.bold(state.cmd),
    )}`,
    colors.gray('...'),
  )

  switch (state.cmd) {
    case 'help': {
      printHelp()
      process.exit(0)
    }
    case 'version': {
      await printVersion()
      process.exit(0)
    }
    case 'perf': {
      try {
        await perf({
          foo: options.foo,
        })
      } catch (e) {
        throwAndExit(e)
      }
      process.exit(0)
    }
    default: {
      throw new Error(`Error running ${state.cmd}`)
    }
  }
}

const printError = (err: any) => console.error(colors.red(err.toString() || err))

/** Display error and exit */
const throwAndExit = (err: any) => {
  printError(err)
  process.exit(1)
}

try {
  cli(process.argv)
} catch (error) {
  console.error(error)
  process.exit(1)
}

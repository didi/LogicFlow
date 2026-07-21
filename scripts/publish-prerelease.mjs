#!/usr/bin/env node
/* eslint-env node */
/**
 * Version, build, and publish a numeric Changesets prerelease.
 *
 * Usage:
 *   pnpm publish:pre          # alpha (default)
 *   pnpm publish:pre beta     # beta
 *
 * The generated release state is intentionally kept in the worktree so it can
 * be reviewed and committed. If a build or publish fails, rerunning the command
 * resumes the same prerelease instead of generating another version.
 */

import { execFileSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import prereleaseUtils from './publish-prerelease-utils.cjs'

const {
  getPrereleaseAction,
  getPrereleasePublishArgs,
  getUnsafeDirtyPaths,
  validateTag,
} = prereleaseUtils
const REGISTRY = 'https://registry.npmjs.org'
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const changesetDir = path.join(rootDir, '.changeset')
const tag = validateTag(process.argv[2] ?? 'alpha')

function formatCommand(command, args) {
  return [command, ...args]
    .map((part) =>
      /^[A-Za-z0-9_./:=@-]+$/.test(part) ? part : JSON.stringify(part),
    )
    .join(' ')
}

function run(command, args) {
  console.log(`\n> ${formatCommand(command, args)}`)
  execFileSync(command, args, { cwd: rootDir, stdio: 'inherit' })
}

function capture(command, args) {
  return execFileSync(command, args, {
    cwd: rootDir,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
  }).trim()
}

function readPreState() {
  const preStatePath = path.join(changesetDir, 'pre.json')
  if (!fs.existsSync(preStatePath)) return undefined
  return JSON.parse(fs.readFileSync(preStatePath, 'utf8'))
}

function getChangesetIds() {
  return fs
    .readdirSync(changesetDir)
    .filter((file) => file.endsWith('.md') && file !== 'README.md')
    .map((file) => path.basename(file, '.md'))
    .sort()
}

function getDirtyPaths() {
  const status = capture('git', [
    'status',
    '--porcelain=v1',
    '--untracked-files=all',
  ])
  if (!status) return []
  return status.split('\n').map((line) => line.slice(3))
}

const preState = readPreState()
const action = getPrereleaseAction({
  preState,
  tag,
  changesetIds: getChangesetIds(),
})
const unsafeDirtyPaths = getUnsafeDirtyPaths(getDirtyPaths(), Boolean(preState))

if (unsafeDirtyPaths.length > 0) {
  throw new Error(
    `Refusing to publish with unrelated worktree changes:\n${unsafeDirtyPaths
      .map((file) => `- ${file}`)
      .join('\n')}`,
  )
}

console.log(`\n📦 Publishing numeric prerelease — tag: ${tag}\n`)

run('pnpm', ['test'])

if (action === 'enter-and-version') {
  run('pnpm', ['exec', 'changeset', 'pre', 'enter', tag])
  run('pnpm', ['exec', 'changeset', 'version'])
} else if (action === 'version') {
  run('pnpm', ['exec', 'changeset', 'version'])
} else {
  console.log(
    '\n↪ Existing prerelease version detected; skipping version step.',
  )
}

// Build after versioning in case package metadata is embedded in an artifact.
run('pnpm', ['build'])
run('pnpm', ['build:umd'])
run('pnpm', getPrereleasePublishArgs(REGISTRY))

console.log(
  `\n✅ Prerelease (${tag}) published successfully. Review and commit the generated release files.\n`,
)

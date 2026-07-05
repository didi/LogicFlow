#!/usr/bin/env node
/**
 * Publish a prerelease (snapshot) version to npm.
 *
 * Usage:
 *   pnpm publish:prerelease          # tag = alpha (default)
 *   pnpm publish:prerelease beta     # tag = beta
 *
 * Design:
 *   - Runs tests and builds before publishing.
 *   - Uses `changeset version --snapshot <tag>` to bump package versions to
 *     ephemeral snapshot versions (e.g. 2.3.0-alpha-20260705-abc123).
 *   - Does NOT consume .changeset/*.md files, so they accumulate until the
 *     stable release where `changeset version` is run and the full CHANGELOG
 *     is generated at once.
 *   - Restores package.json files after publishing (snapshot versions should
 *     never be committed).
 */

import { execSync } from 'child_process'

const REGISTRY = 'https://registry.npmjs.org'
const tag = process.argv[2] ?? 'alpha'

function run(cmd) {
  console.log(`\n> ${cmd}`)
  execSync(cmd, { stdio: 'inherit' })
}

console.log(`\n📦 Publishing prerelease — tag: ${tag}\n`)

try {
  run('pnpm test')
  run('pnpm build')
  run('pnpm build:umd')
  run(`pnpm changeset version --snapshot ${tag}`)
  run(`pnpm changeset publish --tag ${tag} --registry=${REGISTRY}`)
} finally {
  // Always restore package.json — snapshot versions must not be committed.
  console.log('\n🔁 Restoring package.json versions...')
  try {
    run('git checkout -- packages/*/package.json')
  } catch {
    console.error(
      '⚠️  Could not restore package.json files automatically.\n' +
        '   Run: git checkout -- packages/*/package.json',
    )
  }
}

console.log(`\n✅ Prerelease (${tag}) published successfully.\n`)

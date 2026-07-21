import { describe, expect, test } from '@jest/globals'
import prereleaseUtils from '../publish-prerelease-utils.cjs'

const {
  getPrereleaseAction,
  getPrereleasePublishArgs,
  getUnsafeDirtyPaths,
  parsePorcelainPaths,
  validateTag,
} = prereleaseUtils

describe('publish prerelease workflow', () => {
  test('enters pre mode and versions pending changesets on the first run', () => {
    expect(
      getPrereleaseAction({
        preState: undefined,
        tag: 'alpha',
        changesetIds: ['fix-a'],
      }),
    ).toBe('enter-and-version')
  })

  test('versions only new changesets when continuing the same prerelease', () => {
    expect(
      getPrereleaseAction({
        preState: { mode: 'pre', tag: 'alpha', changesets: ['fix-a'] },
        tag: 'alpha',
        changesetIds: ['fix-a', 'fix-b'],
      }),
    ).toBe('version')
  })

  test('retries publish without generating another version', () => {
    expect(
      getPrereleaseAction({
        preState: { mode: 'pre', tag: 'alpha', changesets: ['fix-a'] },
        tag: 'alpha',
        changesetIds: ['fix-a'],
      }),
    ).toBe('publish-only')
  })

  test('rejects an active prerelease with a different tag', () => {
    expect(() =>
      getPrereleaseAction({
        preState: { mode: 'pre', tag: 'beta', changesets: ['fix-a'] },
        tag: 'alpha',
        changesetIds: ['fix-a'],
      }),
    ).toThrow('already in prerelease mode with tag "beta"')
  })

  test('validates the npm dist tag before using it in commands', () => {
    expect(validateTag('alpha')).toBe('alpha')
    expect(validateTag('next-2')).toBe('next-2')
    expect(() => validateTag('alpha; npm publish')).toThrow(
      'Invalid prerelease tag',
    )
    expect(() => validateTag('latest')).toThrow(
      'The "latest" tag is not allowed for prereleases',
    )
  })

  test('lets Changesets read the dist tag from prerelease state', () => {
    expect(getPrereleasePublishArgs('https://registry.npmjs.org')).toEqual([
      'exec',
      'changeset',
      'publish',
      '--registry=https://registry.npmjs.org',
    ])
  })

  test('requires a clean worktree before entering prerelease mode', () => {
    expect(getUnsafeDirtyPaths(['packages/core/src/index.ts'], false)).toEqual([
      'packages/core/src/index.ts',
    ])
  })

  test('preserves the first filename when parsing porcelain status', () => {
    expect(
      parsePorcelainPaths(
        ' M packages/core/CHANGELOG.md\n?? .changeset/pre.json\n',
      ),
    ).toEqual(['packages/core/CHANGELOG.md', '.changeset/pre.json'])
  })

  test('allows only generated release files when retrying a publish', () => {
    expect(
      getUnsafeDirtyPaths(
        [
          '.changeset/pre.json',
          'packages/core/package.json',
          'packages/core/CHANGELOG.md',
        ],
        true,
      ),
    ).toEqual([])
    expect(
      getUnsafeDirtyPaths(
        ['packages/core/package.json', 'packages/core/src/index.ts'],
        true,
      ),
    ).toEqual(['packages/core/src/index.ts'])
  })
})

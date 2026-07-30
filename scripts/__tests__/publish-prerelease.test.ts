import { describe, expect, test } from '@jest/globals'
import prereleaseUtils from '../publish-prerelease-utils.cjs'

const {
  getPrereleaseAction,
  getPrereleasePublishArgs,
  getUnsafeDirtyEntries,
  parsePorcelainEntries,
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
    const sourceModification = {
      status: ' M',
      path: 'packages/core/src/index.ts',
    }

    expect(getUnsafeDirtyEntries([sourceModification], false)).toEqual([
      sourceModification,
    ])
  })

  test('preserves XY statuses and filenames when parsing porcelain status', () => {
    expect(
      parsePorcelainEntries(
        ' M packages/core/CHANGELOG.md\n?? .changeset/pre.json\n',
      ),
    ).toEqual([
      { status: ' M', path: 'packages/core/CHANGELOG.md' },
      { status: '??', path: '.changeset/pre.json' },
    ])
  })

  test('allows ordinary generated release-file changes when retrying', () => {
    expect(
      getUnsafeDirtyEntries(
        [
          { status: '??', path: '.changeset/pre.json' },
          { status: ' M', path: 'packages/core/package.json' },
          { status: 'M ', path: 'packages/core/CHANGELOG.md' },
        ],
        true,
      ),
    ).toEqual([])
  })

  test('rejects unsafe statuses and unrelated files when retrying', () => {
    const unsafeEntries = [
      { status: 'UU', path: 'packages/core/package.json' },
      { status: ' D', path: 'packages/core/CHANGELOG.md' },
      { status: 'R ', path: 'packages/core/package.json' },
      { status: ' M', path: 'packages/core/src/index.ts' },
    ]

    expect(getUnsafeDirtyEntries(unsafeEntries, true)).toEqual(unsafeEntries)
  })
})

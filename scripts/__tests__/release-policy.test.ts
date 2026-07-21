import fs from 'fs'
import path from 'path'
import { describe, expect, test } from '@jest/globals'

const rootDir = path.resolve(__dirname, '../..')
const coreDependents = [
  'packages/extension/package.json',
  'packages/layout/package.json',
  'packages/react-node-registry/package.json',
  'packages/vue-node-registry/package.json',
]

function readJson(relativePath: string) {
  return JSON.parse(fs.readFileSync(path.join(rootDir, relativePath), 'utf8'))
}

describe('release dependency policy', () => {
  test.each(coreDependents)(
    '%s publishes a compatible core peer range while developing against the workspace version',
    (packagePath) => {
      const packageJson = readJson(packagePath)

      expect(packageJson.peerDependencies['@logicflow/core']).toBe(
        'workspace:^',
      )
      expect(packageJson.devDependencies['@logicflow/core']).toBe('workspace:*')
    },
  )

  test('only versions publishable packages and propagates peer bumps when the range is exceeded', () => {
    const config = readJson('.changeset/config.json')

    expect(config.privatePackages).toEqual({ version: false, tag: false })
    expect(config.___experimentalUnsafeOptions_WILL_CHANGE_IN_PATCH).toEqual({
      onlyUpdatePeerDependentsWhenOutOfRange: true,
    })
  })
})

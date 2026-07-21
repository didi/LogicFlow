const RELEASE_FILE_PATTERN =
  /^packages\/[^/]+\/(?:package\.json|CHANGELOG\.md)$/

function validateTag(tag) {
  if (!/^[A-Za-z][A-Za-z0-9._-]*$/.test(tag)) {
    throw new Error(`Invalid prerelease tag: ${JSON.stringify(tag)}`)
  }
  if (tag === 'latest') {
    throw new Error('The "latest" tag is not allowed for prereleases')
  }
  return tag
}

function getPrereleaseAction({ preState, tag, changesetIds }) {
  if (!preState) {
    if (changesetIds.length === 0) {
      throw new Error('No pending changesets found for the prerelease')
    }
    return 'enter-and-version'
  }

  if (preState.mode !== 'pre') {
    throw new Error(
      `Cannot publish while prerelease state is in mode "${preState.mode}"`,
    )
  }
  if (preState.tag !== tag) {
    throw new Error(
      `Repository is already in prerelease mode with tag "${preState.tag}"`,
    )
  }

  const versionedChangesets = new Set(preState.changesets)
  return changesetIds.some((id) => !versionedChangesets.has(id))
    ? 'version'
    : 'publish-only'
}

function getPrereleasePublishArgs(registry) {
  // In Changesets prerelease mode, `pre.json` is the source of truth for the
  // npm dist-tag. Passing `--tag` here is treated as an invalid custom tag.
  return ['exec', 'changeset', 'publish', `--registry=${registry}`]
}

function getUnsafeDirtyPaths(paths, hasPreState) {
  if (!hasPreState) return paths

  return paths.filter(
    (file) =>
      file !== '.changeset/pre.json' && !RELEASE_FILE_PATTERN.test(file),
  )
}

module.exports = {
  getPrereleaseAction,
  getPrereleasePublishArgs,
  getUnsafeDirtyPaths,
  validateTag,
}

# Copilot PR Review Instructions

## Scope

These instructions apply when GitHub Copilot reviews pull requests in this repository.

## Lockfile review policy

The following lockfiles are generated artifacts:

- `package-lock.json`
- `pnpm-lock.yaml`
- `yarn.lock`

When these files are changed:

- Do not use lockfile diffs as the basis for review conclusions.
- Do not request code-level refactors from lockfile content.
- Focus review comments on source code and tests.

If a pull request only changes lockfiles:

- Keep feedback minimal.
- Do not block merge based only on lockfile noise.

## PR hygiene preference

Contributors should submit lockfile-only changes in separate pull requests whenever possible, so source-code reviews remain focused.

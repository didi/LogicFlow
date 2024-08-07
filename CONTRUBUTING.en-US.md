# Contribution Guide

If you have any comment or advice, please report your [issue](https://github.com/didi/LogicFlow/issues) or make any change as you wish and submit a [PR](https://github.com/didi/LogicFlow/pulls)!

## Report New Issues

- Please specify what kind of issue it is.
- Before you report an issue, please search for related issues. Make sure you are not going to open a duplicate issue.
- Explain your purpose clearly in labels, title, or content.


LogicFlow group members will confirm the purpose of the issue, replace more accurate labels for it, identify related milestone, and assign developers working on it.

## Contributing Code

### Pull Requests

If you want to contribute improvements or new features we are happy to review your PR :)

```shell
$ pnpm install

$ cd packages/core # or other packages, such as packages/extensions
$ pnpm run build:watch

# create a new shell
$ cd examples/feature-examples
$ pnpm start

# Create a new branch for development. The name of branch should be semantic, avoiding words like 'update' or 'tmp'. We suggest to use feature/xxx, if the modification is about to implement a new feature.
$ git checkout -b branch-name

# Run the test after you finish your modification. Add new test cases or change old ones if you feel necessary
$ pnpm run test

# If your modification pass the tests, congratulations it's time to push your work back to us. Notice that the commit message should be wirtten in the following format.
$ git add . # git add -u to delete files
$ git commit -m "fix(role): role.use must xxx"
$ git push origin branch-name
```

Then you can create a Pull Request at [LogicFlow](https://github.com/didi/LogicFlow/pulls) ✿✿ヽ(°▽°)ノ✿

No one can guarantee how much will be remembered about certain PR after some time. To make sure we can easily recap what happened previously, please provide the following information in your PR.

1. Need: What function you want to achieve (Generally, please point out which issue is related).
2. Updating Reason: Different with issue. Briefly describe your reason and logic about why you need to make such modification.
3. Related Testing: Briefly describe what part of testing is relevant to your modification.
4. User Tips: Notice for LogicFlow users. You can skip this part, if the PR is not about update in API or potential compatibility problem.

### Style Guide

eslint can help to identify styling issues that may exist in your code. Your code is required to pass the test from eslint. Run the test locally by `$ pnpm run lint:ts`.

### Commit Message Format

You are encouraged to use [angular commit-message-format](https://github.com/angular/angular.js/blob/master/CONTRIBUTING.md#commit-message-format) to write commit message. In this way, we could have a more trackable history and an automatically generated changelog.

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

（1）type

Must be one of the following:

- feat: A new feature
- fix: A bug fix
- docs: Documentation-only changes
- style: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- refactor: A code change that neither fixes a bug nor adds a feature
- perf: A code change that improves performance
- test: Adding missing tests
- chore: Changes to the build process or auxiliary tools and libraries such as documentation generation
- deps: Updates about dependencies

（2）scope

The scope could be anything specifying place of the commit change.

（3）subject

Use succinct words to describe what did you do in the commit change.

（4）body

Feel free to add more content in the body, if you think subject is not self-explanatory enough, such as what it is the purpose or reasons of you commit.

（5）footer

- **If the commit is a Breaking Change, please note it clearly in this part.**
- related issues, like `Closes #1, Closes #2, #3`

e.g.

```
fix($compile): [BREAKING_CHANGE] couple of unit tests for IE9

Older IEs serialize html uppercased, but IE9 does not...
Would be better to expect case insensitive, unfortunately jasmine does
not allow to user regexps for throw expectations.

Document change on @logicflow/core#12

Closes #392

BREAKING CHANGE:

  Breaks foo.bar api, foo.baz should be used instead
```

Look at [these files](https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/edit) for more details.

## Release

LogicFlow uses semantic versioning in release process based on [semver](https://semver.org/).

### Branch Strategy
`master` branch is the latest stable version.

- 直接从 `master` 切出分支进行开发
- 所有 API 的废弃都需要在当前的稳定版本上 `deprecated` 提示，并保证在当前的稳定版本上一直兼容到新版本的发布

### Release Strategy

In the release of every stable version, there will be a PM who has the following responsibilities in different stages of the release.

#### Preparation

- Set up milestone. Confirm that request is related to milestone.

#### Before Release

- Confirm that performance test is passed and all issues in current Milestone are either closed or can be delayed to later versions.
- Open a new [Release Proposal MR](https://github.com/nodejs/node/pull/4181), and write `History` as [node CHANGELOG](https://github.com/nodejs/node/blob/master/CHANGELOG.md). Don't forget to correct content in documentation which is related to the releasing version.
- Nominate PM for next stable version.

#### Releasing

- Backup the old stable version (master) to a branch named after the current major version (e.g. `1.x`) and set the tag to {v}.x (v is the current version, e.g. `1.x`)
- Release a new stable version to [npm](http://npmjs.com) and notify upper level frameworks of the update
- Before `npm publish`, read ['How I publish an npm package'](https://fengmk2.com/blog/2016/how-i-publish-a-npm-package)

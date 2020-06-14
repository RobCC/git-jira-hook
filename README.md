# Git hooks https://img.shields.io/npm/v/git-jira-hook?color=red&style=flat-square

Git hooks for `commit-msg` and `pre-commit`.

This enforces commit messages and branches to be written in a specific format (using **JIRA**), following a somewhat similar structure to the conventional commits.

# Installation

No npm package so far. You need to move the whole `bin` folder to your project. This folder includes the hooks as well as other utils.

After that, you need to add the hooks to husky and specify your project id on the package.json.
This will be used to check what's the correct ticket id. (e.g. a `projectId TEST` will allow only tickets such as `TEST-123`).

```
"husky": {
  "hooks": {
    "pre-commit": "bin/pre-commit.js ${HUSKY_GIT_PARAMS} --projectId TEST",
    "commit-msg": "bin/commit-msg.js ${HUSKY_GIT_PARAMS} --projectId TEST"
  }
},
```

Dependencies needed are: `husky` and `yargs`.

# How it works

## Commit Messages

The commit messages must follow the following pattern:

`[commit-type]([JIRA-ticket]): [message]`

By default, there are 4 types of commit types allowed: `feat`, `fix`, `chore` and `other`. The first 3 are considered ticket-related commit types, so they need to be linked to a specific JIRA ticket in the message.

By default, `other` is the only non-ticket related, so the ticket can be omitted with these kind of commits.

Examples:
- `feat(PROJ-13): Add Settings page`
- `fix(PROJ-05): Fix issue with scrolling`
- `other: Updated configuration`

**Important:** The hook is capable of appending the JIRA ticket to the message **when it's available on the branch name**. More info below.

### Special Commits

The hook will allow special commits:

1. Commits generated during a merge (e.g. `Merge dev-branch...`).
2. Messages with just the app's version (e.g. `1.2.0`).
3. `BREAKING CHANGES` commits.

## Branches
The branch must follow the following pattern:

`[branch-type]/[JIRA-ticket][description]`

...where the description is optional.

By default, there are 6 types of branch types allowed: `feature`, `bugfix`, `hotfix`, `other`, `release`, `support`. The first 3 are considered ticket-related branch types, so they need to be linked to a specific JIRA ticket in the branch name.

Examples:
- `feature/PROJ-13`
- `bugfix/PROJ-05-Scroll-issues`
- `other/update-configuration`


**Important:** Also! The hook will prevent direct commits to the `master` and `develop` branch

## Config file

You can create a config file to override default constants, it can be a JSON file. or a JS file either exporting an object or a function that return an object.

The config file has the following structure. Only `projectId` is required.

```json
{
  "projectId": "TEST",
  "commitTypes": {
    "ticket": [
      "feat",
      "fix",
      "chore"
    ],
    "nonTicket": [
      "other"
    ]
  },
  "branchTypes": {
    "main": [
      "master",
      "develop"
    ],
    "ticket": [
      "feature",
      "bugfix",
      "hotfix"
    ],
    "nonTicket": [
      "other",
      "release",
      "support"
    ]
  }
}
```

By default it will look for `hooks.config.js` or `hooks.config.json` on the root folder. You can specify a custom path like so:

```
"husky": {
  "hooks": {
    "commit-msg": "bin/commit-msg.js ${HUSKY_GIT_PARAMS} --config 'dummy-folder/hooks.config.js'"
  }
},
```

## Yeah, cool. But HOW DOES IT WORK?

The [pre-commit](https://git-scm.com/docs/githooks#_pre_commit) hook is invoked on a commit. This hook will validate that the commit is not being made to a `develop` or `master` branch. That's it.

The [commit-msg](https://git-scm.com/docs/githooks#_commit_msg) hook does the main job. First, it will check that the message has the correct format. If so, it will check if the ticket is on the message (if required). If the ticket is not there and is required (i.e. the ticket is not present on a `feat` commit type), it will check if the ticket is available on the branch name. If so, it will append it:

`feat: Do stuff` -> `feat(PROJ-66): Do stuff`

Not complying with these conditions will abort the commit. It will display a message on what did fail:

![log](https://bitbucket.org/jrobcc/hooks-test/raw/24b7c178e7ff7e4c608d6c93cb198cc309f4c073/sample-images/log.png)

**Important:** These messages show up when commiting from the terminal. If using, for example, VS Code, it will show up an alert with a `Open git log` option when an error occurs, where the same messages can be seen (in an uglier format).

![modal](https://bitbucket.org/jrobcc/hooks-test/raw/24b7c178e7ff7e4c608d6c93cb198cc309f4c073/sample-images/alert.png)

### Danger

Both hooks can be skipped by adding the `--no-verify` flag when commiting.


### Example of valid branches

```
feature/TEST-123-Optional-Description
```

### Example of invalid branches

```
feature/TEST-123_Optional-Description
```

## TODO

- Update README / instructions

## WIP

- shebags issue when `dynamicRequireTargets` is on.


## Node features
- Default params - v6 and newer
- Destructuring - v6 and newer
- Async/Await - 7.6 and newer
- String literal - escape sequence - 8.1 and newer
- (requires Husky, thus node >= 10)

**Testing on: v10.16.3**
**Requires Node >= 10**

### Example
Using node (after sudo chmod 774 [js-file]):


## Husky configuration

Using node (current):
```json
"husky": {
  "hooks": {
    "pre-commit": "bin/pre-commit.js ${HUSKY_GIT_PARAMS}",
    "commit-msg": "bin/commit-msg.js ${HUSKY_GIT_PARAMS} --projectId TEST --config 'dummy/hooks.config.js'"
  }
}
```
Using shell:
```json
"husky": {
  "hooks": {
    "pre-commit": "sh githooks/pre-commit",
    "commit-msg": "sh githooks/commit-msg ${HUSKY_GIT_PARAMS}"
  }
}
```

## References
- [Git hooks when a new branch is created and/or pushed](https://stackoverflow.com/questions/14297606/git-hook-when-a-new-branch-is-created-and-or-pushed)
- [Node shell scripting](https://2ality.com/2011/12/nodejs-shell-scripting.html)

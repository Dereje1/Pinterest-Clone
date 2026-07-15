# AGENTS.md — Pinterest-Clone

> **Purpose:** A predictable place for coding agents (Codex, Cursor, Factory, Aider, Gemini CLI, etc.) to learn how to build, test, and contribute to this repository without unnecessary back-and-forth.

## 0) Operating context

- Repository: `Dereje1/Pinterest-Clone`
- Default branch: `master`
- This is an existing application being restored and improved, not a greenfield rewrite.
- The GitHub repository and current implementation are the source of truth.
- The README and older documentation may be stale. Verify behavior against the code before making assumptions.
- Follow the scope of the assigned GitHub Issue exactly.
- Avoid sweeping refactors, dependency upgrades, architecture changes, or unrelated cleanup unless the Issue explicitly asks for them.
- If an Issue conflicts with this file, stop and surface the conflict rather than silently inventing behavior.

The current restoration priority is:

1. Keep the existing application working.
2. Fix confirmed build/runtime problems with the smallest safe change.
3. Preserve existing data and integrations.
4. Add targeted verification for repaired behavior.
5. Modernize dependencies only in separately scoped work.

---

## 1) Project overview

This is a full-stack Pinterest-style TypeScript application.

### Frontend

- React 17
- React Router 5
- Redux / Redux Toolkit
- Material UI
- Vite

### Backend

- Express
- TypeScript
- MongoDB through Mongoose
- Cookie/session-based authentication infrastructure
- OAuth integrations

### External services and integrations

- MongoDB
- AWS S3 image storage
- Google authentication
- GitHub authentication
- Twitter/X authentication
- OpenAI image generation

### User-facing capabilities

The application includes functionality for:

- browsing existing pins
- image uploads
- creating pins from URLs
- creating pins as an authenticated user
- OpenAI image generation
- authentication through supported OAuth providers

Treat these existing flows as behavior to preserve unless an Issue explicitly changes them.

---

## 2) Repository structure and source of truth

Before changing code:

1. Inspect the relevant implementation.
2. Trace the current code path.
3. Identify the smallest set of files required.
4. Check whether the change touches authentication, MongoDB, S3, deployment, routing, environment variables, or external APIs.
5. Preserve current behavior outside the Issue scope.

Do not rely on the README alone when determining how the application currently works.

Do not perform broad search-and-replace operations across the repository without reviewing every changed occurrence.

---

## 3) Dev environment and running locally

This repository uses **npm**.

### Install dependencies

Use the repository's existing lockfile and package-manager conventions.

```bash
npm install
```

If dependency installation fails because of legacy peer-dependency conflicts, inspect the failure before choosing a workaround. Do not casually regenerate or replace the lockfile during an unrelated Issue.

### Run the full development environment

```bash
npm run dev
```

This runs the frontend and backend concurrently.

Equivalent individual commands:

```bash
npm run client
npm run server
```

- `npm run client` starts the Vite client.
- `npm run server` starts the backend through Nodemon.

Local execution may require environment variables and access to external services such as MongoDB, AWS S3, OAuth providers, or OpenAI.

Never invent production credentials.

If an external integration cannot be exercised locally, preserve the existing integration and clearly report the limitation.

---

## 4) Build, type-check, lint, and test

The current repository scripts are:

### TypeScript verification

```bash
npm run compileTS
```

This verifies:

- client TypeScript
- server TypeScript with `--noEmit`
- test TypeScript

### Lint

```bash
npm run lint
```

This runs ESLint across:

- `server`
- `client`
- `tests`

### Client production build

```bash
npm run build_client
```

This compiles the client TypeScript and runs the Vite production build.

### Server production build

```bash
npm run build_server
```

This compiles the server and `bin` TypeScript projects.

### Production start

After the server build:

```bash
npm run start
```

This starts:

```text
node ./server_build/bin/www
```

### Tests

The test runner is **Jest**.

The repository's default command is:

```bash
npm run test
```

However, the package script runs Jest in watch mode. Do not use watch mode as the final PR verification command.

For a one-shot full test run, use:

```bash
npm test -- --watch=false
```

If serial execution is needed for stability:

```bash
npm test -- --watch=false --runInBand
```

Coverage:

```bash
npm run coverage
```

### Narrowing a failing Jest test

Examples:

```bash
npx jest path/to/test-file.test.ts --runInBand
```

or:

```bash
npx jest -t "<test name or regex>" --runInBand
```

Use targeted tests during development, but run the required full checks before opening a PR unless the Issue or environment makes that impossible.

---

## 5) Required pre-PR verification

Before pushing a branch for review, run the following unless the Issue clearly does not affect a given area or the environment prevents it:

```bash
npm run compileTS
npm run lint
npm test -- --watch=false --runInBand
npm run build_server
npm run build_client
```

Do not claim a command passed unless it was actually run successfully.

If any command cannot be run:

- state exactly which command was not run
- explain why
- do not report the task as fully verified

For user-facing or full-stack changes, also perform relevant local/manual verification where practical.

Examples include:

- guest browsing still works
- existing pins still render
- routing still works
- authentication behavior is unchanged
- authenticated pin creation still works
- image upload behavior remains intact
- relevant API behavior remains intact

Only test flows reasonably related to the change plus sensible regression checks.

---

## 6) Pull Request protocol

When implementing a GitHub Issue, use a dedicated branch.

### Branch naming

Preferred format:

```text
feat/issue-<ISSUE_NUMBER>-<short-title>
```

For fixes:

```text
fix/issue-<ISSUE_NUMBER>-<short-title>
```

For maintenance or documentation-only work:

```text
chore/issue-<ISSUE_NUMBER>-<short-title>
```

Examples:

```text
feat/issue-61-rebrand-public-app
fix/issue-72-oauth-callback-error
chore/issue-80-update-agents-instructions
```

### PR requirements

The PR must:

- target the repository's normal integration branch, currently `master`, unless the Issue specifies otherwise
- stay scoped to the Issue
- describe what changed
- describe how the change was verified
- disclose any checks that could not be run
- note any remaining risk or external dependency

### Closing the Issue

When the PR fully resolves the assigned Issue, the PR description must include:

```text
Closes #<ISSUE_NUMBER>
```

This is required so GitHub automatically closes the Issue when the PR is merged.

Do not use `Closes #...` if the PR only partially addresses the Issue.

### Suggested PR description structure

```markdown
## Summary

- Brief description of the implemented change
- Brief description of important preserved behavior

Closes #<ISSUE_NUMBER>

## Verification

- `npm run compileTS`
- `npm run lint`
- `npm test -- --watch=false --runInBand`
- `npm run build_server`
- `npm run build_client`

## Manual checks

- List relevant manual verification performed

## Notes / limitations

- List anything not verified or any external-service dependency
```

### Before opening the PR

Confirm:

- the diff is limited to Issue scope
- no secrets were added
- no generated or unrelated files were accidentally committed
- required tests/builds were run
- the PR body includes the Issue-closing keyword when appropriate

Do not describe a PR as ready to merge if relevant tests are failing or important verification is incomplete.

---

## 7) Scope discipline

Each Issue should produce one focused change.

Avoid combining:

- feature work and dependency upgrades
- restoration work and broad refactoring
- UI work and backend architecture changes
- bug fixes and unrelated cleanup
- branding changes and infrastructure changes

Do not perform opportunistic rewrites.

Prefer:

- targeted edits
- existing project patterns
- minimal new abstractions
- small reviewable diffs
- preserving established component, route, API, and data structures

Avoid:

- broad formatting-only churn
- unnecessary file moves
- unnecessary renaming
- framework migration
- replacing existing libraries without a task-specific reason
- introducing a new state-management architecture during unrelated work

---

## 8) Sensitive areas

The following areas require extra caution.

### Authentication

The application may use:

- Google OAuth
- GitHub OAuth
- Twitter/X OAuth

Before changing authentication code:

1. trace the current frontend and backend flow
2. inspect callback routes
3. inspect environment-variable usage
4. inspect production URL assumptions
5. preserve session and redirect behavior unless the Issue explicitly changes them

Do not change OAuth callback URLs, redirect URIs, provider configuration, session behavior, or token handling as part of unrelated work.

A public-facing app-name change does not automatically justify changing authentication behavior.

### MongoDB and persisted data

Treat MongoDB data as persistent and valuable.

Do not:

- rename collections casually
- change schemas without explicit need
- introduce migrations during unrelated work
- delete or rewrite persisted data
- assume the database is disposable

If a schema change is required:

1. explain compatibility impact
2. preserve existing records where possible
3. provide a migration or backward-compatible approach when needed
4. add targeted verification

Existing pins and user-facing persisted data should continue to render after unrelated changes.

### AWS S3 and image storage

Do not change without explicit Issue scope:

- bucket assumptions
- object-key formats
- upload paths
- image URL construction
- public/private access behavior

Do not delete or rewrite existing stored objects.

### OpenAI integration

The repository contains an OpenAI image-generation integration.

Do not modernize or rewrite it during unrelated work.

If an Issue specifically concerns the OpenAI integration:

1. inspect the current implementation
2. identify the exact failing behavior
3. verify current API requirements
4. change only what is necessary
5. preserve the existing user workflow where practical

### Production infrastructure

Current production hostname:

```text
pclone.derejegetahun.com
```

Infrastructure may include:

- Route 53
- CloudFront
- TLS/ACM certificates
- DNS records
- deployment hosting
- production environment variables
- OAuth callback URLs

Do not change production infrastructure unless the Issue explicitly requires it.

In particular:

- do not change the production hostname during unrelated work
- do not modify Route 53 or CloudFront configuration during branding work
- do not treat an app rebrand as an infrastructure migration

---

## 9) Environment variables and secrets

Never:

- commit secrets
- hard-code credentials
- expose tokens in logs
- replace environment variables with production values
- add OAuth secrets, AWS credentials, database credentials, API keys, or private keys to the repository

Use environment variables for credentials and deployment-specific settings.

When documenting configuration:

- use placeholder values
- preserve existing environment-variable names unless a change is required
- do not include real secrets in test output, PR descriptions, screenshots, or implementation summaries

If a required credential is unavailable, do not invent one.

---

## 10) Public branding

The historical repository name may remain:

```text
Pinterest-Clone
```

Public-facing branding is separate from:

- repository history
- infrastructure names
- production hostname
- internal technical identifiers

When working on branding:

- change only public-facing text, metadata, and assets required by the Issue
- do not blindly replace every occurrence of `Pinterest`, `clone`, or `pclone`
- preserve infrastructure URLs and internal references unless specifically required
- avoid implying official affiliation with third-party brands

---

## 11) Code style and implementation expectations

Follow the existing codebase style and established patterns.

Do not modernize style conventions across unrelated files.

Prefer:

- clear TypeScript
- existing component patterns
- existing routing patterns
- existing API patterns
- minimal new abstractions

Avoid introducing:

- `any` without justification
- blanket ESLint disables
- ignored promise failures
- swallowed exceptions
- placeholder implementations presented as complete
- broad TypeScript suppressions

Do not silence an error merely to make the build green. Fix the underlying issue within scope or clearly report the blocker.

---

## 12) Documentation and comments

Update documentation only when necessary for the implemented change.

Do not perform broad README rewrites during unrelated Issues.

Comments should explain non-obvious intent rather than restating straightforward code.

When historical wording is relevant, distinguish between:

- the repository's historical origin
- the current public application identity
- current production behavior

---

## 13) Agent workflow for an assigned Issue

### Before coding

1. Read the full Issue.
2. Identify the acceptance criteria.
3. Identify explicit out-of-scope work.
4. Inspect the relevant implementation.
5. Check whether the Issue affects any sensitive area.
6. Create or work on the correctly named Issue branch.

### During implementation

1. Keep the change narrowly scoped.
2. Follow existing patterns.
3. Add or update targeted tests where practical.
4. Avoid unrelated cleanup.
5. Preserve existing behavior outside the Issue.

### Before pushing

Run:

```bash
npm run compileTS
npm run lint
npm test -- --watch=false --runInBand
npm run build_server
npm run build_client
```

Then review the diff for:

- Issue scope
- regressions
- accidental secrets
- accidental infrastructure changes
- unrelated formatting or generated files

### When opening the PR

Include:

- a concise summary
- verification commands and results
- manual checks where relevant
- limitations or unverified external integrations
- `Closes #<ISSUE_NUMBER>` when the PR fully resolves the Issue

---

## 14) Definition of done

A task is complete when:

- the requested Issue behavior is implemented
- the change stays within Issue scope
- unrelated functionality is preserved
- relevant TypeScript checks pass
- relevant lint checks pass
- relevant Jest tests pass
- client and server production builds pass when applicable
- no secrets are exposed
- sensitive integrations are unchanged unless explicitly required
- the PR accurately reports verification and limitations
- the PR includes `Closes #<ISSUE_NUMBER>` when it fully resolves the Issue

---

## 15) Quick commands reference

```bash
npm install

npm run dev
npm run client
npm run server

npm run compileTS
npm run lint
npm test -- --watch=false --runInBand
npm run coverage

npm run build_server
npm run build_client
npm run start
```

---

*Maintainer workflow:* GitHub Issues define task scope. Coding agents implement one focused Issue at a time, verify the result, push an Issue branch, and open a PR that closes the Issue when fully resolved.

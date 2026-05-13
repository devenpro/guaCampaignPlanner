# Release Management

Operating manual for branches, releases, and the Drupal Asset Injector
configuration that loads the planner bundle. README's "How Drupal loads this"
section is the short version; this doc is the long one.

## TL;DR

* Merge a PR to `main` → the **Release** GitHub Action bumps `package.json`
  patch, rebuilds `dist/`, tags `vX.Y.Z`, and publishes a GitHub Release.
* Drupal's Asset Injector loads `dist/app.{js,css}` from
  `https://cdn.jsdelivr.net/gh/devenpro/guaCampaignPlanner@latest/dist/…`.
  `@latest` resolves to the newest tag automatically.
* To verify a deploy, open DevTools Console — first line on a planner page
  is `[CP] Campaign Planner vX.Y.Z · built …`.
* To roll back, change Asset Injector URLs from `@latest` to a previous
  `@vX.Y.Z` tag and clear Drupal cache. ~30 seconds.

## 1. Branch model

* **`main`** is the trunk. Every merge to `main` triggers an auto-release.
  Treat `main` as "what's live (or about to be live)".
* **Feature branches** follow `claude/<descriptive-name>` (e.g.
  `claude/hook-copy-ai-modal-bugfix`, `claude/observable-versioned-delivery`).
  Short-lived; deleted after the PR merges.
* **No long-lived `release/*` branches.** Tags `vX.Y.Z` are the release
  pointers; there's nothing else to maintain.
* **`dist/` is committed.** jsDelivr serves it directly out of the repo,
  so the bundle has to be in git. Rebuild locally
  (`node scripts/build.mjs`) before opening a PR so the bundle diff is
  visible to reviewers.

## 2. Release lifecycle

Defined in `.github/workflows/release.yml`.

**Trigger.** `push` to `main`. Covers direct pushes and merge commits.

**Self-skip rule.** The job's `if:` checks the head commit message and skips
if it starts with `[release]`. This prevents the workflow's own commit from
re-triggering the workflow.

**Steps the workflow runs:**

1. Checkout with `fetch-depth: 0` so `git describe` can find the previous
   tag for release notes.
2. Set up Node 20.
3. Configure git identity as `github-actions[bot]`.
4. `npm version patch --no-git-tag-version` updates `package.json` in
   place.
5. `node scripts/build.mjs` rebuilds `dist/app.{js,css}`. The build script
   reads the freshly-bumped `package.json` and bakes the version + ISO
   build time into both files (the prologue in `dist/app.js` sets
   `window.CP_VERSION` and `window.CP_BUILD_TIME`).
6. Commit `[release] vX.Y.Z`, tag `vX.Y.Z` (annotated), push commit and
   tag to `origin/main`.
7. `gh release create` publishes a GitHub Release with notes generated
   from the commit log between the previous tag and `HEAD~1` (skipping
   the release commit itself).

**Permissions.** The workflow declares `permissions: contents: write` and
uses the built-in `GITHUB_TOKEN`. No PATs, no secrets to rotate.

**Where to watch.**

* Actions tab (https://github.com/devenpro/guaCampaignPlanner/actions)
  while it runs.
* Releases page (https://github.com/devenpro/guaCampaignPlanner/releases)
  once it finishes.
* On the live Drupal page, the console banner and the sidebar version
  chip confirm the new bundle is actually being served.

## 3. Versioning policy

SemVer: `MAJOR.MINOR.PATCH`.

* **Patch** (`X.Y.Z` → `X.Y.Z+1`): automatic on every merge to `main`.
  This is the common case.
* **Minor / major**: bump `package.json` manually inside a PR before
  merging. CI sees the new floor and the next auto-release will be one
  patch past your manual bump. Example: you want to ship `v1.1.0` for a
  feature release. In the PR, run `npm version minor --no-git-tag-version`
  locally (sets `package.json` to `1.1.0`), commit, push, merge. CI then
  cuts `v1.1.1` automatically.
* **If you need the exact `v1.1.0` tag itself** (and not just a `v1.1.1`
  one patch past it): cut the tag manually from the GitHub Releases page
  before the PR merges, or push the tag from the command line. Once
  `v1.1.0` exists, CI's `v1.1.1` auto-release is fine to keep.
* **Pre-release / RC tags** (`v1.1.0-rc.1`): out of scope for the current
  workflow. Cut by hand if needed.

## 4. Asset Injector configuration

Drupal admin path: **Configuration → Development → Asset Injector**.

You need **two rules total**: one in CSS Injector, one in JS Injector.

For each rule, configure:

| Field | Value |
| --- | --- |
| Label | `Campaign Planner CSS` / `Campaign Planner JS` |
| Source type | **External** |
| URL (production) | `https://cdn.jsdelivr.net/gh/devenpro/guaCampaignPlanner@latest/dist/app.css` (or `.js`) |
| URL (pinned to a tag) | replace `@latest` with the tag, e.g. `@v1.0.6/dist/app.css` |
| URL (bleeding edge) | replace `@latest` with `@main` — mutable, jsDelivr caches ~12 h |
| Conditions → Node types | check **Campaign Planner** (so the bundle only loads on planner nodes) |

Save. Clear Drupal cache.

**Verifying the rule is live.** Load any campaign-planner node, open
DevTools Console. The first log should be:

```
[CP] Campaign Planner v1.0.7 · built 2026-05-13T10:59:38.473Z
```

The sidebar footer shows a small `v1.0.7` chip linking to the matching
GitHub release.

### Choosing the right URL mode

| Use case | URL |
| --- | --- |
| Day-to-day production | `@latest` — picks up new releases as they ship |
| Frozen during incident response | `@vX.Y.Z` — immutable, never changes |
| Testing an unreleased feature branch | `@<branch-name>` — mutable like `@main`, useful for previews |
| jsDelivr unreachable | `/sites/default/files/…` — self-hosted, see §6 |

## 5. Day-to-day recipes

### Ship a small fix

1. Edit files under `src/`.
2. `node scripts/build.mjs` to rebuild `dist/`.
3. Open a PR. Reviewers see both source and bundle diff.
4. Merge to `main`. The Release workflow runs in ~1 minute and cuts the
   next patch tag.
5. Hard-reload the live page. Console banner should show the new
   version.

### Verify a deploy

1. Open DevTools Console on a planner page.
2. Confirm `[CP] Campaign Planner v<expected>` matches the latest tag at
   https://github.com/devenpro/guaCampaignPlanner/releases.
3. Confirm the sidebar version chip matches.
4. If either shows an older version, see §7 "Gotchas — caches".

### Roll back to the previous tag

1. Drupal admin → Asset Injector.
2. Edit both Campaign Planner rules. Change `@latest` to the previous
   good tag, e.g. `@v1.0.6`.
3. Save.
4. Clear all Drupal caches (Configuration → Performance → Clear all
   caches).
5. Hard-refresh the planner page. Console banner now shows the pinned
   version.
6. Fix the source on a branch. When the fix tags, switch Asset Injector
   back to `@latest`.

The full list of available tags lives at
https://github.com/devenpro/guaCampaignPlanner/tags.

### Test a feature branch on the live page

Useful for QA before merging.

1. Push the branch. jsDelivr exposes it at
   `https://cdn.jsdelivr.net/gh/devenpro/guaCampaignPlanner@<branch-name>/dist/app.{js,css}`
   (URL-encode any slashes in the branch name, e.g.
   `claude%2Fhook-copy-ai-modal-bugfix`).
2. In Asset Injector, change `@latest` to `@<branch-name>` on both rules
   on a non-production Drupal env.
3. Clear Drupal cache, hard-reload.
4. After the branch merges and CI tags, flip back to `@latest`.

### Hotfix when the CDN is unavailable

When jsDelivr itself is the problem (rare):

1. Download `dist/app.js` and `dist/app.css` from the latest GitHub
   release (or from `main` if the release didn't run).
2. Upload to `sites/default/files/campaign-planner/app.js` and `…/app.css`
   on the Drupal site.
3. In Asset Injector, change the External URLs to:
   * `/sites/default/files/campaign-planner/app.js?v=1.0.7`
   * `/sites/default/files/campaign-planner/app.css?v=1.0.7`
4. Bump the `?v=` query every time you re-upload — Drupal and browsers
   treat it as a new asset.
5. Clear all Drupal caches.
6. To revert to the CDN, flip the URLs back to `@latest`.

## 6. Gotchas

* **`@latest` resolution lag.** jsDelivr resolves `@latest` to the newest
  semver tag in the repo. New tags become visible to `@latest` within
  ~1 minute. The redirected file is cached by jsDelivr for up to ~7
  days, but the resolver picks up new tags faster. Browser hard-reload +
  Drupal cache-clear normally suffice; the purge URLs in README's
  Troubleshooting section are an option if you need to be sure.
* **Drupal asset aggregation.** Drupal can rewrite asset URLs in its own
  cache. Always clear Drupal cache after changing Asset Injector URLs.
* **Don't push manual commits starting with `[release]`.** The workflow
  uses that prefix as its self-skip signal. Manual release commits
  on `main` should use a different prefix (or push the tag without the
  commit).
* **Tag collision.** If `npm version patch` would produce a tag that
  already exists (rare — only if someone manually tagged ahead of CI),
  the workflow's `git tag` step fails. Resolution: bump `package.json`
  manually past the collision in a PR and push.
* **Node-type condition.** Asset Injector loads the bundle only on the
  Campaign Planner node type. If the content type is renamed or a new
  content type also needs the planner, update the rule's condition.
* **First-run note.** The first auto-release after the workflow lands
  will be `v1.0.1` (current `package.json` is `1.0.0` and the workflow
  PR doesn't bump it). Subsequent pushes climb from there.

## 7. Where things live

| Concern | Path |
| --- | --- |
| Current version floor | `package.json` (CI bumps this) |
| Release workflow | `.github/workflows/release.yml` |
| Concatenation + version injection | `scripts/build.mjs` |
| Source files (what you edit) | `src/10-part1/`, `src/20-part2a/`, `src/30-part2b/`, `src/styles/` |
| Built bundle (what jsDelivr serves) | `dist/app.js`, `dist/app.css` |
| Console banner | `src/10-part1/03-init.js` |
| Sidebar version chip | `src/10-part1/08-shell.js`, `src/styles/10-part1/05-sidebar.css` |
| Drupal config | Configuration → Development → Asset Injector |
| Live verification | DevTools Console, sidebar footer chip, Releases page |

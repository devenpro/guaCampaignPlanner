# Working with Claude on Campaign Planner

This is the standing agreement between the user and Claude Code for this
repo. It's loaded automatically at session start, so the rules below
apply without needing to be repeated each task.

## Project orientation

Campaign Planner is a vanilla-JS + jQuery app embedded via Drupal's Asset
Injector module on a `campaign_planner` content node. Source lives in
`src/` (three IIFE parts: `10-part1`, `20-part2a`, `30-part2b`). The
bundler at `scripts/build.mjs` concatenates every file under `src/` into
`dist/app.js` + `dist/app.css`, which **are checked in**. Drupal loads
the dist files from jsDelivr.

Every push to `main` (except commits starting with `[release]`) triggers
`.github/workflows/release.yml`: it bumps the patch version, rebuilds
dist, commits `[release] vX.Y.Z`, tags it, creates a GitHub Release, and
purges jsDelivr's `@latest`/`@main` cache. Tag-to-release wall time is
~13s.

## The 7-step workflow

### 1. Triage

Trivial single-edit work → no plan mode, announce the change in one
sentence and do it. Multi-file, ambiguous, or anything touching the
init/wizard path → enter plan mode, propose phases, `ExitPlanMode` for
approval before touching code. The user can force plan mode any time
with "let's plan first".

### 2. Branch from fresh main

```bash
git checkout main && git pull origin main
git checkout -b claude/<verb>-<slug>
```

Never branch from a stale local main. Never reuse a previously-merged
branch.

### 3. Implement, one commit per phase

For each phase:

1. Edit source files under `src/`.
2. Rebuild: `node scripts/build.mjs`.
3. Parse-check: `node -e "new Function(require('fs').readFileSync('dist/app.js','utf8'))"`.
4. Stage source AND dist together: `git add src/ dist/`.
5. Commit with a conventional-commit subject (≤72 chars).
6. **Do not push between phases.** Commits accumulate locally until all
   phases are done.

If a real ambiguity surfaces mid-phase (the change could reasonably go
two ways), pause and use `AskUserQuestion` — don't guess.

Docs-only changes skip the rebuild + parse-check (no dist impact).

### 4. Push once when all phases are done

```bash
git push -u origin claude/<branch-name>
```

Report back: "Branch `claude/...` is ready with N commits — open a PR
when you want to ship." **Do not open the PR.**

### 5. User opens + merges the PR

The user opens the PR from the Claude Code UI's "Open PR" button and
either merges it themselves or asks Claude to merge via
`gh pr merge --squash`. Squash-merge is the project convention so the
auto-release workflow sees one logical commit per merged PR.

### 6. Auto-release runs

On push to `main`, `.github/workflows/release.yml` runs. Wait ~15s. Tag
`vX.Y.Z` is created, GitHub Release published, jsDelivr `@latest`/`@main`
cache purged automatically.

### 7. User verifies in production, in this order

1. **Drupal cache clear.** `drush cr` or **Configuration → Development →
   Performance → Clear all caches**. This regenerates the aggregated JS
   bundle (`/sites/default/files/js/js_*.js`) that Drupal serves —
   without it, the new release does not reach the browser regardless of
   how fresh jsDelivr is.
2. **Browser hard-refresh.** `Ctrl+Shift+R` / `Cmd+Shift+R`.
3. **DevTools console check.** First line should show the new `vX.Y.Z`
   banner with a build timestamp **later than** the previous working
   version. Build timestamp is ground truth — version number alone can
   lag.

If after these three steps the console still shows the old version, see
the appendix at the bottom of this file.

## Build hygiene

`dist/app.js` and `dist/app.css` are checked in and must move in
lockstep with `src/`. Always rebuild + parse-check before committing
source changes. The release workflow rebuilds again at release time, but
a locally broken commit pollutes history and would briefly trigger a
release with stale dist. The parse-check catches syntax errors that
TypeScript-style tools would otherwise find — this codebase has no test
suite.

## Conventional commit prefixes

- `fix(<scope>): …` — bug fix
- `feat(<scope>): …` — new feature
- `refactor(<scope>): …` — internal cleanup, no behavior change
- `ci(<scope>): …` — CI/workflow changes
- `docs(<scope>): …` — docs only

Scopes are short: `setup-wizard`, `init`, `truncate`, `release`, etc.
The squash commit's subject becomes the GitHub Release notes line, so
write the PR title thoughtfully — it's the public-facing record.

## Branch naming

`claude/<verb>-<slug>`. Examples:

- `claude/fix-truncate-crash`
- `claude/add-settings-reset`
- `claude/audit-init-pipeline`
- `claude/refactor-brand-service`

Verbs: `fix`, `add`, `refactor`, `audit`, `remove`, `docs`.

## What Claude will not do unsolicited

- **Open a PR.** User opens it from the Claude Code UI.
- **Push to `main` directly.** Always work through a feature branch.
- **Force-push** (`--force` / `--force-with-lease`) — even on a feature
  branch — without explicit permission.
- **Skip git hooks** (`--no-verify`).
- **Bump the version manually** in `package.json` — the release workflow
  owns that.
- **Trigger `/ultrareview`** or other user-billed automation — user-only.

## Hotfix exception

If the user says "hotfix" or "broken in prod", Steps 1–7 still apply but
Claude skips plan mode unless the fix genuinely needs design discussion.
Speed > formality for hotfixes.

---

## Appendix — when the console shows the old version after a release

After Step 7, if the build timestamp is still the previous version's:

1. **Check jsDelivr directly.** Open in any browser tab:
   ```
   https://cdn.jsdelivr.net/gh/devenpro/guaCampaignPlanner@latest/dist/app.js
   ```
   First line should show the new version + build timestamp. If it does,
   jsDelivr is fine and the staleness is downstream.

2. **Check the Drupal aggregated bundle.** DevTools → Network → look for
   `js_<hash>.js`. If the hash is identical to before the release,
   Drupal's aggregate wasn't regenerated. Re-run `drush cr` or fully
   clear caches via the admin UI. Verify the hash changes.

3. **Check the Asset Injector pin.** Configuration → Development → Asset
   Injector → JS Injector → JS Code. If the script tag references
   `@vX.Y.Z` instead of `@latest`, that's the explanation — bump the pin
   to the new tag or switch to `@latest`.

4. **Manual jsDelivr purge (last resort).** The release workflow's
   auto-purge handles this normally, but it's idempotent — open in any
   browser:
   ```
   https://purge.jsdelivr.net/gh/devenpro/guaCampaignPlanner@latest/dist/app.js
   https://purge.jsdelivr.net/gh/devenpro/guaCampaignPlanner@latest/dist/app.css
   ```

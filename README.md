# Campaign Planner

Drupal 11 add-on for Meta ad creative planning: personas, messages, styles, formats, recipe pipeline, campaigns, calendar, and AI assist.

## Repository layout

```
src/                  Source files. This is where you edit.
  10-part1/           Core engine: state, init, views, CRUD helpers, auto-status
  20-part2a/          Modals, CRUD, pipeline editors, wizards, event handlers
  30-part2b/          AI services, research lab, settings, images, import/export
  styles/
    10-part1/         CSS for core/views
    20-part2/         CSS for modals, forms, wizard

dist/                 Build output. Committed so jsDelivr can serve it.
  app.js              Single concatenated JS bundle (loaded by Drupal)
  app.css             Single concatenated CSS bundle (loaded by Drupal)

data/                 Sample data fixtures
docs/                 Architecture, data model, API reference, troubleshooting
scripts/
  build.mjs           Concatenates src/ → dist/
```

## Local development

```powershell
# Edit any file under src/, then rebuild:
node scripts/build.mjs

# Or, if PowerShell execution policy allows npm scripts:
npm run build
```

The build is a simple alphabetical-walk concatenation — no bundler, no plugins, no transforms. File ordering is controlled by numeric prefixes on folder and file names. To reorder, rename.

> **Note on `npm`**: Windows PowerShell may block `npm.ps1` with "running scripts is disabled". Two fixes:
> - Run `npm.cmd run build` (forces the .cmd shim, bypassing .ps1)
> - Or once: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`

## How Drupal loads this

Configured via the Asset Injector module on the Drupal site. The Drupal admin
points two External rules at jsDelivr URLs. Pick one of two stability levels:

| Mode | URL pattern | Notes |
| --- | --- | --- |
| **Production** (recommended) | `…@latest/dist/app.{js,css}` | jsDelivr resolves `@latest` to the highest semver tag. CI auto-tags every push to `main`, so the live page picks up new releases automatically. |
| **Pinned** (for rollback) | `…@vX.Y.Z/dist/app.{js,css}` | Tag URLs are immutable. Use during incident response when you need to freeze the live page on a known-good release. |
| **Bleeding edge** | `…@main/dist/app.{js,css}` | Follows the branch tip. Mutable; jsDelivr caches it ~12 h. Use only for short-lived hotfixes before a release exists. |

Full URL for production:

```
https://cdn.jsdelivr.net/gh/devenpro/guaCampaignPlanner@latest/dist/app.js
https://cdn.jsdelivr.net/gh/devenpro/guaCampaignPlanner@latest/dist/app.css
```

Both rules are conditional on the `node--type-campaign-planner` body class.

### Deploy flow

1. Edit a file under `src/`.
2. `node scripts/build.mjs` to rebuild `dist/app.js` and `dist/app.css` locally (so reviewers can see the diff).
3. Open a PR, merge to `main`.
4. The `Release` GitHub Action bumps `package.json` patch, rebuilds, commits as `[release] vX.Y.Z`, tags, and publishes a GitHub Release. No manual `git tag` step.
5. Asset Injector points at `@latest`, so the new release shows up on the live page within minutes (after the usual Drupal/browser caches expire — see Troubleshooting).

The running bundle prints its version to the browser console on load:

```
[CP] Campaign Planner v1.0.7 · built 2026-05-13T10:59:38.473Z
```

A matching `vX.Y.Z` chip in the sidebar footer links to the GitHub release.

### Rollback in 30 seconds

1. Open Asset Injector. Change the JS and CSS External URLs from `@latest` to the previous good tag, e.g. `@v1.0.6`.
2. Save. Clear all Drupal caches (Configuration → Performance → Clear all caches).
3. Hard-refresh the page. The version chip and console banner should now read the pinned tag.

Available tags: <https://github.com/devenpro/guaCampaignPlanner/tags>.

When the fix lands and a new tag is cut, switch Asset Injector back to `@latest`.

### Self-host fallback (Plan B)

If jsDelivr is itself the cause of an outage:

1. Download `dist/app.js` and `dist/app.css` from the GitHub release (or directly from the `dist/` folder on `main`).
2. Upload them to `sites/default/files/campaign-planner/app.js` and `…/app.css` on the Drupal site.
3. In Asset Injector, change the External URLs to:
   - `/sites/default/files/campaign-planner/app.js?v=1.0.7`
   - `/sites/default/files/campaign-planner/app.css?v=1.0.7`
4. Bump the `?v=` query string every time you re-upload — Drupal and browsers will treat it as a new asset.
5. Clear all Drupal caches.

To revert to the CDN, flip the URLs back to `@latest`.

## Concatenation order

The walk order matches the original three monolithic files:

1. Everything in `src/10-part1/` (was `cp-part1.js`)
2. Everything in `src/20-part2a/` (was `cp-part2a.js`)
3. Everything in `src/30-part2b/` (was `cp-part2b.js`)

Within each part folder, files concat in numeric order (00-, 01-, 02-, …).
Each part is wrapped in its own IIFE: the `00-header.js` opens the IIFE
(`(function($, Drupal) { 'use strict';`) and the final file in each part
closes it (`})(jQuery, Drupal);`).

This means individual source files are **not** standalone-valid JS (they
have unbalanced braces by design). Only the concatenated `dist/app.js` is
valid. Linters run against individual source files will complain — that's
expected; lint the build output if needed.

## Troubleshooting

### "The page is blank after a deploy"

Use the console banner to pinpoint which layer is wrong. Open DevTools (F12) → Console.

1. **No `[CP] Campaign Planner v…` line at all.** The bundle didn't execute. Open the Network tab, find the `app.js` request, click into Response. Common causes: 404 (Asset Injector URL is wrong), syntax error from a half-built bundle, or a CSP blocking jsDelivr.
2. **Banner shows an older version than expected.** It's a cache. In order:
   - Browser: hard-refresh (Ctrl+Shift+R / Cmd+Shift+R).
   - jsDelivr (if you must — `@latest` resolves instantly to new tags, but you can purge anyway):
     `https://purge.jsdelivr.net/gh/devenpro/guaCampaignPlanner@latest/dist/app.js`
     `https://purge.jsdelivr.net/gh/devenpro/guaCampaignPlanner@latest/dist/app.css`
   - Drupal: Configuration → Performance → Clear all caches.
3. **Banner shows the right version, but the UI is blank.** It's a runtime bug, not a delivery problem. Look for `[CP] Part 1 init CRASHED` or `[CP] renderCurrentView crashed` in the console. Until the source is fixed, pin Asset Injector to the previous `@vX.Y.Z` tag (see "Rollback in 30 seconds" above).

### "A view opens blank"

The app now renders a red diagnostic card whenever a view renderer throws
(error boundary in `renderCurrentView`). If you see a blank page anyway:

1. Open browser DevTools (F12) → Console tab.
2. Click the broken nav item again. Look for `[CP] renderCurrentView crashed`.
3. If the crash card appears in the content area, expand "Stack trace" and copy the contents — that's exactly what to share with the dev.
4. If neither console error nor crash card appears, the app probably hasn't loaded the new `dist/app.js` yet — apply the cache hygiene above.

### "Some buttons don't respond (e.g. AI suggest, inspector tabs)"

Part 2A and Part 2B register handlers in "islands" — one island failing no
longer disables the rest. If a console error reads
`[CP] Handler block "<name>" failed: …`, that island's controls are dead
but everything else still works. Copy the stack and share it.

### "The app shows my data but nothing edits / saves"

Check the Drupal node form — Campaign Planner saves through the host
node's data textarea via Drupal's normal node form submit. If the Save
button at the top-right of the planner UI says "Drupal save button not
found", the integration with the host node has broken (the planner can't
locate the form). Confirm the page is a `node--type-campaign-planner`
node and that the node form is visible (even if hidden via CSS).

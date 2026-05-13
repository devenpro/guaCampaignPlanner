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
points two External rules at jsDelivr URLs:

| Asset | URL |
| --- | --- |
| CSS | `https://cdn.jsdelivr.net/gh/devenpro/guaCampaignPlanner@main/dist/app.css` |
| JS  | `https://cdn.jsdelivr.net/gh/devenpro/guaCampaignPlanner@main/dist/app.js` |

Both rules are conditional on the `node--type-campaign-planner` body class.

### Pushing a change

1. Edit a file under `src/`.
2. `node scripts/build.mjs` to rebuild `dist/app.js` and `dist/app.css`.
3. `git add .` && `git commit -m "..."` && `git push`.
4. (Optional, for instant pickup) purge the jsDelivr cache:
   - `https://purge.jsdelivr.net/gh/devenpro/guaCampaignPlanner@main/dist/app.js`
   - `https://purge.jsdelivr.net/gh/devenpro/guaCampaignPlanner@main/dist/app.css`
   - Otherwise the CDN serves the previous version for up to 12 hours.

### Cutting a version tag (for production stability)

```powershell
git tag v1.0.1
git push --tags
```

Then change the Asset Injector URLs from `@main` to `@v1.0.1`. Tag URLs are
immutable and cached forever on jsDelivr — you only update Asset Injector
when you intentionally cut a release.

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

### "I pushed a change but the live site still shows the old version"

The dist file is served from jsDelivr's CDN, which caches aggressively.
Three layers may need invalidating, in this order:

1. **jsDelivr CDN** — hit the purge URLs once:
   - `https://purge.jsdelivr.net/gh/devenpro/guaCampaignPlanner@main/dist/app.js`
   - `https://purge.jsdelivr.net/gh/devenpro/guaCampaignPlanner@main/dist/app.css`
2. **Browser cache** — hard-refresh the Drupal page: Ctrl+Shift+R (Windows / Linux) or Cmd+Shift+R (Mac). A regular reload is not enough.
3. **Drupal cache** — if Asset Injector or another caching module is storing the asset URL itself, clear it: Administration → Configuration → Performance → Clear all caches.

Without a purge, jsDelivr serves the previous version for up to 12 hours.

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

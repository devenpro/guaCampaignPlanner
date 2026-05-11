# Campaign Planner — Troubleshooting

## Part 2B Timeout ("Part 2B not loaded after 8s")

### Diagnosis
Open browser DevTools Console and look for `[CP]` prefixed messages:

#### Pattern A: Part 1 never initializes
```
[CP] Part 1 script loaded. Page check: isCpPage=false
```
**Fix:** Body class doesn't match. Check if Drupal uses `node--type-campaign-planner` or `node--type-campaign_planner` (hyphens vs underscores). Update `isCpPage()` accordingly.

#### Pattern B: Form fields not found
```
[CP] behaviors.attach: form fields not found in context
[CP] window.load fallback → calling init()
[CP] Could not find Drupal form
```
**Fix:** The 3 textarea fields (field_json_data, field_json_meta, field_activity_log) don't exist on this content type. Add them in Drupal admin.

#### Pattern C: Part 2A crashes
```
[CP] Part 2A init CRASHED: someFunction is not defined
```
**Fix:** An export reference is broken. Check that all functions referenced in `window._cpPart2A = { ... }` exist.

#### Pattern D: Files not loading
```
[CP] Part 2B: Timed out. Part 2A JS file not loaded
```
**Fix:** Asset Injector configuration. Ensure all 5 files are configured with correct body class condition.

### Quick Fix Checklist
1. Clear Drupal cache (Admin → Configuration → Performance)
2. Hard refresh browser (Ctrl+Shift+R)
3. Check Asset Injector has all 5 files with correct condition
4. Check file load order (part1 → part2a → part2b)
5. Verify body class matches `node--type-campaign-planner`
6. Check console for `[CP] Part 1 init CRASHED` errors

## AI Not Working
1. Check console for `[CP] LLMService: No LLM config found`
2. Verify `.llm-brand-config-data` or `.llm-config-data` div exists in page HTML
3. Check that at least one provider is `active: true` with active models
4. Test connection via Settings → AI Configuration → Test Connection

## Brand Context Not Loading
1. Check console for `[CP] BrandService: none, contexts:`
2. Verify `.brand-data` div exists in page HTML
3. Check that `.brand-core-data` sub-div has valid JSON

## Images Not Working
1. Check console for `[CP] No image field found (field_images)`
2. Add `field_images` (Image, multi-value) to the content type
3. Images view will show setup instructions if field is missing

## Undo/Redo Not Working
If `snapshot()` fails silently, check console for:
```
[CP] Part 2A: snapshot failed (non-fatal): deepClone is not a function
```
This means `window._cpDeepClone` export from Part 1 isn't available. Usually caused by Part 1 file being outdated.

## Data Not Saving
1. Check that `syncToTextarea()` is called after changes
2. Verify Drupal Save button selector: `#edit-submit` or `[data-drupal-selector="edit-submit"]`
3. Check that textarea fields aren't empty after sync (inspect hidden elements)

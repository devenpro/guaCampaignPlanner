# Campaign Planner — Project Documentation

## Overview

The Campaign Planner (CP) is a Drupal 11 Node-Based Application for Meta ad campaign creative planning. It uses a "recipe" metaphor where persona × message × style × visual format combinations flow through a 5-step production pipeline.

| Property | Value |
|----------|-------|
| Content type | `campaign_planner` |
| Body class | `node--type-campaign-planner` |
| CSS prefix | `cp-` / JS prefix | `_cp` |
| Total codebase | 11,795 lines (5 files) |
| Views | 13 / Entity types | 9 / AI functions | 15 |

## Drupal Configuration

### Content Type Fields

| Field | Machine Name | Type | Cardinality | Purpose |
|-------|-------------|------|-------------|---------|
| JSON Data | `field_json_data` | Text (long) | 1 | All entity data |
| JSON Meta | `field_json_meta` | Text (long) | 1 | Config, settings, AI prefs, templates |
| Activity Log | `field_activity_log` | Text (long) | 1 | Activity entries |
| Images | `field_images` | Image | Unlimited | Reference images (optional) |

### Asset Injector (5 files, order matters)

| # | File | Lines | Type | Condition |
|---|------|-------|------|-----------|
| 1 | `cp-part1.css` | 503 | CSS | `node--type-campaign-planner` |
| 2 | `cp-part2.css` | 517 | CSS | `node--type-campaign-planner` |
| 3 | `cp-part1.js` | 4,996 | JS | `node--type-campaign-planner` |
| 4 | `cp-part2a.js` | 3,216 | JS | `node--type-campaign-planner` |
| 5 | `cp-part2b.js` | 2,563 | JS | `node--type-campaign-planner` |

### Global Resources Required

| Resource | Selector | Source |
|----------|----------|--------|
| User data | `#guau-userdata` | Drupal block/module |
| AI config (brand) | `.llm-brand-config-data` | Brand Profile module |
| AI config (user) | `.llm-config-data` | User profile module |
| Brand context | `.brand-data` (+ 5 sub-divs) | Brand Profile module |

### External Dependencies
jQuery (Drupal core), Bootstrap 5 (theme), Font Awesome Pro (theme), Quill.js 2.0.3 (CDN at runtime)

## File Inventory

| File | Lines | Sections | Purpose |
|------|-------|----------|---------|
| `cp-part1.js` | 4,996 | 23 | Shell, state, 13 views, CRUD, 95 exports |
| `cp-part2a.js` | 3,216 | 20 | Modals, pipeline editors, wizard, 46 exports |
| `cp-part2b.js` | 2,563 | 23 | AI services, Research/Settings/Images, 23 exports |
| `cp-part1.css` | 503 | — | Design system, shell, views, responsive |
| `cp-part2.css` | 517 | — | Modals, forms, campaign UI, search, bulk ops |

## Sample Data Files

| File | Purpose |
|------|---------|
| `cp-sample-data.json` | Sample field_json_data with 3 personas, 5 pain points, 4 messages, 3 styles, 3 formats, 6 recipes, 2 campaigns |
| `cp-sample-meta.json` | Sample field_json_meta with workspace, settings, AI prefs, 2 recipe templates |
| `cp-sample-activity.json` | Sample field_activity_log with 28 activity entries |

## Related Documentation

| Document | Contents |
|----------|----------|
| `CP-SYSTEM-PROMPT.md` | System prompt for Claude project sessions |
| `CP-ARCHITECTURE.md` | Init chain, state flow, global resources, renderer registry |
| `CP-DATA-MODEL.md` | Complete JSON schemas for all 3 fields |
| `CP-DEVELOPMENT-GUIDE.md` | How to add features, AI calls, brand context |
| `CP-API-REFERENCE.md` | All exports and function signatures |
| `CP-STYLE-REFERENCE.md` | CSS variables, component patterns |
| `CP-QUICK-REFERENCE.md` | One-page cheat sheet |
| `CP-CHANGELOG.md` | Version history |
| `CP-TROUBLESHOOTING.md` | Common issues, diagnostics |

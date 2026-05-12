# Campaign Planner — Changelog

## v2.0 — Meta Campaign Planner restructure

Major architecture shift from a recipe-centric model to Meta's native
**Campaign → Ad Set → Ad** hierarchy. Everything ships behind a feature
flag (`S.meta.setup.meta_v2`, default `false`); the legacy UI stays
fully functional for unmigrated workspaces.

See `docs/CP-RESTRUCTURE-PLAN.md` for the durable spec.

### Stage 0 — Foundations
- New constants module (`src/10-part1/01b-meta-constants.js`) with Meta
  enums: objectives, optimization goals, billing events, placements,
  CTAs, bid strategies, ad creative types, A/B roles, ad pipeline
  statuses, special ad categories, attribution windows.
- New data arrays: `campaigns_v2[]`, `ad_sets[]`, `ads[]` with field-
  level migration helpers. `S.meta.setup.meta_v2`, `migrated_to_v2`,
  `meta_defaults` (Page ID / Pixel / Business Manager etc.) and
  `legacy_backup` placeholders.
- `buildMaps()` extended to compute `campaignV2Map`, `adSetMap`, `adMap`
  and the child-by-parent lookups.
- CRUD helpers (`createEntity` / `deleteEntity` / `saveEntityField` /
  `duplicateEntity`) handle the three new types with cascading deletes
  and id prefixing.
- UI label "Meta Campaign Planner" (machine names + Drupal content
  type unchanged).

### Stage 1 — Campaign + Ad Set + Ad CRUD
- New `meta_campaigns` list view: card grid with search, status and
  objective filters; "Generate from brief" CTA.
- New `campaign_workspace` view: tree pane (Campaign → Ad Sets → Ads
  with status dots, A/B badges, child counts) + inspector pane.
  Breadcrumbs and nested hash routes (`#campaign/<id>/ad_set/<id>/
  ad/<id>`).
- Campaign / Ad Set / Ad CRUD modals with all Meta-shaped fields.
  Optimization goals automatically filter to valid options for the
  parent Campaign's objective.

### Stage 2 — Two-tier creative workflow
- Tabbed inspector: Ad Set → Overview / Brief / Settings; Ad →
  Overview / Hook / Copy / Media / Review.
- Inline editing: blur to save, no modal round-trip.
- Brief tab: creative direction, multi-select chips for library
  Messages/Styles/Formats, hook angles list, AI notes.
- Ad pipeline editor: hook with "pull from message" (captures snapshot),
  copy with char counters, media editor per creative type (image brief
  / video storyboard + script table / carousel cards), review tab.
- Snapshot helpers (`isPersonaSnapshotStale`, `isMessageSnapshotStale`)
  + auto-status engine (`evaluateAdAutoStatus`, `maybeAdvanceAdStatus`).

### Stage 3 — Library ↔ Workspace integration
- "Used in workspace" widget on Persona + Pain Point detail panes;
  reverse-lookup helpers (`findAdSetsUsingPersona`, etc.).
- "Create Ad Set from this Persona" CTA (auto-picks campaign or
  prompts a chooser when many exist). "Attach to Ad Set brief" picker
  for Messages / Styles / Formats.
- Snapshot divergence pill with one-click re-sync.

### Stage 4 — AI integration (10 new functions)
- Flagship: `aiGenerateCampaignTree` (brief → full Campaign + Ad Sets
  + Ads, preview modal with checkboxes at every level, jump to new
  Campaign Workspace on accept).
- Per-level: `aiSuggestAdSets`, `aiSuggestAds`, `aiGenerateAdSetBrief`,
  `aiGenerateAdHooks`, `aiWriteAdCopy`, `aiImproveAdCopy`,
  `aiGenerateAdImagePrompt`, `aiGenerateVideoBlueprint`,
  `aiGenerateVideoScript`. All reuse `LLMService` + `BrandService` +
  `callAIWithRetry` + `showAIPreview`.

### Stage 5 — A/B testing
- Campaign `ab_test` config modal: enable, pick primary metric,
  assign Ad Sets as Control / Variant A / Variant B.
- Compare Variants modal: side-by-side cards with briefs, top Ads,
  mark-winner / clear-winner actions.

### Stage 6 — Migration importer
- 5-step wizard in Settings → "Meta v2" tab.
- Maps legacy objectives, statuses, recipe pipeline statuses, media
  types to Meta enums. Groups recipes by `persona_id` into Ad Sets.
- Preserves old payload in `S.meta.legacy_backup`; flips `meta_v2`
  and `migrated_to_v2` flags; clears legacy arrays from `S.data`.

### Stage 7 — Export
- JSON tree download (single Campaign or all).
- Meta bulk-upload CSV (3 files: Campaigns / Ad Sets / Ads). Column
  layout mirrors Meta Ads Manager bulk import spec.
- Pre-flight validation surfaces errors (block CSV) + warnings.
- Per-field copy helpers on the Ad inspector.

### Stage 8 — Dashboard polish + docs
- Meta Campaigns widget on Dashboard (when v2 is on): 4-stat row
  (campaigns / ad sets / ads / diverged snapshots), pipeline bar
  rollup, "Continue working" list of 3 most-recent Ads.
- Documentation refreshed (this changelog + plan doc).

---

## v1.0 — Initial Build (Phases 1-4)
**+1,307 lines**

### Phase 1: Critical Bug Fixes (+92 lines)
- Fixed AI Research Panel on individual views — renderer registry pattern
- Ported SCP image upload mechanism to CP
- New expandable recipe AI action bar with provider/model selector

### Phase 2: Core Missing Features (+340 lines)
- Dedicated Pain Points page with split-pane, AI research, search, category filter
- Dedicated Formats page with card grid, AI research
- Brand Context Display on Dashboard — 4-card grid
- APP_VIEWS expanded from 11 to 13

### Phase 3: Campaign System Overhaul (+623 lines)
- Campaign data model: persona_ids[], message_ids[], style_ids[], format_ids[], phases[], brief
- Campaign Detail View with tabbed interface
- Campaign Wizard (4-step modal)
- Campaign-Level AI: recipe suggestion function

### Phase 4: AI & Pain Point Enhancements (+252 lines)
- AI Preview System: 2-3 alternatives with "Use This" + regenerate
- aiWriteContent and aiGenerateBrief upgraded to alternatives mode
- aiImproveContent — side-by-side comparison
- Pain Point inline editing, multi-select persona linking

## v1.1 — Production Readiness (Phases A-E)
**+1,245 lines**

### Phase A: Critical Crash Fix (+78 lines)
- Root cause: broken `renderCampaignCard` export crashing Part 1 IIFE
- Removed broken export, added missing CSS rules
- Campaign edit modal saves all 13 fields
- Recipe list shows campaign badge

### Phase B: Campaign-Centric Experience (+511 lines)
- Campaign detail rewritten with 4-tab interface (Overview, Recipes, Creative Direction, AI Research)
- Coverage matrix (persona × message grid)
- Campaign phases CRUD modal
- Timeline bar with phase segments
- 3 campaign AI functions

### Phase C: Recipe Pipeline Polish (+215 lines)
- Clickable campaign badge + "Move to Campaign" modal
- Recipe completion percentage calculator + mini progress bar
- Health indicators (overdue/stale)
- Recipe templates: save/apply/delete

### Phase D: Image System Enhancement (+79 lines)
- Smart empty state with Drupal setup instructions
- Reference image remove buttons
- Upload from recipe media step
- Image usage tracking
- Campaign association for images

### Phase E: Polish & Production Readiness (+362 lines)
- Calendar: campaign phases, filters (campaign + status), clickable bars
- Dashboard: "Continue working" card, active campaigns summary
- Global search (Ctrl+K): searches 6 entity types, grouped results
- Bulk operations: toggle mode, select all, bulk status/campaign/delete
- Export: copy ad copy, copy brief, export recipe JSON

## v1.1.1 — Init Chain Fix
- Added `window.addEventListener('load')` fallback to Part 1
- Comprehensive `[CP]` diagnostic logging across all 3 JS files
- snapshot() wrapped in try-catch in Part 2A init (non-fatal)
- Enhanced Part 2B timeout diagnostics with specific failure messages

## Final Stats
| File | Lines |
|------|-------|
| cp-part1.js | 4,996 |
| cp-part2a.js | 3,216 |
| cp-part2b.js | 2,563 |
| cp-part1.css | 503 |
| cp-part2.css | 517 |
| **Total** | **11,795** |

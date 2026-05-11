# Campaign Planner — Changelog

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

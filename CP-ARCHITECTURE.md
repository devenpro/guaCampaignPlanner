# Campaign Planner — Architecture

## 3-File JS Architecture
```
cp-part1.js (App Shell)
  ├── Constants, State Object S
  ├── Initialization (Drupal.behaviors + window.load fallback)
  ├── Data loading & migration
  ├── Map builders (entity lookup maps)
  ├── Navigation & hash management
  ├── Utilities (esc, icon, formatDate, truncate, etc.)
  ├── App shell rendering (header, sidebar, content area)
  ├── 13 view renderers (dashboard through settings placeholders)
  ├── Filtering & sorting helpers
  ├── CRUD helpers (createEntity, deleteEntity, saveEntityField)
  ├── Auto-status engine
  └── 92 window._cp* exports

cp-part2a.js (Editing Layer)
  ├── Imports Part 1 via window._cp* globals
  ├── Modal system (openModal, closeModal, openConfirmDialog)
  ├── Undo/redo (snapshot, history stack)
  ├── CRUD modals for all 9 entity types
  ├── 5 pipeline step renderers (composition → review)
  ├── Campaign wizard (4-step modal)
  ├── Mix & Match batch recipe engine
  ├── Tag input component
  ├── Recipe AI action bar (expandable picker)
  ├── ~45 event handlers
  └── window._cpPart2A = { 46 exports }

cp-part2b.js (AI & Tools Layer)
  ├── Imports Part 1 + Part 2A
  ├── LLMService (8 providers, config parsing, callAI)
  ├── BrandService (prompt construction, design context)
  ├── AI response parsing & retry logic
  ├── 15 AI action functions
  ├── AI preview modal (alternatives selector)
  ├── Research Lab view
  ├── Settings view (6 tabs)
  ├── Images view (gallery, metadata, picker)
  ├── Import/Export (JSON)
  ├── ~25 event handlers + keyboard shortcuts
  └── window._cpPart2B = { 23 exports }
```

## Initialization Chain
```
Page Load
  │
  ├─ Part 1 IIFE executes (defines functions, sets up behaviors)
  │    │
  │    ├─ Drupal.behaviors.cpPart1.attach() fires
  │    │    └─ Checks body class, form fields → calls init()
  │    │
  │    └─ window.addEventListener('load') fallback
  │         └─ If init() hasn't run yet → calls init()
  │
  │  init():
  │    parseUserData() → detectDrupalForm() → loadData()
  │    → migrateMeta() → migrateData() → parseBrandData()
  │    → parseImageField() → injectQuillCSS()
  │    → buildMaps() → renderApp() → setupEventHandlers()
  │    → startAutoSave() → S.initialized = true
  │
  ├─ Part 2A IIFE executes
  │    └─ Polls every 100ms for S.initialized
  │         └─ initPart2A(): imports, registers renderers, events, snapshot
  │              └─ window._cpPart2A = { exports }
  │
  └─ Part 2B IIFE executes
       └─ Polls every 100ms for S.initialized + _cpPart2A
            └─ initPart2B(): imports, LLMService.init(), BrandService.init()
                 └─ registers views, events, keyboard shortcuts
                 └─ window._cpPart2B = { exports }
```

## State Architecture
State is a single object `S` (aliased as `window._cpState`) containing:
- `S.data` — all entity arrays (syncs to field_json_data)
- `S.meta` — config, preferences, templates (syncs to field_json_meta)
- `S.activity` — activity log array (syncs to field_activity_log)
- `S.user` — current user info (read-only, from DOM)
- `S.brand` — brand context (read-only, from DOM)
- `S.*Map` — computed lookup maps (rebuilt on every data change)
- `S.*Filter` — view filter state (not persisted)
- UI state: `currentView`, `selectedRecipeId`, `currentStep`, etc.

## Data Flow
```
User Action → Event Handler → Update S.data/S.meta
  → snapshot() (undo history)
  → buildMaps() (rebuild lookups)
  → render() (redraw current view)
  → syncToTextarea() (write JSON to Drupal fields)
  → toast() (user feedback)
```

## Save Flow
```
syncToTextarea():
  JSON.stringify(S.data) → #edit-field-json-data-0-value
  JSON.stringify(S.meta) → #edit-field-json-meta-0-value
  JSON.stringify(S.activity) → #edit-field-activity-log-0-value

Save button click:
  syncToTextarea() → S.$submitBtn.click() → Drupal form submit → DB save
```

## Renderer Registry Pattern
Views that are rendered by Part 2B register their render functions in `window._cpRenderers`:
```javascript
R.researchView = renderResearchView;   // Part 2B
R.settingsView = renderSettingsView;   // Part 2B
R.imagesView = renderImagesView;       // Part 2B
R.aiResearchPanel = renderAIResearchPanelBody;  // Part 2B

R.step_composition = renderCompositionStep;  // Part 2A
R.step_hook = renderHookStep;                // Part 2A
R.step_content = renderContentStep;          // Part 2A
R.step_media = renderMediaStep;              // Part 2A
R.step_review = renderReviewStep;            // Part 2A
```
Part 1 checks `if (R[key])` before calling, showing placeholder if not yet registered.

## AI Architecture
```
User clicks AI button
  → Expandable picker shows provider/model selectors
  → User clicks Generate
  → callAIWithRetry(prompt, success, error, actionId, systemPrompt)
    → LLMService.callAI()
      → Builds provider-specific request (Gemini/Claude/OpenAI format)
      → fetch() to provider endpoint
      → _extractText() normalizes response
    → On success: parseJSON() if structured output expected
    → Update entity fields → render → syncToTextarea
```

## Hash Navigation
- `navigate(view)` → `updateHash(view)` → `history.replaceState(null, null, '#' + view)`
- `readHash()` reads `window.location.hash` → maps to APP_VIEWS key
- `$(window).on('hashchange')` re-reads hash and navigates
- No hash-related AI loading issues (config loads from DOM at init time)

## Global Resource Loading
| Resource | When | Source | Used By |
|----------|------|--------|---------|
| User data | Part 1 init | `#guau-userdata` DOM div | Activity log, header display |
| Brand context | Part 1 init + Part 2B init | `.brand-data` DOM div | Dashboard display, AI prompts |
| AI config | Part 2B init | `.llm-brand-config-data` or `.llm-config-data` | All AI functions |
| Reference images | Part 1 init | `.field--name-field-images` DOM scan | Images view, recipe media step |

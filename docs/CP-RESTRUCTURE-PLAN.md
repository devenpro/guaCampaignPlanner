# Meta Campaign Planner — Restructure Plan

> **Status**: In-progress restructure from a recipe-centric app to a Meta-native
> Campaign → Ad Set → Ad hierarchy. This document is the durable spec the build
> work refers to. Each stage produces a working `dist/app.{js,css}` build.

## Why

Today, the Campaign Planner is **recipe-centric**: a "recipe" is a persona ×
message × style × visual_format combination running through a 5-step pipeline.
Campaigns are just bags of dimension IDs.

In Meta Ads Manager, the working unit is the **Campaign**, with a strict
hierarchy:

```
Campaign           — objective, budget mode, A/B test, spend cap, schedule
   └─ Ad Set       — audience, placements, optimization, budget (if ABO), schedule
        └─ Ad      — creative (copy, headline, CTA, media), tracking
```

Practitioners plan at the campaign level and drill down. The current model
makes them think upside-down (build recipes first, group them after). We are
restructuring so the workflow matches reality and so exporting to Meta becomes
mechanical instead of a translation exercise.

## Locked decisions

| Decision | Choice |
|---|---|
| **Library role** | Hybrid — Personas/Messages/Styles/Formats stay as a library; attaching one to an Ad Set/Ad creates a **snapshot** that can diverge from the source |
| **Field shape** | **Meta-shaped storage** (e.g. `OUTCOME_LEADS`, `OFFSITE_CONVERSIONS`) + friendly UI labels ("Leads", "Conversions") |
| **Migration** | **Clean break + one-time importer wizard.** Old data preserved in `S.meta.legacy_backup` until manually discarded |
| **Creative workflow** | **Two-tier**: brief at Ad Set, polish at Ad. Ad pipeline = Hook → Copy → Media → Review (Composition step is now inherited from Ad Set) |
| **AI** | **Both**: full-tree Campaign Generator (brief → entire Campaign/AdSet/Ad tree) + per-level AI assist on every node |
| **Audience v1** | **Persona link + snapshot + override notes.** Detailed interests/behaviors/custom audiences deferred to v2 |
| **Feature scope v1** | **Core hierarchy + A/B testing.** Advantage+, Catalogs, DPA deferred |
| **Execution** | **JSON + Meta bulk-upload CSV** in v1; direct Marketing API in a follow-up phase |

## Naming

- **UI label**: "Meta Campaign Planner"
- **Drupal content type**: `campaign_planner` (unchanged)
- **Body class**: `node--type-campaign-planner` (unchanged)
- **CSS prefix**: `cp-` (unchanged)
- **JS prefix**: `_cp` (unchanged)
- **Distribution**: `dist/app.js` + `dist/app.css` via jsDelivr (unchanged)

## Target data model

### `S.data` — additions

```jsonc
{
  // NEW — top of Meta hierarchy
  "campaigns_v2": [{
    "id": "cmpv2_xxx",
    "name": "",
    "description": "",
    "objective": "OUTCOME_AWARENESS | OUTCOME_TRAFFIC | OUTCOME_ENGAGEMENT |
                   OUTCOME_LEADS | OUTCOME_APP_PROMOTION | OUTCOME_SALES",
    "buying_type": "AUCTION | RESERVED",
    "budget_mode": "CBO | ABO",
    "daily_budget": null,
    "lifetime_budget": null,
    "spend_cap": null,
    "bid_strategy": "LOWEST_COST_WITHOUT_CAP | LOWEST_COST_WITH_BID_CAP |
                     COST_CAP | LOWEST_COST_WITH_MIN_ROAS",
    "special_ad_categories": [],      // CREDIT | EMPLOYMENT | HOUSING | ISSUES_ELECTIONS_POLITICS | NONE
    "start_time": "ISO",
    "stop_time": "ISO",
    "status": "DRAFT | ACTIVE | PAUSED | ARCHIVED | DELETED",
    "ab_test": {
      "enabled": false,
      "primary_metric": "",            // e.g. COST_PER_LEAD
      "variants": []                   // [{ ad_set_id, role: 'CONTROL'|'VARIANT_A'|'VARIANT_B', winner: bool }]
    },
    "ai_instructions": "",
    "brief": "",
    "tags": [],
    "notes": "",
    "created": "ISO", "updated": "ISO", "created_by": ""
  }],

  // NEW — middle layer
  "ad_sets": [{
    "id": "adset_xxx",
    "campaign_id": "cmpv2_xxx",
    "name": "",

    // Audience (v1: persona link + override notes; v2 will add full Meta targeting spec)
    "persona_id": "per_xxx",
    "persona_snapshot": { /* frozen copy of persona at attach time */ },
    "audience_overrides": "",          // free text for v1

    // Placement
    "placements": {
      "advantage_enabled": true,        // Meta's Advantage Placements (auto)
      "custom_placements": []           // FACEBOOK_FEED | INSTAGRAM_FEED | INSTAGRAM_REELS | STORIES | REELS_OVERLAY | ...
    },

    // Optimization
    "optimization_goal": "LINK_CLICKS | LANDING_PAGE_VIEWS | OFFSITE_CONVERSIONS |
                          LEAD_GENERATION | REACH | IMPRESSIONS | THRUPLAY |
                          POST_ENGAGEMENT | MESSAGES | APP_INSTALLS | ...",
    "billing_event": "IMPRESSIONS | LINK_CLICKS | THRUPLAY | ...",
    "attribution_setting": "1d_view | 7d_click | 1d_view_7d_click | ...",
    "bid_amount": null,

    // Budget (only if parent campaign.budget_mode === 'ABO')
    "daily_budget": null,
    "lifetime_budget": null,

    // Schedule
    "start_time": "ISO",
    "stop_time": "ISO",
    "dayparting": null,                 // null = always-on; later: schedule array

    // Strategic brief (the Ad Set tier of the two-tier workflow)
    "brief": {
      "creative_direction": "",
      "message_ids": [],                // links to library messages
      "style_ids": [],                  // links to library styles
      "format_ids": [],                 // links to library visual_formats
      "hook_angles": [],                // ["Curiosity gap on cost", "Bold ROI claim", ...]
      "ai_notes": ""
    },

    // A/B
    "ab_role": null,                    // null | 'CONTROL' | 'VARIANT_A' | 'VARIANT_B'

    "status": "DRAFT | ACTIVE | PAUSED | ARCHIVED",
    "notes": "",
    "created": "ISO", "updated": "ISO", "created_by": ""
  }],

  // NEW — leaf layer (replaces 'recipes')
  "ads": [{
    "id": "ad_xxx",
    "ad_set_id": "adset_xxx",
    "name": "",

    "creative_type": "single_image | single_video | carousel",

    "creative": {
      "primary_text": "",
      "headline": "",
      "description": "",
      "cta_type": "LEARN_MORE | SIGN_UP | SHOP_NOW | DOWNLOAD | BOOK_TRAVEL |
                    GET_OFFER | SUBSCRIBE | CONTACT_US | APPLY_NOW | ...",
      "cta_link": "",
      "display_link": "",
      "tracking_params": ""
    },

    // Hook polish layer
    "hook": {
      "source_message_id": "",          // optional: which library message contributed
      "selected_hook_id": "",           // optional: which hook from that message
      "text": "",
      "type": "question | bold | story | data | direct | curiosity | challenge"
    },

    "media": {
      "image": { "asset_id": "", "ai_prompt": "", "brief": "", "aspect_ratio": "1:1" },
      "video": {
        "asset_id": "",
        "duration_seconds": 30,
        "aspect_ratio": "9:16",
        "concept": "",
        "blueprint": { "scenes": [{ "name": "", "description": "", "timestamp": "", "duration": 5 }] },
        "script": { "rows": [{ "time": "", "dialogue": "", "visual": "", "camera": "", "audio": "" }] }
      },
      "carousel_cards": [{ "image_asset_id": "", "headline": "", "description": "", "link": "" }]
    },

    // Snapshots — captured at attach time, manually re-syncable
    "message_snapshot": null,
    "style_snapshot": null,
    "format_snapshot": null,

    "pipeline_status": "hook_ready | copy_ready | media_ready | in_review | approved | live | paused | archived",
    "review_notes": "",
    "production_notes": "",
    "assigned_to": "",
    "due_date": "",
    "tags": [],
    "created": "ISO", "updated": "ISO", "created_by": ""
  }]
}
```

### `S.data` — preserved (the Creative Library)

`persona_categories`, `personas`, `pain_points`, `messages` (with hooks),
`styles`, `visual_formats`, `tags` — all unchanged. These remain the reusable
"seed pool" that gets snapshotted into Ad Sets and Ads.

### `S.data` — deprecated (post-migration)

`campaigns` (v1 schema), `recipes` — preserved in `S.meta.legacy_backup` after
migration; eventually removed.

### `S.meta` — additions

```jsonc
{
  "setup": {
    "meta_v2": false,                  // feature flag (gates new UI)
    "migrated_to_v2": false            // set true after importer runs
  },
  "meta_defaults": {
    "page_id": "",
    "instagram_actor_id": "",
    "pixel_id": "",
    "attribution_window": "7d_click",
    "currency": "USD",
    "time_zone": "UTC",
    "business_manager_id": ""
  },
  "legacy_backup": null                // populated by importer with old data
}
```

## Stage-by-stage plan

Each stage produces a working build. Until **Stage 6** runs the importer, the
new UI is gated behind `S.meta.setup.meta_v2` and the old recipe-centric UI
remains live for production users.

### Stage 0 — Foundations & naming

**Goal**: Lay the data + constants groundwork so subsequent stages can build
the UI on top.

- New constants module: Meta objectives, optimization goals, billing events,
  placements, CTA types, bid strategies, special ad categories, attribution
  windows, A/B test primary metrics (each with `value`, `label`, `description`,
  optional `icon`/`color`)
- Extend `getDefaultData()` with `campaigns_v2: []`, `ad_sets: []`, `ads: []`
- Extend `getDefaultMeta()` with `setup.meta_v2`, `setup.migrated_to_v2`,
  `meta_defaults`, `legacy_backup`
- Migration: `field = field || default`, idempotent
- `buildMaps()` extensions: `campaignV2Map`, `adSetMap`, `adMap`,
  `adSetsByCampaign`, `adsByAdSet`
- New entity types in `createEntity` / `deleteEntity` / `saveEntityField`:
  `campaign_v2`, `ad_set`, `ad`
- New activity types: `campaign_v2_*`, `ad_set_*`, `ad_*`, `legacy_migrated`
- App title in header reads "Meta Campaign Planner" (machine names unchanged)
- Settings: add a "Meta Defaults" tab (UI-only stub; populated in Stage 8)
- **Acceptance**: existing app still works exactly as before; new arrays + maps
  exist and are empty for all users.

### Stage 1 — Campaign + Ad Set + Ad CRUD

**Goal**: A working three-level workspace where users can manually create the
full hierarchy with all Meta-shaped fields.

- New view: **Meta Campaigns** (`#meta_campaigns`) — list/grid of v2 campaigns
- New view: **Campaign Workspace** (`#campaign/<id>`) — tree pane (left) +
  inspector pane (right). Tree shows Campaign → Ad Sets → Ads with status
  badges, expand/collapse, drag to reorder (later).
- CRUD modals:
  - **Campaign**: Name, Objective (with description tooltips), Buying Type,
    Budget Mode (CBO/ABO), Daily/Lifetime Budget, Spend Cap, Bid Strategy,
    Special Ad Categories (multi), Start/Stop time, Brief, AI instructions,
    Notes, Tags
  - **Ad Set**: Name, Persona link (with snapshot trigger), Audience override
    notes, Placements (Advantage toggle or custom multi), Optimization Goal,
    Billing Event, Attribution Setting, Bid Amount, Budget (if parent is ABO),
    Start/Stop, Brief (deferred to Stage 2 panel), Status, Notes
  - **Ad**: Name, Creative Type (single_image/video/carousel), Creative
    fields (primary text, headline, description, CTA type, link, display
    link, tracking), Hook (text + type), Media briefs (image prompt or video
    blueprint/script — minimal here, polished in Stage 2)
- Hash routing: `#campaign/<id>`, `#campaign/<id>/ad_set/<adset_id>`,
  `#campaign/<id>/ad_set/<adset_id>/ad/<ad_id>`
- Breadcrumbs in inspector header
- Sidebar shows new "Meta Campaigns" entry above old "Campaigns" while the
  feature flag is off; replaces it when on
- **Acceptance**: A user can create a Campaign, add 2 Ad Sets, add 3 Ads per
  Ad Set entirely from the UI; data persists; navigation works.

### Stage 2 — Two-tier creative workflow

**Goal**: Wire up the strategic-brief-at-AdSet, creative-polish-at-Ad pattern.

- **Ad Set inspector**: new "Brief" tab — creative direction textarea, multi-
  picker for library Messages, Styles, Formats, free-text hook angles, AI
  notes. This is the strategic layer.
- **Ad inspector**: new "Pipeline" tab with 4 steps:
  - **Hook**: free text + type picker, "pull from message" button (lists
    parent Ad Set's brief messages and their hooks)
  - **Copy**: primary text, headline, description, CTA type, link, display
    link, tracking params
  - **Media**: per `creative_type`. Single image → AI prompt + reference
    images + brief. Single video → blueprint scenes + script rows. Carousel
    → cards editor.
  - **Review**: production notes, review notes, assignee, due date, status
    selector
- **Snapshot system**:
  - When user attaches a Persona to an Ad Set → freeze
    `ad_set.persona_snapshot`
  - When user pulls a Message into an Ad → freeze `ad.message_snapshot`
  - Same for Style/Format on Ad
  - Inspector shows "Source diverged from library" pill if source entity
    has been updated since snapshot (compare `source.updated` vs.
    `snapshot.captured_at`)
- **Auto-status engine** rewritten for Ad pipeline statuses:
  `hook_ready → copy_ready → media_ready → in_review → approved → live`,
  advances forward only when relevant fields fill in (e.g. media_ready
  requires an asset OR a valid brief)
- **Acceptance**: A user can attach a Persona to an Ad Set (snapshot freezes),
  edit the Persona in the library (Ad Set surfaces "diverged" pill), pull
  a Hook from a Message into an Ad, walk an Ad through the 4 pipeline steps
  and watch status auto-advance.

### Stage 3 — Library integration

**Goal**: Make the library feel like the seed pool, not a separate world.

- Library views (Personas, Pain Points, Messages, Styles, Formats) get a
  **"Use in…"** action menu: "Create Ad Set from this Persona", "Add Message
  to Ad Set brief", "Attach Style to Ad", etc.
- Each library entity gets a "Used in" sidebar in its detail view showing
  every Ad Set/Ad referencing it
- **Snapshot divergence panel**: when looking at an Ad Set/Ad with a diverged
  snapshot, show a diff (only changed fields) with two buttons:
  - **Re-sync from library** (overwrite snapshot with current library data)
  - **Keep my version** (update `snapshot.captured_at` to now to dismiss
    the warning)
- Pain Points feed into Ad Set brief generation (Stage 4 AI uses them as raw
  material)
- Sidebar regrouping:
  - **Workspace**: Dashboard, Meta Campaigns, Calendar
  - **Library**: Personas, Pain Points, Messages, Styles, Formats
  - **Tools**: Research Lab, Images, Activity, Settings
- **Acceptance**: A user can start in the Personas view, pick one, click
  "Create Ad Set from this Persona" and land in the Campaign Workspace with
  a new Ad Set pre-populated.

### Stage 4 — AI integration

**Goal**: AI at every level + a full-tree generator.

- **`aiGenerateCampaignTree`** (the flagship): user writes a one-paragraph
  brief in a new "Generate Campaign" wizard. AI proposes:
  - 1 Campaign (objective, budget mode, budget, bid strategy, schedule)
  - 2-4 Ad Sets (persona link if matched, optimization goal, placements,
    rationale)
  - 2-4 Ads per Ad Set (hook, primary text, headline, CTA — drafts only,
    no media yet)
  - Returns as a preview tree. User can accept whole, accept per-node, or
    edit-then-accept.
- **Per-level AI assist** (uses existing `callAIWithRetry` + AI preview
  modal pattern):
  - Campaign: `aiSuggestObjective`, `aiSuggestBudget`,
    `aiGenerateCampaignBrief`
  - Ad Set: `aiSuggestAudienceAngles` (writes to brief.hook_angles),
    `aiSuggestOptimizationGoal`, `aiGenerateAdSetBrief`,
    `aiCritiqueAdSet` (warns if optimization vs audience mismatched)
  - Ad: `aiGenerateHooks` (alternatives), `aiWriteAdCopy` (alternatives:
    primary text + headline + description bundle), `aiImproveAdCopy`,
    `aiSuggestCTA`, `aiGenerateImagePrompt`, `aiGenerateVideoBlueprint`,
    `aiGenerateVideoScript`
- All AI prompts get a new system prompt section that includes the parent
  Campaign brief + parent Ad Set brief as context — so an Ad-level call
  knows the campaign objective and audience without the user re-explaining.
- **Acceptance**: User types "Run a leads campaign for SaaS marketers in
  India who run growth experiments — budget ₹2L/month, focus on Meta-only
  attribution", hits Generate. ~30s later they have a Campaign with 3
  Ad Sets and 9 Ads ready to refine.

### Stage 5 — A/B testing

**Goal**: Systematic variant testing at the Ad Set level.

- Campaign `ab_test` config modal: enable, pick primary metric, designate
  Ad Sets as Control / Variant A / Variant B (max 3 variants v1)
- Tree shows A/B badges on participating Ad Sets
- **Compare Variants** view: side-by-side card per variant Ad Set with its
  brief, audience, optimization, and current Ads
- After campaign ends, user can mark a winner (single field; no automatic
  metric pull until API integration phase)
- Activity logs all A/B state changes
- **Acceptance**: User can set up an A/B test between two Ad Sets, see them
  side-by-side, and mark a winner.

### Stage 6 — Migration importer

**Goal**: Clean break from v1 data with full safety net.

- New wizard, launched from Settings → "Migrate to Meta v2"
- Step 1: Backup confirmation — shows count of legacy campaigns + recipes;
  user confirms backup will be written to `S.meta.legacy_backup`
- Step 2: Objective mapping — for each legacy campaign's `objective` field,
  user maps to a Meta objective (with sensible defaults pre-selected)
- Step 3: Persona-to-AdSet review — per legacy campaign, show the personas
  that will become Ad Sets and let user merge/split/rename
- Step 4: Field mapping preview — show first 3 recipes converted with field
  trace (recipe.hook.custom_hook → ad.hook.text, etc.); user can adjust
  global mappings
- Step 5: Run + summary — perform migration in a transaction (snapshot first,
  apply changes, syncToTextarea); show counts (X campaigns_v2, Y ad_sets,
  Z ads created)
- Sets `S.meta.setup.meta_v2 = true` and `setup.migrated_to_v2 = true`
- Old `campaigns` + `recipes` arrays cleared from `S.data`; preserved in
  `S.meta.legacy_backup` for 90 days (cleared via Settings → "Discard
  legacy backup")
- Sidebar entries for Recipes + old Campaigns are removed
- **Acceptance**: A user with 5 legacy campaigns and 40 recipes runs the
  importer, ends up with 5 campaigns_v2, ~12 ad_sets, 40 ads. Every recipe's
  hook/copy/media is preserved.

### Stage 7 — Export: JSON + Meta bulk-upload CSV

**Goal**: Make execution mechanical.

- **JSON export**:
  - Per-Campaign (all descendants embedded)
  - All campaigns (workspace dump)
  - Includes snapshots, brief, AI history
- **Meta bulk-upload CSV** (3-sheet workbook — Campaign / Ad Set / Ad):
  - Columns mirror Meta's documented Ads Manager bulk import format
  - Validation pre-flight: missing required fields, invalid enum values,
    budget mode conflicts (CBO at parent + budgets at child), unsupported
    placement+optimization combinations, etc.
  - Pre-flight report blocks export until fixed
- **Per-field copy helpers** in Ad inspector: copy primary text, copy
  headline, copy CTA, copy link
- **Acceptance**: User exports a 3-Campaign workspace as CSV, uploads to
  Meta Ads Manager, and it imports without errors.

### Stage 8 — Dashboard, Calendar, Settings, docs, polish

**Goal**: Bring the rest of the app into the new world.

- **Dashboard** rewrite: Campaigns at center. Active campaigns card.
  Ad Sets status rollup. Recent edits. AI suggestions ("3 Ad Sets have
  diverged from their personas — re-sync?"). "Continue working" card
  reads from new entity types.
- **Calendar** adapted: shows Campaign schedule bars, Ad Set schedule bars
  underneath (timeline grouped by campaign). Click any bar to jump into
  workspace.
- **Settings** "Meta Defaults" tab: default Page ID, Instagram Actor ID,
  Pixel ID, attribution window, currency, time zone, Business Manager ID
- **Activity log** types covered for all new entity events
- **Responsive** pass: tree pane collapses to top tabs on narrow screens
- **Documentation refresh**:
  - `CP-DATA-MODEL.md` updated with new entities
  - `CP-PROJECT.md` updated view inventory
  - `CP-SYSTEM-PROMPT.md` updated to reflect Meta hierarchy
  - `CP-CHANGELOG.md` entries for each stage
- **Acceptance**: Full app feels coherent end-to-end. Dashboard says
  "Meta Campaign Planner" and rolls up new entities. Old Recipes view
  is gone. Docs match reality.

## Out of scope for v1 (deferred)

- Full Meta audience targeting (detailed interests, behaviors, custom
  audiences, lookalikes, exclusions)
- Advantage+ campaigns (Shopping, Audience suggestions)
- Product catalogs, product sets, Dynamic Product Ads (DPA)
- Direct Meta Marketing API publish (OAuth, ad account selection, error
  handling) — planned as a follow-up phase
- Dynamic Creative (multi-asset auto-mix) — easy to add later
- Multi-account / Business Manager structure
- Performance metrics pulled back from Meta (read-side)

## Build conventions for this work

- All new code follows existing patterns in `docs/CP-DEVELOPMENT-GUIDE.md`
- Save flow remains: `snapshot → buildMaps → render → syncToTextarea → toast`
- All event handlers are delegated and namespaced
- All CSS uses `cp-` prefix and CSS variables — no hardcoded colors
- Null-safe access to `S.meta.*` and `S.data.*` everywhere
- `node -c` syntax check after each file change
- After each stage: rebuild `dist/`, commit with a clear message, push to
  `claude/restructure-campaign-planner-3RH61`

## Open questions to resolve mid-build (not blocking)

- Exact column layout for Meta bulk-upload CSV — confirm against Meta's
  current published spec before Stage 7
- Whether to keep the `campaigns_v2` array name forever or rename to
  `campaigns` after legacy data is cleared (post-migration cleanup)
- Whether snapshot divergence detection compares full JSON or a hash —
  performance test in Stage 3

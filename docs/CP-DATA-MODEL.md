# Campaign Planner — Data Model

> **v2 note**: As of the Meta restructure, the working hierarchy is
> `campaigns_v2 → ad_sets → ads` (gated behind `S.meta.setup.meta_v2`).
> The legacy `campaigns` + `recipes` schemas below are preserved during
> migration; once `migrated_to_v2 = true`, the legacy arrays are
> emptied and live on in `S.meta.legacy_backup` until discarded.
>
> The complete new Meta-shaped schemas are documented in
> `docs/CP-RESTRUCTURE-PLAN.md` under "Target data model". The
> condensed summary:
>
> ```
> campaigns_v2: [{ id, name, objective: 'OUTCOME_LEADS'|..., buying_type,
>   budget_mode: 'CBO'|'ABO', daily_budget, lifetime_budget, spend_cap,
>   bid_strategy, special_ad_categories[], start_time, stop_time,
>   status: 'DRAFT'|'ACTIVE'|'PAUSED'|'ARCHIVED'|'DELETED',
>   ab_test: { enabled, primary_metric, variants[] }, brief,
>   ai_instructions, tags[], notes, created, updated }]
>
> ad_sets: [{ id, campaign_id, name, persona_id, persona_snapshot,
>   audience_overrides, placements: { advantage_enabled, custom_placements[] },
>   optimization_goal, billing_event, attribution_setting, bid_amount,
>   daily_budget, lifetime_budget, start_time, stop_time,
>   brief: { creative_direction, message_ids[], style_ids[], format_ids[],
>            hook_angles[], ai_notes },
>   ab_role: null|'CONTROL'|'VARIANT_A'|'VARIANT_B',
>   status, created, updated }]
>
> ads: [{ id, ad_set_id, name, creative_type: 'single_image'|'single_video'|'carousel',
>   creative: { primary_text, headline, description, cta_type, cta_link,
>               display_link, tracking_params },
>   hook: { source_message_id, selected_hook_id, text, type },
>   media: { image{}, video{}, carousel_cards[] },
>   message_snapshot, style_snapshot, format_snapshot,
>   pipeline_status: 'hook_ready'|'copy_ready'|'media_ready'|'in_review'|
>                    'approved'|'live'|'paused'|'archived',
>   review_notes, production_notes, assigned_to, due_date, tags[],
>   created, updated }]
> ```

## field_json_data (S.data)

### persona_categories
```json
{ "id": "cat_xxx", "name": "", "description": "", "order": 0, "created": "ISO", "updated": "ISO" }
```

### personas
```json
{
  "id": "per_xxx", "name": "", "description": "",
  "demographics": {
    "age_range": "", "gender": "", "location": "", "income_level": "",
    "education": "", "occupation": "", "industry": "", "custom": {}
  },
  "psychographics": {
    "desires": "", "requirements": "", "emotional_triggers": "",
    "motivations": "", "fears": "", "values": "", "custom": {}
  },
  "pain_point_ids": [], "category_id": "", "tags": [],
  "custom_pain_points": [], "notes": "",
  "created": "ISO", "updated": "ISO", "created_by": ""
}
```

### pain_points
```json
{ "id": "pp_xxx", "pain_point": "", "solution": "", "category": "", "tags": [], "created": "ISO", "updated": "ISO" }
```
Note: The persona→pain_point relationship is tracked from the persona side via `persona.pain_point_ids[]`. Pain points do not store back-references.

### messages
```json
{
  "id": "msg_xxx", "title": "", "body": "", "theme": "",
  "funnel_stages": ["fs_top"], "delivery_notes": "", "notes": "",
  "hooks": [{ "id": "h_xxx", "text": "", "type": "question" }],
  "tags": [], "created": "ISO", "updated": "ISO", "created_by": ""
}
```
Hook types: `question`, `statement`, `statistic`, `story`, `challenge`, `curiosity`, `data`, `bold`, `direct`

### styles
```json
{ "id": "sty_xxx", "name": "", "description": "", "tags": [], "created": "ISO", "updated": "ISO" }
```

### visual_formats
```json
{ "id": "vf_xxx", "name": "", "description": "", "category": "", "reference_image_ids": [], "tags": [], "created": "ISO", "updated": "ISO" }
```

### recipes
```json
{
  "id": "rec_xxx", "title": "", "status": "draft", "priority": "normal",
  "campaign_id": "", "persona_id": "", "message_id": "", "style_id": "", "visual_format_id": "",
  "selected_pain_point_ids": [], "media_type": "image",
  "hook": {
    "selected_hook_id": "", "custom_hook": "", "hook_type": ""
  },
  "content": {
    "ad_copy": "", "headline": "", "cta": "", "description": "",
    "variants": [{ "id": "var_xxx", "label": "", "ad_copy": "", "headline": "", "cta": "" }]
  },
  "image_brief": {
    "creative_brief": "", "ai_prompt": "", "negative_prompt": "",
    "reference_image_ids": [],
    "prompt_params": { "aspect_ratio": "1:1", "visual_approach": "", "mood": "", "negative_prompt": "" }
  },
  "video": {
    "duration_seconds": 30, "format": "", "aspect_ratio": "9:16", "concept": "",
    "blueprint": { "scenes": [{ "name": "", "description": "", "timestamp": "", "duration": 5 }] },
    "script": { "rows": [{ "time": "", "dialogue": "", "visual": "", "camera": "", "audio": "" }] }
  },
  "review_notes": "", "production_notes": "", "assigned_to": "",
  "due_date": "", "delivery_notes": "", "creative_brief": "",
  "tags": [], "batch_id": "",
  "created": "ISO", "updated": "ISO", "created_by": ""
}
```
Statuses: `draft`, `hook_ready`, `content_ready`, `media_ready`, `in_review`, `approved`, `live`, `paused`, `archived`
Priorities: `low`, `normal`, `high`, `urgent`, `critical`
Media types: `image`, `video`

### campaigns
```json
{
  "id": "cmp_xxx", "name": "", "description": "",
  "objective": "", "funnel_stage": "",
  "date_start": "YYYY-MM-DD", "date_end": "YYYY-MM-DD",
  "status": "planning", "budget_notes": "", "target_audience_notes": "",
  "persona_ids": [], "message_ids": [], "style_ids": [], "format_ids": [],
  "ai_instructions": "",
  "phases": [{ "name": "", "date_start": "", "date_end": "", "funnel_stage": "fs_top" }],
  "brief": "",
  "tags": [], "notes": "",
  "created": "ISO", "updated": "ISO", "created_by": ""
}
```
Statuses: `planning`, `active`, `paused`, `completed`, `archived`

### tags
```json
{ "id": "tag_xxx", "name": "", "color": "#1a73e8", "description": "", "created": "ISO" }
```

---

## field_json_meta (S.meta)

```json
{
  "workspace": { "name": "", "description": "", "created": "ISO" },
  "setup": { "product_name": "", "objective": "", "custom_instructions": "", "setup_complete": false },
  "settings": {
    "timezone": "UTC", "default_view": "dashboard", "card_density": "normal",
    "platforms": [], "tones": [], "audiences": [], "image_styles": [],
    "funnel_stages": [{ "id": "fs_top", "name": "Top of Funnel", "short": "TOFU", "color": "#1a73e8", "order": 0 }],
    "campaign_objectives": [{ "id": "obj_xxx", "name": "", "icon": "", "description": "" }],
    "visual_format_categories": [{ "id": "", "name": "", "icon": "" }],
    "pain_point_categories": [{ "id": "", "name": "", "icon": "", "color": "" }],
    "defaults": { "media_type": "image", "priority": "normal", "funnel_stage": "", "recipe_status": "draft", "campaign_status": "planning" },
    "brand_design": {
      "colors": { "primary": "", "secondary": "", "accent": "", "background": "", "text": "" },
      "typography": { "heading_style": "", "body_style": "" },
      "visual_style": "", "layout_rules": "", "brand_prompt_prefix": ""
    }
  },
  "aiPreferences": {
    "appDefault": { "provider": "", "model": "" },
    "perAction": { "ai-generate-hook": { "provider": "", "model": "" } },
    "lastProvider": "", "lastModel": ""
  },
  "reference_images": { "fid_123": { "category": "", "tags": [], "star": false, "description": "", "campaign_id": "" } },
  "image_categories": [{ "id": "imgcat_xxx", "label": "" }],
  "recipe_templates": [{ "id": "tpl_xxx", "name": "", "persona_id": "", "message_id": "", "style_id": "", "visual_format_id": "", "media_type": "image", "created": "ISO" }]
}
```

---

## field_activity_log (S.activity)

```json
[{
  "id": "act_xxx",
  "type": "recipe_created",
  "entity_type": "recipe",
  "entity_id": "rec_xxx",
  "entity_title": "Recipe Title",
  "description": "Created recipe via Mix & Match",
  "timestamp": "ISO",
  "user_id": "usr_xxx",
  "user_name": "Username"
}]
```
Log is capped at 500 entries (oldest trimmed automatically).

Activity types: `recipe_created`, `recipe_updated`, `recipe_status_changed`, `recipe_deleted`, `recipe_batch_generated`, `recipe_batch_updated`, `recipe_batch_deleted`, `persona_created`, `persona_updated`, `persona_deleted`, `category_created`, `category_deleted`, `pain_point_created`, `message_created`, `message_updated`, `message_deleted`, `style_created`, `style_updated`, `style_deleted`, `format_created`, `format_updated`, `format_deleted`, `campaign_created`, `campaign_updated`, `campaign_deleted`, `brief_generated`, `hook_generated`, `content_generated`, `media_generated`, `script_generated`, `image_uploaded`, `settings_changed`, `setup_completed`

---

## Entity Relationships
```
persona_category ──1:N──▶ persona
persona ──M:N──▶ pain_point (via pain_point.persona_ids[])
persona ──1:N──▶ recipe (via recipe.persona_id)
message ──1:N──▶ recipe (via recipe.message_id)
style ──1:N──▶ recipe (via recipe.style_id)
visual_format ──1:N──▶ recipe (via recipe.visual_format_id)
campaign ──1:N──▶ recipe (via recipe.campaign_id)
campaign ──M:N──▶ persona (via campaign.persona_ids[])
campaign ──M:N──▶ message (via campaign.message_ids[])
campaign ──M:N──▶ style (via campaign.style_ids[])
campaign ──M:N──▶ format (via campaign.format_ids[])
tag ──M:N──▶ recipe/persona/message/etc (via entity.tags[])
```

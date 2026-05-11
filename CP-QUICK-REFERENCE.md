# Campaign Planner — Quick Reference

## Drupal Config
- Content type: `campaign_planner`
- Body class: `node--type-campaign-planner`
- Fields: `field_json_data`, `field_json_meta`, `field_activity_log`, `field_images` (optional)

## Asset Injector (5 files, load order matters)
1. `cp-part1.css` — Design system, shell, views
2. `cp-part2.css` — Modals, campaign UI, search, bulk ops
3. `cp-part1.js` — Shell, state, 13 views, CRUD, exports (load first)
4. `cp-part2a.js` — Modals, pipeline editors, wizard, events
5. `cp-part2b.js` — AI services, Research/Settings/Images views (load last)

## Access Patterns
```javascript
// State
var S = window._cpState;

// User
S.user.id, S.user.name, S.user.fullName, S.user.email

// Brand
S.brand.configured           // boolean
S.brand.core.brand_name      // brand name
S.brand.core.brand_voice     // voice description
S.brand.core.forbidden_words // array

// AI — check if available
LLMService.isConfigured()

// AI — make a call
LLMService.callAI(prompt, onSuccess, onError, actionId, systemPrompt)

// AI — get brand system prompt
BrandService.getSystemPrompt('recipe')  // includes brand context
BrandService.getBrandDesignPrompt()      // visual identity for image prompts

// Entity access
S.personaMap[id], S.messageMap[id], S.styleMap[id], S.formatMap[id]
S.recipeMap[id], S.campaignMap[id], S.painPointMap[id]

// CRUD
createEntity('recipe', { title: 'New', persona_id: '...' })
saveEntityField('recipe', recipeId, 'status', 'approved')
deleteEntity('recipe', recipeId)

// Navigation
navigate('recipes')     // switch view
S.selectedRecipeId = id // select before navigating

// Save flow
syncToTextarea()  // writes JSON to Drupal fields
toast('Done!', 'success')
```

## File Selectors
| Field | Selector |
|-------|----------|
| JSON Data | `#edit-field-json-data-0-value` |
| JSON Meta | `#edit-field-json-meta-0-value` |
| Activity Log | `#edit-field-activity-log-0-value` |
| Images | `.field--name-field-images` |

## CSS Prefixes
- All classes: `cp-` prefix
- Variables: `--cp-*`
- Primary: `--cp-primary: #1a73e8`
- Success: `--cp-success: #0d904f`
- Error: `--cp-error: #d93025`
- Accent: `--cp-accent: #e37400`

## 13 Views
Dashboard, Personas, Pain Points, Messages, Styles, Formats, Recipes, Campaigns, Calendar, Research Lab, Images, Activity, Settings

## 9 Entity Types
persona, persona_category, pain_point, message, style, visual_format, recipe, campaign, tag

## Recipe Pipeline (5 steps)
Composition → Hook → Content → Media → Review

## Recipe Statuses (9)
draft → hook_ready → content_ready → media_ready → in_review → approved → live → paused → archived

## 15 AI Functions
Research: aiResearchPersonas, aiResearchPainPoints, aiResearchMessages, aiResearchStyles, aiResearchFormats
Recipe: aiGenerateHook, aiWriteContent, aiImproveContent, aiGenerateBrief, aiGenerateImagePrompt, aiGenerateBlueprint, aiGenerateScript
Campaign: aiSuggestCampaignRecipes, aiGenerateCampaignBrief, aiAnalyzeCampaignGaps

## Key Keyboard Shortcuts
- `Ctrl+K` — Global search
- `Ctrl+Z` — Undo
- `Ctrl+Shift+Z` — Redo
- `Ctrl+S` — Save
- `1-0` — Switch views

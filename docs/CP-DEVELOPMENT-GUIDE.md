# Campaign Planner — Development Guide

## Adding a New Feature

### 1. Plan: Identify which file(s) to change
- **New view?** → Part 1 (renderer) + possibly Part 2B (if AI-heavy)
- **New CRUD modal?** → Part 2A
- **New AI function?** → Part 2B
- **New pipeline step?** → Part 2A (renderer) + Part 1 (PIPELINE_STEPS constant)
- **Styling?** → Part 1 CSS (layout) or Part 2 CSS (modals/forms)

### 2. Data model changes
If adding new entity fields:
1. Add to `getDefaultData()` or `getDefaultMeta()` in Part 1
2. Add migration in `migrateData()` or `migrateMeta()` — always use `field = field || defaultValue`
3. Update sample JSON files
4. If entity needs a lookup map, add to `buildMaps()`

### 3. Implement
Follow the state update pattern:
```javascript
snapshot('Description of change');           // undo checkpoint
saveEntityField('recipe', recipeId, 'field', value);  // update
// OR direct: recipe.field = value; recipe.updated = new Date().toISOString();
buildMaps();                                 // rebuild lookups
render();                                    // redraw UI
syncToTextarea();                            // persist to Drupal
toast('Saved!', 'success');                  // user feedback
logActivity('type', 'entity_type', entityId, entityTitle, 'description');
```

### 4. Validate
```bash
node -c cp-part1.js   # Syntax check
node -c cp-part2a.js
node -c cp-part2b.js
grep 'scp[-_]' cp-*.js cp-*.css  # Check for SCP namespace leaks
```

## Making AI Calls

### Basic pattern
```javascript
function aiDoSomething(recipeId, customInstructions) {
  var recipe = getRecipe(recipeId);
  if (!recipe) return;
  var actionId = 'ai-do-something';

  // Build prompt
  var system = BrandService.getSystemPrompt('recipe');
  var context = recipeContextSnippet(recipe);
  var prompt = 'Given this recipe context:\n' + context + '\n\nDo something. Return JSON:\n{"result": "..."}';
  if (customInstructions) prompt += '\n\nAdditional instructions: ' + customInstructions;

  // Show loading
  toast('AI generating...', 'info');

  callAIWithRetry(prompt, function(text) {
    var data = parseJSON(text);
    if (!data || !data.result) { toast('Invalid AI response', 'error'); return; }

    snapshot('AI do something');
    recipe.someField = data.result;
    recipe.updated = new Date().toISOString();
    maybeAdvanceRecipeStatus(recipe, 'content');
    syncToTextarea(); buildMaps(); render();
    logActivity('something_generated', 'recipe', recipe.id, recipe.title, 'AI generated something');
    toast('Done!', 'success');
  }, function(err) {
    toast('AI error: ' + err, 'error');
  }, actionId, system);
}
```

### AI with alternatives (preview modal)
```javascript
// Request 2-3 alternatives
var prompt = '...Return JSON array: [{"label":"Option A","content":"..."}, ...]';

callAIWithRetry(prompt, function(text) {
  var options = parseJSON(text);
  if (!Array.isArray(options)) { /* handle error */ return; }

  showAIPreview(options, function(selected) {
    snapshot('AI selected option');
    recipe.content.ad_copy = selected.content;
    // ... save flow
  }, {
    title: 'Choose Version',
    formatItem: function(opt) { return '<p>' + esc(opt.content) + '</p>'; }
  });
}, errorHandler, actionId, systemPrompt);
```

## Accessing Brand Context

```javascript
// Check if brand is configured
BrandService.isConfigured()  // boolean

// Get system prompt for AI calls (includes brand context)
BrandService.getSystemPrompt('recipe')   // full prompt with brand voice, audience, etc.
BrandService.getSystemPrompt('content')  // includes writing style, CTA style

// Get brand design prompt for image AI
BrandService.getBrandDesignPrompt()  // colors, typography, visual style

// Direct access
BrandService.getCore()          // { brand_name, tagline, brand_voice, audience, ... }
BrandService.getContent()       // { writing_style, sentence_rules, cta_style }
BrandService.getSeo()           // { keyword_clusters, niche, ... }
BrandService.getForbiddenWords() // ['word1', 'word2']
BrandService.getDos()           // ['always do X']
BrandService.getDonts()         // ['never do Y']
```

## Adding a New View

1. Add to `APP_VIEWS` in Part 1:
```javascript
'myview': { order: 14, label: 'My View', icon: 'star', group: 'tools', description: 'My custom view' }
```

2. Add renderer in Part 1 (basic) or Part 2B (AI-heavy):
```javascript
function renderMyView() {
  var html = '<div class="cp-view cp-view-myview">';
  html += '<div class="cp-view-header">...';
  html += '</div>';
  return html;
}
```

3. Register in `renderCurrentView()` (Part 1) or renderer registry (Part 2B):
```javascript
// Part 2B: R.myView = renderMyView;
// Part 1: case 'myview': html = R.myView ? R.myView() : placeholder; break;
```

4. Add sidebar badge count in `renderSidebarBadge()` if needed.

## Event Handler Conventions

Always use delegated events with namespaced off/on:
```javascript
$(document).off('click.cp-my-action').on('click.cp-my-action', '[data-action="my-action"]', function(e) {
  e.preventDefault();
  var id = $(this).data('id');
  // ... handle
});
```

For inputs with debounce:
```javascript
$(document).off('input.cp-my-search').on('input.cp-my-search', '#cpMySearch', debounce(function() {
  S.myFilter.search = $(this).val() || '';
  renderCurrentView();
}, 250));
```

## CSS Conventions
- All classes use `cp-` prefix
- Never hardcode colors — use `var(--cp-primary)`, `var(--cp-success)`, etc.
- Buttons: pill-shaped with hover lift: `border-radius: var(--cp-radius-full)`, `transform: translateY(-1px)` on hover
- Inputs: `border: 1.5px solid var(--cp-border-default)`, blue glow on focus
- Cards: `background: var(--cp-white)`, `border: 1px solid var(--cp-border-light)`, `border-radius: var(--cp-radius-md)`
- Breakpoints: 1200px, 992px, 768px, 480px

## Common Patterns

### Modal CRUD
```javascript
function openMyModal(id) {
  var entity = id ? getMyEntity(id) : null;
  var isEdit = !!entity;
  var html = '<div class="cp-editor-form">';
  html += '<div class="cp-form-group"><label>Name</label>';
  html += '<input type="text" class="cp-input" data-field="name" value="' + esc(entity ? entity.name : '') + '"></div>';
  html += '</div>';

  openModal((isEdit ? 'Edit' : 'Create') + ' Entity', html, {
    titleIcon: 'star', size: 'md',
    saveLabel: isEdit ? 'Save Changes' : 'Create',
    onSave: function() {
      var fields = collectModalFields();
      snapshot(isEdit ? 'Edit entity' : 'Create entity');
      if (isEdit) {
        saveEntityField('mytype', id, 'name', fields.name);
      } else {
        createEntity('mytype', { name: fields.name });
      }
      closeModal();
      toast('Saved!', 'success');
    }
  });
}
```

### Activity Logging
```javascript
logActivity('entity_created', 'entity_type', entity.id, entity.name, 'Created via modal');
```

### Auto-status (recipes only)
```javascript
maybeAdvanceRecipeStatus(recipe, 'content');  // reason: which step completed
// Only advances forward, never regresses
```

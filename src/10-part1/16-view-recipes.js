  // ============================================================
  // SECTION 14: RECIPES VIEW (List + Pipeline Shell)
  // ============================================================

  function renderRecipesView() {
    var html = '<div class="cp-view cp-view-recipes"><div class="cp-split-pane">';
    html += renderRecipesLeftPane();
    html += '<div class="cp-preview-pane" id="cpRecipePreview">' + renderRecipeRightPane() + '</div>';
    html += '</div></div>';
    return html;
  }

  function renderRecipesLeftPane() {
    var f = S.recipeFilter;
    var recipes = getFilteredRecipes();
    var totalAll = (S.data.recipes || []).length;

    var html = '<div class="cp-list-pane">';

    // Toolbar
    html += '<div class="cp-list-toolbar">';
    // Search + buttons
    html += '<div class="cp-list-toolbar-row">';
    html += '<div class="cp-search-wrapper">' + icon('search') + '<input type="text" class="cp-input" id="cpRecipeSearch" placeholder="Search recipes..." value="' + esc(f.search) + '"></div>';
    html += '</div>';
    html += '<div class="cp-list-toolbar-row">';
    html += '<button class="cp-btn cp-btn-ai cp-btn-sm" data-action="open-mixer" data-mode="manual">' + icon('bolt') + ' Create</button>';
    html += '<button class="cp-btn cp-btn-primary cp-btn-sm" data-action="open-mixer" data-mode="batch">' + icon('shuffle') + ' Batch</button>';
    html += '</div>';

    // Filters row
    html += '<div class="cp-list-toolbar-row cp-list-filters">';
    html += '<select class="cp-select cp-select-sm" id="cpRecipeStatusFilter"><option value="">All Status</option>';
    for (var sk in RECIPE_STATUSES) {
      html += '<option value="' + sk + '"' + (f.statuses.indexOf(sk) > -1 ? ' selected' : '') + '>' + RECIPE_STATUSES[sk].label + '</option>';
    }
    html += '</select>';
    // Campaign filter
    var camps = getAllCampaigns();
    if (camps.length > 0) {
      html += '<select class="cp-select cp-select-sm" id="cpRecipeCampaignFilter"><option value="">All Campaigns</option>';
      for (var ci = 0; ci < camps.length; ci++) {
        html += '<option value="' + esc(camps[ci].id) + '"' + (f.campaign === camps[ci].id ? ' selected' : '') + '>' + esc(truncate(camps[ci].name, 20)) + '</option>';
      }
      html += '</select>';
    }
    // Production filter (has / missing production node)
    html += '<select class="cp-select cp-select-sm" id="cpRecipeProductionFilter" title="Production node status">';
    html += '<option value=""' + (!f.production ? ' selected' : '') + '>All Production</option>';
    html += '<option value="has"' + (f.production === 'has' ? ' selected' : '') + '>With Production</option>';
    html += '<option value="missing"' + (f.production === 'missing' ? ' selected' : '') + '>Missing Production</option>';
    html += '</select>';
    html += '<span class="cp-filter-count">' + recipes.length + ' of ' + totalAll + '</span>';
    html += '</div>';

    // Sort + group
    html += '<div class="cp-list-toolbar-row">';
    html += '<select class="cp-select cp-select-sm" id="cpRecipeSortBy">';
    html += '<option value="updated"' + (f.sortBy === 'updated' ? ' selected' : '') + '>Updated</option>';
    html += '<option value="created"' + (f.sortBy === 'created' ? ' selected' : '') + '>Created</option>';
    html += '<option value="title"' + (f.sortBy === 'title' ? ' selected' : '') + '>Title</option>';
    html += '<option value="priority"' + (f.sortBy === 'priority' ? ' selected' : '') + '>Priority</option>';
    html += '</select>';
    html += '<button class="cp-btn-icon cp-btn-sm" data-action="toggle-recipe-sort-dir" title="Sort direction">' + icon(f.sortDir === 'asc' ? 'arrow-up' : 'arrow-down') + '</button>';
    html += '<div style="flex:1"></div>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="toggle-bulk-mode" title="Bulk select">' + icon('list-check') + (S._bulkMode ? ' On' : '') + '</button>';
    html += '</div>';

    // Bulk action bar (visible when items selected)
    if (S._bulkMode) {
      S._bulkSelected = S._bulkSelected || [];
      var selCount = S._bulkSelected.length;
      html += '<div class="cp-bulk-bar">';
      html += '<label style="display:flex;align-items:center;gap:6px;cursor:pointer"><input type="checkbox" data-action="bulk-select-all"' + (selCount === recipes.length && selCount > 0 ? ' checked' : '') + '> All</label>';
      html += '<span class="cp-text-muted" style="flex:1">' + selCount + ' selected</span>';
      if (selCount > 0) {
        html += '<select class="cp-select cp-select-sm" id="cpBulkStatus" style="width:auto"><option value="">Status...</option>';
        for (var bsk in RECIPE_STATUSES) html += '<option value="' + bsk + '">' + RECIPE_STATUSES[bsk].label + '</option>';
        html += '</select>';
        html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="bulk-assign-campaign">' + icon('bullhorn') + '</button>';
        html += '<button class="cp-btn cp-btn-outline cp-btn-sm cp-btn-danger" data-action="bulk-delete">' + icon('trash') + '</button>';
      }
      html += '</div>';
    }

    html += '</div>'; // toolbar

    // Recipe list
    html += '<div class="cp-recipe-list" id="cpRecipeList">';
    if (recipes.length === 0) {
      html += '<div class="cp-empty-state cp-empty-state--compact"><p>No recipes' + (f.search ? ' match your search' : ' yet') + '.</p>';
      html += '<button class="cp-btn cp-btn-ai cp-btn-sm" data-action="open-mixer" data-mode="manual">' + icon('bolt') + ' Create Recipe</button></div>';
    } else {
      for (var ri = 0; ri < recipes.length; ri++) {
        html += renderRecipeListItem(recipes[ri]);
      }
    }
    html += '</div></div>';
    return html;
  }

  function renderRecipeListItem(recipe) {
    var sel = S.selectedRecipeId === recipe.id ? ' cp-recipe-item-selected' : '';
    var stCfg = RECIPE_STATUSES[recipe.status] || { label: recipe.status, color: '#80868b' };
    var priCfg = PRIORITY_LEVELS[recipe.priority] || {};
    var mt = MEDIA_TYPES[recipe.media_type] || MEDIA_TYPES.image;
    var pct = getRecipeCompletionPct(recipe);

    // Health indicators
    var healthClass = '';
    var healthIcon = '';
    if (recipe.due_date && new Date(recipe.due_date) < new Date() && recipe.status !== 'live' && recipe.status !== 'archived') {
      healthClass = ' cp-recipe-item-overdue';
      healthIcon = '<span class="cp-recipe-health" style="color:#d93025" title="Overdue">' + icon('triangle-exclamation') + '</span>';
    } else if (recipe.updated) {
      var daysSinceUpdate = Math.floor((Date.now() - new Date(recipe.updated).getTime()) / 86400000);
      if (daysSinceUpdate > 7 && recipe.status !== 'live' && recipe.status !== 'archived' && recipe.status !== 'approved') {
        healthClass = ' cp-recipe-item-stale';
        healthIcon = '<span class="cp-recipe-health" style="color:#e37400" title="Stale — ' + daysSinceUpdate + ' days since update">' + icon('clock') + '</span>';
      }
    }

    var html = '<div class="cp-recipe-item' + sel + healthClass + '" data-action="select-recipe" data-id="' + esc(recipe.id) + '">';
    // Bulk select checkbox
    if (S._bulkMode) {
      var bulkChecked = (S._bulkSelected || []).indexOf(recipe.id) > -1;
      html += '<div class="cp-recipe-item-bulk"><input type="checkbox" class="cp-bulk-check" data-action="bulk-toggle-item" data-id="' + esc(recipe.id) + '"' + (bulkChecked ? ' checked' : '') + '></div>';
    }
    html += '<div class="cp-recipe-item-left">';
    if (priCfg.color) html += '<span class="cp-priority-dot" style="background:' + priCfg.color + '" title="' + esc(priCfg.label || '') + '"></span>';
    html += '</div>';
    html += '<div class="cp-recipe-item-body">';
    html += '<div class="cp-recipe-item-title">' + esc(recipe.title || 'Untitled Recipe') + healthIcon + '</div>';
    html += '<div class="cp-recipe-item-badges">';
    html += '<span class="cp-status-badge"><span class="cp-status-dot" style="background:' + stCfg.color + '"></span>' + esc(stCfg.label) + '</span>';
    html += '<span class="cp-badge" style="background:' + mt.color + '15;color:' + mt.color + '">' + icon(mt.icon) + '</span>';
    var rProd = getRecipeProduction(recipe);
    if (rProd) {
      var prodStatusStyle = getProductionStatusStyle(rProd.status);
      var prodTitle = 'Production: ' + (rProd.title || 'connected') + (rProd.status ? ' • ' + rProd.status : '');
      html += '<span class="cp-badge cp-recipe-item-prod-badge" style="background:' + prodStatusStyle.color + '15;color:' + prodStatusStyle.color + '" title="' + esc(prodTitle) + '">' + icon('rocket') + '</span>';
    }
    var persona = S.personaMap[recipe.persona_id];
    if (persona) html += '<span class="cp-badge" style="background:#9334e915;color:#9334e9">' + esc(truncate(persona.name, 12)) + '</span>';
    var campaign = S.campaignMap[recipe.campaign_id];
    if (campaign) html += '<span class="cp-badge" style="background:#0891b215;color:#0891b2" title="Campaign: ' + esc(campaign.name) + '">' + icon('bullhorn') + ' ' + esc(truncate(campaign.name, 10)) + '</span>';
    html += '</div>';
    // Mini progress bar
    var pctColor = pct >= 80 ? 'var(--cp-success)' : pct >= 40 ? '#e37400' : 'var(--cp-gray-300)';
    html += '<div class="cp-recipe-progress-mini"><div class="cp-recipe-progress-fill" style="width:' + pct + '%;background:' + pctColor + '"></div></div>';
    html += '</div>';
    html += '<div class="cp-recipe-item-time">' + formatRelativeTime(recipe.updated || recipe.created) + '</div>';
    html += '</div>';
    return html;
  }

  function renderRecipeRightPane() {
    if (!S.selectedRecipeId || !S.recipeMap[S.selectedRecipeId]) {
      return '<div class="cp-empty-state cp-empty-state--center">' +
        '<div class="cp-empty-state-icon">' + icon('bolt') + '</div>' +
        '<div class="cp-empty-state-title">Select a recipe</div>' +
        '<div class="cp-empty-state-text">Choose a recipe from the list, or create a new one with the Mix & Match engine.</div>' +
        '<button class="cp-btn cp-btn-ai" data-action="open-mixer" data-mode="manual">' + icon('bolt') + ' Create Recipe</button></div>';
    }

    var recipe = S.recipeMap[S.selectedRecipeId];
    var R = window._cpRenderers;

    var html = '<div class="cp-recipe-detail" data-recipe-id="' + esc(recipe.id) + '">';

    // Recipe header
    html += renderRecipeDetailHeader(recipe);

    // Pipeline step indicator
    html += renderRecipePipelineIndicator(recipe);

    // Step content — Part 2A overrides via renderer registry
    html += '<div class="cp-step-content">';
    var stepKey = 'step_' + S.currentStep;
    if (R[stepKey]) {
      html += R[stepKey](recipe);
    } else {
      html += renderRecipeStepPlaceholder(recipe);
    }
    html += '</div>';
    html += '</div>';
    return html;
  }

  function renderRecipeDetailHeader(recipe) {
    var stCfg = RECIPE_STATUSES[recipe.status] || { label: recipe.status, color: '#80868b', icon: 'circle' };
    var campaign = S.campaignMap[recipe.campaign_id];
    var pct = getRecipeCompletionPct(recipe);

    var html = '<div class="cp-recipe-detail-header">';
    html += '<div class="cp-recipe-detail-title">' + esc(recipe.title || 'Untitled Recipe') + '</div>';
    html += '<div class="cp-recipe-detail-badges">';
    html += recipeStatusBadge(recipe.status);
    if (recipe.priority) html += priorityBadge(recipe.priority);
    if (campaign) html += '<span class="cp-badge cp-badge-link" style="background:#0891b215;color:#0891b2" data-action="go-to-campaign" data-id="' + esc(campaign.id) + '" title="Go to campaign">' + icon('bullhorn') + ' ' + esc(truncate(campaign.name, 18)) + '</span>';
    html += mediaTypeBadge(recipe.media_type);
    // Progress indicator
    html += '<span class="cp-badge" style="background:' + (pct >= 80 ? 'var(--cp-success-light);color:var(--cp-success)' : pct >= 40 ? '#e3740015;color:#e37400' : 'var(--cp-gray-100);color:var(--cp-text-muted)') + '">' + pct + '% complete</span>';
    html += '</div>';
    html += '<div class="cp-recipe-detail-actions">';
    html += '<button class="cp-btn-icon" data-action="duplicate-recipe" data-id="' + esc(recipe.id) + '" title="Duplicate">' + icon('copy') + '</button>';
    html += '<button class="cp-btn-icon" data-action="move-recipe-campaign" data-id="' + esc(recipe.id) + '" title="Move to campaign">' + icon('arrow-right-arrow-left') + '</button>';
    html += '<button class="cp-btn-icon" data-action="delete-recipe" data-id="' + esc(recipe.id) + '" title="Delete">' + icon('trash') + '</button>';
    html += '</div></div>';
    return html;
  }

  // C2: Recipe completion percentage (lightweight, no Part 2A dependency)
  // Counts the primary fields: persona, message, hook, ad copy, headline,
  // CTA, and a chosen media type for the production handoff.
  function getRecipeCompletionPct(recipe) {
    var done = 0, total = 7;
    if (recipe.persona_id) done++;
    if (recipe.message_id) done++;
    var hook = recipe.hook || {};
    if (hook.custom_hook || hook.selected_hook_id) done++;
    var content = recipe.content || {};
    var adCopy = stripHtml ? stripHtml(content.ad_copy || '') : (content.ad_copy || '').replace(/<[^>]*>/g, '');
    if (adCopy.trim().length >= 50) done++;
    if (content.headline && content.headline.trim()) done++;
    if (content.cta && content.cta.trim()) done++;
    if (recipe.media_type) done++;
    return Math.round((done / total) * 100);
  }

  function renderRecipePipelineIndicator(recipe) {
    var steps = PIPELINE_STEPS;
    var currentIdx = -1;
    for (var i = 0; i < steps.length; i++) {
      if (steps[i].key === S.currentStep) { currentIdx = i; break; }
    }
    if (currentIdx < 0) { S.currentStep = 'composition'; currentIdx = 0; }

    var html = '<div class="cp-pipeline-steps">';
    for (var si = 0; si < steps.length; si++) {
      var st = steps[si];
      var isActive = si === currentIdx;
      var isDone = si < currentIdx;
      var stepClass = isActive ? ' cp-step-active' : isDone ? ' cp-step-done' : '';
      html += '<button class="cp-step-item' + stepClass + '" data-action="go-step" data-step="' + st.key + '">';
      html += '<span class="cp-step-dot">' + (isDone ? icon('check') : icon(st.icon)) + '</span>';
      html += '<span class="cp-step-label">' + esc(st.label) + '</span>';
      html += '</button>';
      if (si < steps.length - 1) html += '<div class="cp-step-connector' + (isDone ? ' cp-step-connector-done' : '') + '"></div>';
    }
    html += '</div>';
    return html;
  }

  function renderRecipeStepPlaceholder(recipe) {
    var step = S.currentStep || 'composition';
    var stepCfg = PIPELINE_STEPS.find(function(s) { return s.key === step; }) || PIPELINE_STEPS[0];

    // Basic composition view as fallback (Part 2A will replace all steps)
    if (step === 'composition') {
      return renderRecipeCompositionFallback(recipe);
    }

    return '<div class="cp-step-placeholder">' +
      '<div class="cp-empty-state cp-empty-state--compact">' +
      '<div class="cp-empty-state-icon">' + icon(stepCfg.icon) + '</div>' +
      '<div class="cp-empty-state-title">' + esc(stepCfg.label) + ' Step</div>' +
      '<div class="cp-empty-state-text">This step will be available when the editor module loads.</div>' +
      '</div></div>';
  }

  function renderRecipeCompositionFallback(recipe) {
    var html = '<div class="cp-composition-card">';
    html += '<div class="cp-section-header"><h3>' + icon('shapes') + ' Creative Composition</h3></div>';
    html += '<div class="cp-composition-grid">';

    var dims = [
      { key: 'persona', id: recipe.persona_id },
      { key: 'message', id: recipe.message_id },
      { key: 'style',   id: recipe.style_id },
      { key: 'format',  id: recipe.visual_format_id }
    ];
    for (var di = 0; di < dims.length; di++) {
      var dim = DIMENSIONS[dims[di].key];
      var entity = null;
      if (dims[di].key === 'persona') entity = S.personaMap[dims[di].id];
      else if (dims[di].key === 'message') entity = S.messageMap[dims[di].id];
      else if (dims[di].key === 'style') entity = S.styleMap[dims[di].id];
      else if (dims[di].key === 'format') entity = S.formatMap[dims[di].id];
      var entityName = entity ? (entity.name || entity.title || '') : '(Not set)';
      var entitySub = '';
      if (dims[di].key === 'persona' && entity) {
        var d = entity.demographics || {};
        entitySub = [d.age_range, d.location].filter(Boolean).join(' · ');
      } else if (dims[di].key === 'message' && entity) {
        var fs = (entity.funnel_stages || []).map(function(fid) { var f = S.funnelStageMap[fid]; return f ? f.short : ''; }).filter(Boolean).join(', ');
        entitySub = fs || '';
      }

      html += '<div class="cp-composition-dim" style="border-color:' + dim.color + '25">';
      html += '<div class="cp-composition-dim-icon" style="background:' + dim.color + '12;color:' + dim.color + '">' + icon(dim.icon) + '</div>';
      html += '<div class="cp-composition-dim-body">';
      html += '<div class="cp-composition-dim-label" style="color:' + dim.color + '">' + esc(dim.label) + '</div>';
      html += '<div class="cp-composition-dim-name">' + esc(entityName) + '</div>';
      if (entitySub) html += '<div class="cp-composition-dim-sub">' + esc(entitySub) + '</div>';
      html += '</div>';
      html += '<button class="cp-btn-link cp-btn-sm" data-action="change-dimension" data-dim="' + dims[di].key + '">Change</button>';
      html += '</div>';
    }
    html += '</div></div>';
    return html;
  }

  function getFilteredRecipes() {
    var f = S.recipeFilter;
    var recipes = (S.data.recipes || []).slice();

    if (f.search) {
      var q = f.search.toLowerCase();
      recipes = recipes.filter(function(r) {
        return (r.title || '').toLowerCase().indexOf(q) > -1;
      });
    }
    if (f.statuses && f.statuses.length > 0) recipes = recipes.filter(function(r) { return f.statuses.indexOf(r.status) > -1; });
    if (f.campaign) recipes = recipes.filter(function(r) { return r.campaign_id === f.campaign; });
    if (f.persona) recipes = recipes.filter(function(r) { return r.persona_id === f.persona; });
    if (f.priority) recipes = recipes.filter(function(r) { return r.priority === f.priority; });
    if (f.type) recipes = recipes.filter(function(r) { return r.media_type === f.type; });
    if (f.tag) recipes = recipes.filter(function(r) { return (r.tags || []).indexOf(f.tag) > -1; });
    if (f.production === 'has') recipes = recipes.filter(function(r) { return !!getRecipeProduction(r); });
    else if (f.production === 'missing') recipes = recipes.filter(function(r) { return !getRecipeProduction(r); });

    // Sort
    var dir = f.sortDir === 'asc' ? 1 : -1;
    if (f.sortBy === 'title') recipes.sort(function(a, b) { return dir * (a.title || '').localeCompare(b.title || ''); });
    else if (f.sortBy === 'priority') {
      var priOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      recipes.sort(function(a, b) { return dir * ((priOrder[a.priority] || 2) - (priOrder[b.priority] || 2)); });
    }
    else if (f.sortBy === 'created') recipes.sort(function(a, b) { return dir * ((a.created || '') > (b.created || '') ? 1 : -1); });
    else recipes.sort(function(a, b) { return dir * ((a.updated || a.created || '') > (b.updated || b.created || '') ? 1 : -1); });

    return recipes;
  }


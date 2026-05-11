  // ============================================================
  // SECTION 13.5: DEDICATED PAIN POINTS VIEW
  // ============================================================

  function renderPainPointsPageView() {
    var pps = getAllPainPoints();
    var ppFilter = S.painPointFilter || {};

    // Apply filters
    var filtered = pps.slice();
    if (ppFilter.search) {
      var q = ppFilter.search.toLowerCase();
      filtered = filtered.filter(function(pp) {
        return (pp.pain_point || '').toLowerCase().indexOf(q) > -1 || (pp.solution || '').toLowerCase().indexOf(q) > -1;
      });
    }
    if (ppFilter.category) filtered = filtered.filter(function(pp) { return pp.category === ppFilter.category; });

    var html = '<div class="cp-view cp-view-pain-points">';

    // Header
    html += '<div class="cp-view-header"><div class="cp-view-header-left">';
    html += '<h1>' + icon('bolt') + ' Pain Points</h1>';
    html += '<span class="cp-view-subtitle">' + filtered.length + ' of ' + pps.length + ' pain points</span>';
    html += '</div><div class="cp-view-header-right">';
    html += '<button class="cp-btn cp-btn-primary cp-btn-sm" data-action="new-pain-point">' + icon('plus') + ' Add Pain Point</button>';
    html += '</div></div>';

    // AI Research Panel
    html += '<div class="cp-ai-research-slot" id="cpPainPointResearchSlot">';
    html += renderAIResearchBar('Pain Point', '#d93025', 'bolt', 'pain_points');
    html += '</div>';

    // Toolbar
    html += '<div class="cp-view-toolbar">';
    html += '<div class="cp-search-wrapper">' + icon('search') + '<input type="text" class="cp-input" id="cpPainPointPageSearch" placeholder="Search pain points..." value="' + esc(ppFilter.search || '') + '"></div>';
    html += '<select class="cp-select cp-select-sm" id="cpPainPointCatFilter"><option value="">All Categories</option>';
    for (var ci = 0; ci < PAIN_POINT_CATEGORIES.length; ci++) {
      var cat = PAIN_POINT_CATEGORIES[ci];
      html += '<option value="' + esc(cat.id) + '"' + (ppFilter.category === cat.id ? ' selected' : '') + '>' + esc(cat.name) + '</option>';
    }
    html += '</select></div>';

    // Split pane: list + detail
    html += '<div class="cp-split-pane">';

    // Left: list
    html += '<div class="cp-list-pane">';
    if (filtered.length === 0) {
      html += '<div class="cp-empty-state cp-empty-state--compact"><p>No pain points' + (ppFilter.search || ppFilter.category ? ' match your filters' : ' yet') + '.</p>';
      html += '<button class="cp-btn cp-btn-primary cp-btn-sm" data-action="new-pain-point">' + icon('plus') + ' Create First Pain Point</button></div>';
    } else {
      for (var i = 0; i < filtered.length; i++) {
        var pp = filtered[i];
        var usedByCount = (S.data.personas || []).filter(function(p) { return (p.pain_point_ids || []).indexOf(pp.id) > -1; }).length;
        var recipeCount = (S.data.recipes || []).filter(function(r) { return (r.selected_pain_point_ids || []).indexOf(pp.id) > -1; }).length;
        var catLabel = '';
        if (pp.category) { var ppcMatch = PAIN_POINT_CATEGORIES.find(function(c) { return c.id === pp.category; }); catLabel = ppcMatch ? ppcMatch.name : ''; }
        var sel = S.selectedPainPointId === pp.id ? ' cp-list-item-selected' : '';

        html += '<div class="cp-list-item' + sel + '" data-action="select-pain-point-page" data-id="' + esc(pp.id) + '">';
        html += '<div class="cp-list-item-title">' + esc(truncate(pp.pain_point, 55)) + '</div>';
        html += '<div class="cp-list-item-meta">';
        if (catLabel) html += '<span class="cp-badge" style="background:#5f636815;color:#5f6368">' + esc(catLabel) + '</span>';
        html += '<span class="cp-text-muted">' + usedByCount + ' persona' + (usedByCount !== 1 ? 's' : '') + ' · ' + recipeCount + ' recipe' + (recipeCount !== 1 ? 's' : '') + '</span>';
        html += '</div></div>';
      }
    }
    html += '</div>';

    // Right: detail
    html += '<div class="cp-preview-pane">';
    html += renderPainPointDetailPane();
    html += '</div></div>';

    html += '</div>';
    return html;
  }

  function renderPainPointDetailPane() {
    if (!S.selectedPainPointId || !S.painPointMap[S.selectedPainPointId]) {
      return '<div class="cp-empty-state cp-empty-state--center">' +
        '<div class="cp-empty-state-icon">' + icon('bolt') + '</div>' +
        '<div class="cp-empty-state-title">Select a pain point</div>' +
        '<div class="cp-empty-state-text">Choose from the list, or create a new one.</div>' +
        '<button class="cp-btn cp-btn-primary" data-action="new-pain-point">' + icon('plus') + ' New Pain Point</button></div>';
    }
    var pp = S.painPointMap[S.selectedPainPointId];
    var ppCats = PAIN_POINT_CATEGORIES || [];
    var catLabel = '';
    if (pp.category) { var ppcMatch = ppCats.find(function(c) { return c.id === pp.category; }); catLabel = ppcMatch ? ppcMatch.name : ''; }

    // Find linked personas and recipes
    var linkedPersonas = (S.data.personas || []).filter(function(p) { return (p.pain_point_ids || []).indexOf(pp.id) > -1; });
    var unlinkedPersonas = (S.data.personas || []).filter(function(p) { return (p.pain_point_ids || []).indexOf(pp.id) === -1; });
    var linkedRecipes = (S.data.recipes || []).filter(function(r) { return (r.selected_pain_point_ids || []).indexOf(pp.id) > -1; });

    var html = '<div class="cp-detail-header"><div class="cp-detail-header-left">';
    html += '<h2>' + icon('bolt') + ' Pain Point</h2>';
    if (catLabel) html += '<span class="cp-badge" style="background:#d9302515;color:#d93025">' + esc(catLabel) + '</span>';
    html += '</div><div class="cp-detail-header-right">';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="delete-pain-point" data-id="' + esc(pp.id) + '">' + icon('trash') + ' Delete</button>';
    html += '</div></div>';

    // Inline editable pain point + solution
    html += '<div class="cp-card" style="margin-bottom:var(--cp-space-4)">';
    html += '<div class="cp-section-header"><h3>' + icon('triangle-exclamation') + ' Pain Point</h3></div>';
    html += '<textarea class="cp-textarea cp-pp-inline-field" data-ppfield="pain_point" rows="3">' + esc(pp.pain_point || '') + '</textarea>';
    html += '</div>';

    html += '<div class="cp-card" style="margin-bottom:var(--cp-space-4);border-left:3px solid var(--cp-success)">';
    html += '<div class="cp-section-header"><h3 style="color:var(--cp-success)">' + icon('lightbulb') + ' Solution</h3></div>';
    html += '<textarea class="cp-textarea cp-pp-inline-field" data-ppfield="solution" rows="3" placeholder="How does your product solve this?">' + esc(pp.solution || '') + '</textarea>';
    html += '</div>';

    // Category inline selector
    html += '<div class="cp-card" style="margin-bottom:var(--cp-space-4)">';
    html += '<div class="cp-form-group"><label class="cp-field-label">Category</label>';
    html += '<select class="cp-select cp-pp-inline-field" data-ppfield="category">';
    html += '<option value="">None</option>';
    for (var ci = 0; ci < ppCats.length; ci++) {
      html += '<option value="' + esc(ppCats[ci].id) + '"' + (pp.category === ppCats[ci].id ? ' selected' : '') + '>' + esc(ppCats[ci].name) + '</option>';
    }
    html += '</select></div></div>';

    // Linked Personas with link/unlink actions
    html += '<div class="cp-card" style="margin-bottom:var(--cp-space-4)">';
    html += '<div class="cp-section-header"><h3>' + icon('users') + ' Linked Personas (' + linkedPersonas.length + ')</h3>';
    if (unlinkedPersonas.length > 0) html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="link-pp-to-personas" data-pp-id="' + esc(pp.id) + '">' + icon('link') + ' Link to Personas</button>';
    html += '</div>';
    if (linkedPersonas.length === 0) {
      html += '<p class="cp-text-muted">Not linked to any personas yet.' + (unlinkedPersonas.length > 0 ? ' Click "Link to Personas" above.' : '') + '</p>';
    } else {
      for (var pi = 0; pi < linkedPersonas.length; pi++) {
        html += '<div class="cp-list-item-inline">';
        html += '<span style="flex:1;cursor:pointer" data-action="go-view" data-view="personas" data-select="' + esc(linkedPersonas[pi].id) + '">' + dimensionBadge('persona', linkedPersonas[pi].id) + '</span>';
        html += '<button class="cp-btn-icon cp-btn-xs" data-action="unlink-pp-from-persona" data-pp-id="' + esc(pp.id) + '" data-persona-id="' + esc(linkedPersonas[pi].id) + '" title="Unlink">' + icon('link-slash') + '</button>';
        html += '</div>';
      }
    }
    html += '</div>';

    // Linked Recipes
    html += '<div class="cp-card">';
    html += '<div class="cp-section-header"><h3>' + icon('shuffle') + ' Used in Recipes (' + linkedRecipes.length + ')</h3></div>';
    if (linkedRecipes.length === 0) {
      html += '<p class="cp-text-muted">Not used in any recipes yet.</p>';
    } else {
      for (var ri = 0; ri < linkedRecipes.length; ri++) {
        var r = linkedRecipes[ri];
        html += '<div class="cp-list-item-inline" style="cursor:pointer" data-action="go-view" data-view="recipes" data-select="' + esc(r.id) + '">';
        html += recipeStatusBadge(r.status) + ' ' + esc(truncate(r.title, 50));
        html += '</div>';
      }
    }
    html += '</div>';

    html += '<div class="cp-detail-footer"><span class="cp-text-muted">Created ' + formatDate(pp.created) + (pp.updated ? ' · Updated ' + formatRelativeTime(pp.updated) : '') + '</span></div>';
    return html;
  }


  // ============================================================
  // SECTION 11: PERSONAS VIEW
  // ============================================================

  function renderPersonasView() {
    var isPP = S.personasTab === 'pain_points';
    var html = '<div class="cp-view cp-view-personas' + (isPP ? ' cp-view-personas--pp' : '') + '">';

    // View header
    html += '<div class="cp-view-header"><div class="cp-view-header-left">';
    if (isPP) {
      var pps = getAllPainPoints();
      html += '<h1>' + icon('bolt') + ' Pain Points</h1>';
      html += '<span class="cp-view-subtitle">' + pps.length + ' shared pain point' + (pps.length !== 1 ? 's' : '') + ', linked to personas</span>';
    } else {
      html += '<h1>' + icon('users') + ' Personas</h1>';
      html += '<span class="cp-view-subtitle">' + S.totalPersonas + ' personas in ' + (S.data.persona_categories || []).length + ' categories</span>';
    }
    html += '</div><div class="cp-view-header-right">';
    // Tab toggle — Personas / Pain Points
    html += '<div class="cp-tab-toggle">';
    html += '<button class="cp-tab-btn' + (!isPP ? ' cp-tab-btn-active' : '') + '" data-action="set-personas-tab" data-tab="personas">' + icon('users') + ' Personas</button>';
    html += '<button class="cp-tab-btn' + (isPP ? ' cp-tab-btn-active' : '') + '" data-action="set-personas-tab" data-tab="pain_points">' + icon('bolt') + ' Pain Points</button>';
    html += '</div>';
    if (isPP) {
      html += '<button class="cp-btn cp-btn-primary cp-btn-sm" data-action="new-pain-point">' + icon('plus') + ' Add Pain Point</button>';
    } else {
      html += '<button class="cp-btn cp-btn-primary cp-btn-sm" data-action="new-persona">' + icon('plus') + ' Add Persona</button>';
      html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="new-category">' + icon('folder-plus') + ' Category</button>';
    }
    html += '</div></div>';

    // AI Research Panel — switches stateKey based on tab so each tab has
    // its own research workflow.
    html += '<div class="cp-ai-research-slot" id="cpPersonaResearchSlot">';
    if (isPP) {
      html += renderAIResearchBar('Pain Point', '#d93025', 'bolt', 'pain_points');
    } else {
      html += renderAIResearchBar('Persona', '#9334e9', 'users', 'personas');
    }
    html += '</div>';

    if (isPP) {
      // Pain Points tab — full toolbar + grouped list + dedicated detail pane.
      var ppFilter = S.painPointFilter || {};
      html += '<div class="cp-view-toolbar cp-pp-toolbar">';
      html += '<div class="cp-search-wrapper">' + icon('search') + '<input type="text" class="cp-input" id="cpPainPointPageSearch" placeholder="Search pain points & solutions…" value="' + esc(ppFilter.search || '') + '"></div>';
      html += '<select class="cp-select cp-select-sm" id="cpPainPointCatFilter"><option value="">All Categories</option>';
      for (var ci = 0; ci < PAIN_POINT_CATEGORIES.length; ci++) {
        var pcat = PAIN_POINT_CATEGORIES[ci];
        html += '<option value="' + esc(pcat.id) + '"' + (ppFilter.category === pcat.id ? ' selected' : '') + '>' + esc(pcat.name) + '</option>';
      }
      html += '</select>';
      var groupBy = ppFilter.groupBy || 'category';
      html += '<select class="cp-select cp-select-sm" id="cpPainPointGroupBy">';
      html += '<option value="category"' + (groupBy === 'category' ? ' selected' : '') + '>Group: Category</option>';
      html += '<option value="flat"' + (groupBy === 'flat' ? ' selected' : '') + '>Group: None</option>';
      html += '</select>';
      html += '</div>';
    }

    // Split pane
    html += '<div class="cp-split-pane">';
    if (isPP) {
      html += renderPainPointsPaneLeft();
      html += '<div class="cp-preview-pane">';
      html += renderPainPointDetailPane();
      html += '</div>';
    } else {
      html += renderPersonasLeftPane();
      html += '<div class="cp-preview-pane" id="cpPersonaPreview">';
      html += renderPersonaDetailPane();
      html += '</div>';
    }
    html += '</div>';

    html += '</div>';
    return html;
  }

  function renderAIResearchBar(entityType, color, iconName, stateKey) {
    var isOpen = S.aiResearchOpen[stateKey] || false;
    if (isOpen) {
      // Expanded state — use renderer registry if Part 2B registered the panel
      var R = window._cpRenderers || {};
      var html = '<div class="cp-ai-research-panel cp-ai-research-expanded" style="border-color:' + color + '30;background:' + color + '04">' +
        '<div class="cp-ai-research-header">' +
        '<span class="cp-ai-research-icon" style="color:' + color + '">' + icon('sparkles') + '</span>' +
        '<span class="cp-ai-research-title" style="color:' + color + '">AI Research ' + esc(entityType) + 's</span>' +
        '<span class="cp-badge" style="background:' + color + '15;color:' + color + '">Brand context injected</span>' +
        '<div style="flex:1"></div>' +
        '<button class="cp-btn-icon" data-action="toggle-ai-research" data-key="' + stateKey + '">' + icon('chevron-up') + '</button>' +
        '</div>';
      if (R.aiResearchPanel) {
        html += R.aiResearchPanel(entityType, stateKey, color);
      } else {
        html += '<div class="cp-ai-research-body"><p class="cp-text-muted">AI Research panel loading...</p></div>';
      }
      html += '</div>';
      return html;
    }
    return '<div class="cp-ai-research-bar" data-action="toggle-ai-research" data-key="' + stateKey + '" style="border-color:' + color + '25;background:' + color + '06">' +
      '<span class="cp-ai-research-icon" style="color:' + color + '">' + icon('sparkles') + '</span>' +
      '<span class="cp-ai-research-title" style="color:' + color + '">AI Research ' + esc(entityType) + 's</span>' +
      '<span class="cp-text-muted">— Bulk discover & generate using brand context</span>' +
      '<span class="cp-ai-research-arrow">' + icon('chevron-down') + '</span>' +
      '</div>';
  }

  function renderPersonasLeftPane() {
    var categories = getAllCategories();
    var uncategorized = (S.data.personas || []).filter(function(p) { return !p.category_id || !S.categoryMap[p.category_id]; });
    var f = S.personaFilter;

    var html = '<div class="cp-list-pane">';
    // Search
    html += '<div class="cp-list-toolbar"><div class="cp-list-toolbar-row">';
    html += '<div class="cp-search-wrapper">' + icon('search') + '<input type="text" class="cp-input" id="cpPersonaSearch" placeholder="Search personas..." value="' + esc(f.search) + '"></div>';
    html += '</div></div>';

    html += '<div class="cp-persona-tree" id="cpPersonaTree">';

    if (categories.length === 0 && uncategorized.length === 0) {
      html += '<div class="cp-empty-state cp-empty-state--compact"><p>No personas yet.</p>';
      html += '<button class="cp-btn cp-btn-primary cp-btn-sm" data-action="new-persona">' + icon('plus') + ' Create First Persona</button></div>';
    } else {
      // Render each category group
      for (var ci = 0; ci < categories.length; ci++) {
        var cat = categories[ci];
        var catPersonas = getPersonasByCategory(cat.id);
        if (f.search) {
          catPersonas = catPersonas.filter(function(p) {
            return p.name.toLowerCase().indexOf(f.search.toLowerCase()) > -1 ||
                   (p.description || '').toLowerCase().indexOf(f.search.toLowerCase()) > -1;
          });
        }
        var collapsed = S.collapsedGroups['pcat_' + cat.id] || false;

        html += '<div class="cp-persona-category">';
        html += '<div class="cp-persona-cat-header" data-action="toggle-group" data-group="pcat_' + esc(cat.id) + '">';
        html += '<span class="cp-persona-cat-chevron">' + icon(collapsed ? 'chevron-right' : 'chevron-down') + '</span>';
        html += '<span class="cp-persona-cat-name">' + esc(cat.name) + '</span>';
        html += '<span class="cp-nav-badge">' + catPersonas.length + '</span>';
        html += '<button class="cp-btn-icon cp-btn-xs" data-action="edit-category" data-id="' + esc(cat.id) + '" title="Edit">' + icon('edit') + '</button>';
        html += '</div>';

        if (!collapsed) {
          for (var pi = 0; pi < catPersonas.length; pi++) {
            html += renderPersonaListItem(catPersonas[pi]);
          }
        }
        html += '</div>';
      }

      // Uncategorized personas
      if (uncategorized.length > 0) {
        if (f.search) {
          uncategorized = uncategorized.filter(function(p) {
            return p.name.toLowerCase().indexOf(f.search.toLowerCase()) > -1;
          });
        }
        if (uncategorized.length > 0) {
          html += '<div class="cp-persona-category">';
          html += '<div class="cp-persona-cat-header cp-persona-cat-uncat">';
          html += '<span class="cp-persona-cat-chevron">' + icon('chevron-down') + '</span>';
          html += '<span class="cp-persona-cat-name">Uncategorized</span>';
          html += '<span class="cp-nav-badge">' + uncategorized.length + '</span>';
          html += '</div>';
          for (var ui = 0; ui < uncategorized.length; ui++) {
            html += renderPersonaListItem(uncategorized[ui]);
          }
          html += '</div>';
        }
      }
    }

    html += '</div></div>';
    return html;
  }

  function renderPersonaListItem(persona) {
    var sel = S.selectedPersonaId === persona.id ? ' cp-persona-item-selected' : '';
    var ppCount = (persona.pain_point_ids || []).length + (persona.custom_pain_points || []).length;
    var demo = persona.demographics || {};
    var demoStr = [demo.age_range, demo.gender !== 'all' ? demo.gender : '', demo.location].filter(Boolean).join(' · ');
    var recipeCount = S.personaRecipeCounts[persona.id] || 0;

    var html = '<div class="cp-persona-item' + sel + '" data-action="select-persona" data-id="' + esc(persona.id) + '">';
    html += '<div class="cp-persona-item-name">' + esc(persona.name || 'Unnamed Persona') + '</div>';
    if (demoStr) html += '<div class="cp-persona-item-demo">' + esc(demoStr) + '</div>';
    html += '<div class="cp-persona-item-badges">';
    if (ppCount > 0) html += '<span class="cp-badge" style="background:#d9302515;color:#d93025">' + icon('bolt') + ' ' + ppCount + '</span>';
    if (recipeCount > 0) html += '<span class="cp-badge" style="background:#e3740015;color:#e37400">' + icon('bolt') + ' ' + recipeCount + ' recipes</span>';
    html += '</div>';
    html += '</div>';
    return html;
  }

  // Pain Points pane (used inside the Personas view's Pain Points tab).
  // Mirrors the rich behaviour of the former standalone Pain Points page:
  // search + category filter + group-by toggle, list grouped by category
  // (collapsible) or flat, with persona count badges and inline solution
  // previews.
  function renderPainPointsPaneLeft() {
    var pps = getAllPainPoints();
    var ppFilter = S.painPointFilter || {};
    var filtered = pps.slice();
    if (ppFilter.search) {
      var q = ppFilter.search.toLowerCase();
      filtered = filtered.filter(function(pp) {
        return (pp.pain_point || '').toLowerCase().indexOf(q) > -1 || (pp.solution || '').toLowerCase().indexOf(q) > -1;
      });
    }
    if (ppFilter.category) filtered = filtered.filter(function(pp) { return pp.category === ppFilter.category; });
    var groupBy = ppFilter.groupBy || 'category';

    var html = '<div class="cp-list-pane cp-pp-list-pane">';
    if (filtered.length === 0) {
      html += '<div class="cp-empty-state cp-empty-state--compact"><p>No pain points' + (ppFilter.search || ppFilter.category ? ' match your filters' : ' yet') + '.</p>';
      html += '<button class="cp-btn cp-btn-primary cp-btn-sm" data-action="new-pain-point">' + icon('plus') + ' Create First Pain Point</button></div>';
    } else if (groupBy === 'category') {
      html += renderPainPointListGroupedByCategory(filtered);
    } else {
      html += '<div class="cp-pp-list">';
      for (var i = 0; i < filtered.length; i++) html += renderPainPointListItem(filtered[i]);
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  function renderPainPointListGroupedByCategory(filtered) {
    var grouped = {};
    var uncatId = '__uncat__';
    for (var i = 0; i < filtered.length; i++) {
      var key = filtered[i].category || uncatId;
      (grouped[key] = grouped[key] || []).push(filtered[i]);
    }
    var order = (PAIN_POINT_CATEGORIES || []).map(function(c) { return c.id; });
    order.push(uncatId);

    var html = '';
    for (var oi = 0; oi < order.length; oi++) {
      var catId = order[oi];
      var items = grouped[catId];
      if (!items || items.length === 0) continue;
      var cat = (PAIN_POINT_CATEGORIES || []).find(function(c) { return c.id === catId; });
      var label = cat ? cat.name : 'Uncategorized';
      var collapsed = !!(S.collapsedGroups && S.collapsedGroups['ppcat_' + catId]);

      html += '<div class="cp-pp-group">';
      html += '<div class="cp-pp-group-header" data-action="toggle-pp-group" data-cat-id="' + esc(catId) + '">';
      html += icon(collapsed ? 'chevron-right' : 'chevron-down');
      html += '<span class="cp-pp-group-name">' + esc(label) + '</span>';
      html += '<span class="cp-pp-group-count">' + items.length + '</span>';
      html += '</div>';
      if (!collapsed) {
        html += '<div class="cp-pp-list">';
        for (var k = 0; k < items.length; k++) html += renderPainPointListItem(items[k]);
        html += '</div>';
      }
      html += '</div>';
    }
    return html;
  }

  function renderPainPointListItem(pp) {
    var personaCount = (S.data.personas || []).filter(function(p) { return (p.pain_point_ids || []).indexOf(pp.id) > -1; }).length;
    var sel = S.selectedPainPointId === pp.id ? ' cp-pp-item-selected' : '';
    var hasSolution = !!(pp.solution && pp.solution.trim());

    var html = '<div class="cp-pp-item' + sel + '" data-action="select-pain-point-page" data-id="' + esc(pp.id) + '">';
    html += '<div class="cp-pp-item-main">';
    html += '<div class="cp-pp-item-title">' + esc(truncate(pp.pain_point || '(Empty)', 90)) + '</div>';
    if (hasSolution) {
      html += '<div class="cp-pp-item-solution" title="Solution"><span class="cp-pp-item-solution-icon">' + icon('lightbulb') + '</span>' + esc(truncate(pp.solution, 90)) + '</div>';
    }
    html += '</div>';
    html += '<div class="cp-pp-item-meta">';
    if (personaCount > 0) html += '<span class="cp-pp-mini-stat" title="Linked personas">' + icon('users') + ' ' + personaCount + '</span>';
    if (!hasSolution) html += '<span class="cp-pp-mini-stat cp-pp-mini-warn" title="No solution defined">' + icon('triangle-exclamation') + '</span>';
    html += '</div>';
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

    var linkedPersonas = (S.data.personas || []).filter(function(p) { return (p.pain_point_ids || []).indexOf(pp.id) > -1; });
    var unlinkedPersonas = (S.data.personas || []).filter(function(p) { return (p.pain_point_ids || []).indexOf(pp.id) === -1; });

    var html = '<div class="cp-detail-header"><div class="cp-detail-header-left">';
    html += '<h2>' + icon('bolt') + ' Pain Point</h2>';
    if (catLabel) html += '<span class="cp-badge" style="background:#d9302515;color:#d93025">' + esc(catLabel) + '</span>';
    html += '</div><div class="cp-detail-header-right">';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="delete-pain-point" data-id="' + esc(pp.id) + '">' + icon('trash') + ' Delete</button>';
    html += '</div></div>';

    html += '<div class="cp-card cp-pp-detail-card">';
    html += '<div class="cp-section-header"><h3>' + icon('triangle-exclamation') + ' Pain Point</h3></div>';
    html += '<textarea class="cp-textarea cp-pp-inline-field" data-ppfield="pain_point" rows="3">' + esc(pp.pain_point || '') + '</textarea>';
    html += '</div>';

    html += '<div class="cp-card cp-pp-detail-card cp-pp-detail-solution">';
    html += '<div class="cp-section-header"><h3 style="color:var(--cp-success)">' + icon('lightbulb') + ' Solution</h3></div>';
    html += '<textarea class="cp-textarea cp-pp-inline-field" data-ppfield="solution" rows="3" placeholder="How does your product solve this?">' + esc(pp.solution || '') + '</textarea>';
    html += '</div>';

    html += '<div class="cp-card cp-pp-detail-card">';
    html += '<div class="cp-form-group"><label class="cp-field-label">Category</label>';
    html += '<select class="cp-select cp-pp-inline-field" data-ppfield="category">';
    html += '<option value="">None</option>';
    for (var ci = 0; ci < ppCats.length; ci++) {
      html += '<option value="' + esc(ppCats[ci].id) + '"' + (pp.category === ppCats[ci].id ? ' selected' : '') + '>' + esc(ppCats[ci].name) + '</option>';
    }
    html += '</select></div></div>';

    // Linked Personas
    html += '<div class="cp-card cp-pp-detail-card">';
    html += '<div class="cp-section-header"><h3>' + icon('users') + ' Linked Personas (' + linkedPersonas.length + ')</h3>';
    if (unlinkedPersonas.length > 0) html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="link-pp-to-personas" data-pp-id="' + esc(pp.id) + '">' + icon('link') + ' Link to Personas</button>';
    html += '</div>';
    if (linkedPersonas.length === 0) {
      html += '<p class="cp-text-muted">Not linked to any personas yet.' + (unlinkedPersonas.length > 0 ? ' Click "Link to Personas" above.' : '') + '</p>';
    } else {
      for (var pi = 0; pi < linkedPersonas.length; pi++) {
        html += '<div class="cp-list-item-inline">';
        html += '<span style="flex:1;cursor:pointer" data-action="select-persona-from-pp" data-persona-id="' + esc(linkedPersonas[pi].id) + '">' + dimensionBadge('persona', linkedPersonas[pi].id) + '</span>';
        html += '<button class="cp-btn-icon cp-btn-xs" data-action="unlink-pp-from-persona" data-pp-id="' + esc(pp.id) + '" data-persona-id="' + esc(linkedPersonas[pi].id) + '" title="Unlink">' + icon('link-slash') + '</button>';
        html += '</div>';
      }
    }
    html += '</div>';

    // Workspace usage (meta_v2)
    if (typeof renderLibraryWorkspaceUsage === 'function') {
      html += renderLibraryWorkspaceUsage('pain_point', pp.id);
    }

    html += '<div class="cp-detail-footer"><span class="cp-text-muted">Created ' + formatDate(pp.created) + (pp.updated ? ' · Updated ' + formatRelativeTime(pp.updated) : '') + '</span></div>';
    return html;
  }

  function renderPersonaDetailPane() {
    if (!S.selectedPersonaId || !S.personaMap[S.selectedPersonaId]) {
      return '<div class="cp-empty-state cp-empty-state--center">' +
        '<div class="cp-empty-state-icon">' + icon('user') + '</div>' +
        '<div class="cp-empty-state-title">Select a persona</div>' +
        '<div class="cp-empty-state-text">Choose a persona from the list, or create a new one.</div>' +
        '<button class="cp-btn cp-btn-primary" data-action="new-persona">' + icon('plus') + ' New Persona</button></div>';
    }

    var p = S.personaMap[S.selectedPersonaId];
    var cat = S.categoryMap[p.category_id];
    var demo = p.demographics || {};
    var psych = p.psychographics || {};
    var painPoints = getPersonaPainPoints(p);
    var recipeCount = S.personaRecipeCounts[p.id] || 0;

    var html = '<div class="cp-persona-detail">';

    // Header
    html += '<div class="cp-persona-detail-header">';
    html += '<div class="cp-persona-detail-icon">' + icon('user') + '</div>';
    html += '<div class="cp-persona-detail-info">';
    html += '<h2>' + esc(p.name || 'Unnamed Persona') + '</h2>';
    html += '<div class="cp-text-muted">';
    if (cat) html += 'Category: ' + esc(cat.name) + ' · ';
    html += 'Used in ' + recipeCount + ' recipe' + (recipeCount !== 1 ? 's' : '');
    html += ' · Created ' + formatDate(p.created);
    html += '</div></div>';
    html += '<div class="cp-persona-detail-actions">';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="edit-persona" data-id="' + esc(p.id) + '">' + icon('edit') + ' Edit</button>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm cp-btn-danger" data-action="delete-persona" data-id="' + esc(p.id) + '">' + icon('trash') + '</button>';
    html += '</div></div>';

    // Description
    if (p.description) {
      html += '<p class="cp-persona-desc">' + esc(p.description) + '</p>';
    }

    // Demographics
    html += '<div class="cp-card cp-persona-section cp-persona-demographics">';
    html += '<div class="cp-section-header"><h3>' + icon('user') + ' Demographics</h3></div>';
    html += '<div class="cp-detail-grid">';
    var demoFields = [
      ['Age Range', demo.age_range], ['Gender', demo.gender], ['Location', demo.location],
      ['Income Level', demo.income_level], ['Education', demo.education], ['Occupation', demo.occupation]
    ];
    for (var di = 0; di < demoFields.length; di++) {
      if (demoFields[di][1]) {
        html += '<div class="cp-detail-field"><div class="cp-detail-label">' + esc(demoFields[di][0]) + '</div>';
        html += '<div class="cp-detail-value">' + esc(demoFields[di][1]) + '</div></div>';
      }
    }
    if (!demoFields.some(function(f) { return f[1]; })) {
      html += '<p class="cp-text-muted">No demographics defined yet.</p>';
    }
    html += '</div></div>';

    // Psychographics
    html += '<div class="cp-card cp-persona-section cp-persona-psychographics">';
    html += '<div class="cp-section-header"><h3>' + icon('heart') + ' Psychographics</h3></div>';
    html += '<div class="cp-detail-grid cp-detail-grid-2">';
    var psychFields = [
      ['Desires & Motivations', psych.desires], ['Requirements', psych.requirements],
      ['Emotional Triggers', psych.emotional_triggers], ['Motivations', psych.motivations],
      ['Fears', psych.fears], ['Values', psych.values]
    ];
    for (var psi = 0; psi < psychFields.length; psi++) {
      if (psychFields[psi][1]) {
        html += '<div class="cp-detail-field"><div class="cp-detail-label">' + esc(psychFields[psi][0]) + '</div>';
        html += '<div class="cp-detail-value">' + esc(psychFields[psi][1]) + '</div></div>';
      }
    }
    if (!psychFields.some(function(f) { return f[1]; })) {
      html += '<p class="cp-text-muted">No psychographics defined yet.</p>';
    }
    html += '</div></div>';

    // Pain Points
    html += '<div class="cp-card cp-persona-section">';
    html += '<div class="cp-section-header"><h3>' + icon('bolt') + ' Pain Points & Solutions</h3>';
    html += '<button class="cp-btn cp-btn-ai cp-btn-sm" data-action="ai-research-pain-points" data-persona-id="' + esc(p.id) + '">' + icon('sparkles') + ' AI Research</button>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="add-pain-point-to-persona" data-persona-id="' + esc(p.id) + '">' + icon('plus') + ' Add</button>';
    html += '</div>';

    if (painPoints.length === 0) {
      html += '<div class="cp-empty-state cp-empty-state--compact"><p>No pain points linked yet.</p></div>';
    } else {
      for (var ppi = 0; ppi < painPoints.length; ppi++) {
        var pp = painPoints[ppi];
        html += '<div class="cp-pain-point-card">';
        html += '<div class="cp-pain-point-card-header">';
        html += '<span class="cp-pain-point-icon">' + icon('bolt') + '</span>';
        html += '<span class="cp-pain-point-card-text">' + esc(pp.pain_point) + '</span>';
        html += pp.shared ?
          '<span class="cp-badge" style="background:#1a73e815;color:#1a73e8">Shared</span>' :
          '<span class="cp-badge" style="background:#e3740015;color:#e37400">Custom</span>';
        html += '</div>';
        if (pp.solution) {
          html += '<div class="cp-pain-point-solution">' + icon('lightbulb') + ' ' + esc(pp.solution) + '</div>';
        }
        html += '</div>';
      }
    }
    html += '</div>';

    // Tags
    if ((p.tags || []).length > 0) {
      html += '<div class="cp-persona-tags">';
      for (var ti = 0; ti < p.tags.length; ti++) {
        var tag = S.tagMap[p.tags[ti]];
        if (tag) html += '<span class="cp-badge" style="background:' + tag.color + '15;color:' + tag.color + '">' + icon('tag') + ' ' + esc(tag.name) + '</span>';
      }
      html += '</div>';
    }

    // Notes
    if (p.notes) {
      html += '<div class="cp-card cp-persona-section"><div class="cp-section-header"><h3>' + icon('file-text') + ' Notes</h3></div>';
      html += '<p>' + esc(p.notes) + '</p></div>';
    }

    // Workspace usage (only when meta_v2 is on)
    html += renderLibraryWorkspaceUsage('persona', p.id);

    html += '</div>';
    return html;
  }


  // ============================================================
  // SECTION 15: CAMPAIGNS VIEW
  // ============================================================

  function renderCampaignsView() {
    var camps = getAllCampaigns();
    var f = S.campaignFilter;

    // Apply filters
    var filtered = camps.slice();
    if (f.search) {
      var q = f.search.toLowerCase();
      filtered = filtered.filter(function(c) { return (c.name || '').toLowerCase().indexOf(q) > -1 || (c.description || '').toLowerCase().indexOf(q) > -1; });
    }
    if (f.status) filtered = filtered.filter(function(c) { return c.status === f.status; });
    filtered.sort(function(a, b) { return (b.updated || b.created || '') > (a.updated || a.created || '') ? 1 : -1; });

    var html = '<div class="cp-view cp-view-campaigns">';
    html += '<div class="cp-view-header"><div class="cp-view-header-left">';
    html += '<h1>' + icon('bullhorn') + ' Campaigns</h1>';
    html += '<span class="cp-view-subtitle">' + filtered.length + ' campaign' + (filtered.length !== 1 ? 's' : '') + '</span>';
    html += '</div><div class="cp-view-header-right">';
    html += '<button class="cp-btn cp-btn-ai" data-action="open-campaign-wizard">' + icon('wand-magic') + ' Campaign Wizard</button>';
    html += '<button class="cp-btn cp-btn-primary cp-btn-sm" data-action="new-campaign">' + icon('plus') + ' Quick Create</button>';
    html += '</div></div>';

    // Split pane
    html += '<div class="cp-split-pane">';

    // Left: campaign list
    html += '<div class="cp-list-pane">';
    html += '<div class="cp-list-toolbar"><div class="cp-list-toolbar-row">';
    html += '<div class="cp-search-wrapper">' + icon('search') + '<input type="text" class="cp-input" id="cpCampaignSearch" placeholder="Search..." value="' + esc(f.search) + '"></div>';
    html += '<select class="cp-select cp-select-sm" id="cpCampaignStatusFilter" style="width:auto;min-width:80px"><option value="">All</option>';
    for (var csk in CAMPAIGN_STATUSES) {
      html += '<option value="' + csk + '"' + (f.status === csk ? ' selected' : '') + '>' + CAMPAIGN_STATUSES[csk].label + '</option>';
    }
    html += '</select>';
    html += '</div></div>';

    if (filtered.length === 0) {
      html += '<div class="cp-empty-state cp-empty-state--compact"><p>No campaigns' + (f.search || f.status ? ' match' : ' yet') + '.</p>';
      html += '<button class="cp-btn cp-btn-primary cp-btn-sm" data-action="open-campaign-wizard">' + icon('wand-magic') + ' Create</button></div>';
    } else {
      for (var i = 0; i < filtered.length; i++) html += renderCampaignListItem(filtered[i]);
    }
    html += '</div>';

    // Right: campaign detail
    html += '<div class="cp-preview-pane">';
    html += renderCampaignDetailPane();
    html += '</div>';

    html += '</div></div>';
    return html;
  }

  function renderCampaignListItem(camp) {
    var cst = CAMPAIGN_STATUSES[camp.status] || { label: camp.status, color: '#80868b', icon: 'circle' };
    var recipes = getRecipesByCampaign(camp.id);
    var sel = S.selectedCampaignId === camp.id ? ' cp-list-item-selected' : '';

    var html = '<div class="cp-list-item' + sel + '" data-action="select-campaign" data-id="' + esc(camp.id) + '">';
    html += '<div class="cp-list-item-title">' + esc(camp.name || 'Untitled') + '</div>';
    html += '<div class="cp-list-item-meta">';
    html += '<span class="cp-badge" style="background:' + cst.color + '15;color:' + cst.color + '">' + esc(cst.label) + '</span>';
    html += '<span class="cp-text-muted">' + recipes.length + ' recipe' + (recipes.length !== 1 ? 's' : '') + '</span>';
    if (camp.date_start) html += '<span class="cp-text-muted">' + formatDateShort(camp.date_start) + '</span>';
    html += '</div></div>';
    return html;
  }

  function renderCampaignDetailPane() {
    if (!S.selectedCampaignId || !S.campaignMap[S.selectedCampaignId]) {
      return '<div class="cp-empty-state cp-empty-state--center">' +
        '<div class="cp-empty-state-icon">' + icon('bullhorn') + '</div>' +
        '<div class="cp-empty-state-title">Select a campaign</div>' +
        '<div class="cp-empty-state-text">Choose from the list, or create a new one with the Campaign Wizard.</div>' +
        '<button class="cp-btn cp-btn-ai" data-action="open-campaign-wizard">' + icon('wand-magic') + ' Campaign Wizard</button></div>';
    }

    var camp = S.campaignMap[S.selectedCampaignId];
    var cst = CAMPAIGN_STATUSES[camp.status] || { label: camp.status, color: '#80868b', icon: 'circle' };
    var objective = CAMPAIGN_OBJECTIVES.find(function(o) { return o.id === camp.objective; });
    var recipes = getRecipesByCampaign(camp.id);
    var tab = S.campaignDetailTab || 'overview';

    var html = '';

    // Header
    html += '<div class="cp-detail-header"><div class="cp-detail-header-left">';
    html += '<h2>' + esc(camp.name) + '</h2>';
    html += '<div style="display:flex;gap:var(--cp-space-2);flex-wrap:wrap;margin-top:4px">';
    html += '<span class="cp-badge" style="background:' + cst.color + '15;color:' + cst.color + '">' + icon(cst.icon) + ' ' + esc(cst.label) + '</span>';
    if (objective) html += '<span class="cp-badge" style="background:#5f636815;color:#5f6368">' + icon(objective.icon) + ' ' + esc(objective.name) + '</span>';
    if (camp.funnel_stage) { var fs = S.funnelStageMap[camp.funnel_stage]; if (fs) html += funnelBadge(camp.funnel_stage); }
    html += '<span class="cp-badge" style="background:var(--cp-gray-50);color:var(--cp-text-muted)">' + recipes.length + ' recipe' + (recipes.length !== 1 ? 's' : '') + '</span>';
    html += '</div>';
    html += '</div><div class="cp-detail-header-right">';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="edit-campaign" data-id="' + esc(camp.id) + '">' + icon('edit') + ' Edit</button>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="delete-campaign" data-id="' + esc(camp.id) + '">' + icon('trash') + '</button>';
    html += '</div></div>';

    // Tab navigation
    var tabs = [
      { key: 'overview', label: 'Overview', icon: 'chart-pie' },
      { key: 'recipes', label: 'Recipes (' + recipes.length + ')', icon: 'shuffle' },
      { key: 'research', label: 'Research', icon: 'flask' },
      { key: 'brief', label: 'Brief', icon: 'file-lines' }
    ];
    html += '<div class="cp-campaign-tabs">';
    for (var ti = 0; ti < tabs.length; ti++) {
      var t = tabs[ti];
      html += '<button class="cp-campaign-tab' + (tab === t.key ? ' cp-campaign-tab-active' : '') + '" data-action="set-campaign-tab" data-tab="' + t.key + '">' + icon(t.icon) + ' ' + esc(t.label) + '</button>';
    }
    html += '</div>';

    // Tab content
    html += '<div class="cp-campaign-tab-content">';
    switch(tab) {
      case 'overview': html += renderCampaignOverviewTab(camp, recipes); break;
      case 'recipes':  html += renderCampaignRecipesTab(camp, recipes); break;
      case 'research': html += renderCampaignResearchTab(camp); break;
      case 'brief':    html += renderCampaignBriefTab(camp); break;
    }
    html += '</div>';

    html += '<div class="cp-detail-footer"><span class="cp-text-muted">Created ' + formatDate(camp.created) + (camp.updated ? ' · Updated ' + formatRelativeTime(camp.updated) : '') + '</span></div>';
    return html;
  }

  // --- Campaign Overview Tab ---
  function renderCampaignOverviewTab(camp, recipes) {
    var html = '';

    // Progress stats row
    var statusCounts = {};
    recipes.forEach(function(r) { statusCounts[r.status] = (statusCounts[r.status] || 0) + 1; });
    var readyCount = (statusCounts.approved || 0) + (statusCounts.live || 0);
    var inProgressCount = (statusCounts.hook_ready || 0) + (statusCounts.content_ready || 0) + (statusCounts.media_ready || 0) + (statusCounts.in_review || 0);
    var draftCount = statusCounts.draft || 0;
    var progressPct = recipes.length > 0 ? Math.round((readyCount / recipes.length) * 100) : 0;

    html += '<div class="cp-campaign-stats">';
    html += '<div class="cp-campaign-stat"><div class="cp-campaign-stat-value" style="color:var(--cp-primary)">' + progressPct + '%</div><div class="cp-campaign-stat-label">Complete</div></div>';
    html += '<div class="cp-campaign-stat"><div class="cp-campaign-stat-value">' + recipes.length + '</div><div class="cp-campaign-stat-label">Total Recipes</div></div>';
    html += '<div class="cp-campaign-stat"><div class="cp-campaign-stat-value" style="color:#80868b">' + draftCount + '</div><div class="cp-campaign-stat-label">Draft</div></div>';
    html += '<div class="cp-campaign-stat"><div class="cp-campaign-stat-value" style="color:#e37400">' + inProgressCount + '</div><div class="cp-campaign-stat-label">In Progress</div></div>';
    html += '<div class="cp-campaign-stat"><div class="cp-campaign-stat-value" style="color:#0d904f">' + readyCount + '</div><div class="cp-campaign-stat-label">Ready / Live</div></div>';
    html += '</div>';

    // Status progress bar
    if (recipes.length > 0) {
      html += '<div class="cp-campaign-progress-bar">';
      for (var sk in RECIPE_STATUSES) {
        var cnt = statusCounts[sk] || 0;
        if (cnt > 0) {
          var w = (cnt / recipes.length) * 100;
          html += '<div class="cp-campaign-status-segment" style="width:' + w + '%;background:' + RECIPE_STATUSES[sk].color + '" title="' + esc(RECIPE_STATUSES[sk].label) + ': ' + cnt + '"></div>';
        }
      }
      html += '</div>';
    }

    // Description
    if (camp.description) {
      html += '<div class="cp-card" style="margin-bottom:var(--cp-space-4)">';
      html += '<p style="color:var(--cp-text-secondary);line-height:1.6;margin:0">' + esc(camp.description) + '</p>';
      html += '</div>';
    }

    // Info grid
    html += '<div class="cp-detail-grid cp-detail-grid-2" style="margin-bottom:var(--cp-space-4)">';
    if (camp.date_start || camp.date_end) {
      html += '<div class="cp-detail-field"><div class="cp-detail-label">Date Range</div>';
      html += '<div class="cp-detail-value">' + icon('calendar') + ' ' + (camp.date_start ? formatDateShort(camp.date_start) : '?') + ' → ' + (camp.date_end ? formatDateShort(camp.date_end) : '?') + '</div></div>';
    }
    if (camp.budget_notes) {
      html += '<div class="cp-detail-field"><div class="cp-detail-label">Budget</div><div class="cp-detail-value">' + esc(camp.budget_notes) + '</div></div>';
    }
    if (camp.ai_instructions) {
      html += '<div class="cp-detail-field" style="grid-column:1/-1"><div class="cp-detail-label">' + icon('sparkles') + ' AI Instructions</div><div class="cp-detail-value">' + esc(camp.ai_instructions) + '</div></div>';
    }
    html += '</div>';

    // Targeted dimensions
    var dimSections = [
      { key: 'persona_ids', label: 'Personas', icon: 'users', color: '#9334e9', map: S.personaMap },
      { key: 'message_ids', label: 'Messages', icon: 'comments', color: '#1a73e8', map: S.messageMap },
      { key: 'style_ids', label: 'Styles', icon: 'palette', color: '#e37400', map: S.styleMap },
      { key: 'format_ids', label: 'Formats', icon: 'clapperboard', color: '#0891b2', map: S.formatMap }
    ];
    var hasDimensions = dimSections.some(function(ds) { return (camp[ds.key] || []).length > 0; });
    if (hasDimensions) {
      html += '<div class="cp-card" style="margin-bottom:var(--cp-space-4)">';
      html += '<div class="cp-section-header"><h3>' + icon('shapes') + ' Targeted Dimensions</h3></div>';
      html += '<div class="cp-campaign-dim-grid">';
      for (var di = 0; di < dimSections.length; di++) {
        var ds = dimSections[di];
        var ids = camp[ds.key] || [];
        if (ids.length === 0) continue;
        html += '<div><div class="cp-field-label" style="color:' + ds.color + '">' + icon(ds.icon) + ' ' + esc(ds.label) + ' (' + ids.length + ')</div>';
        for (var dii = 0; dii < ids.length; dii++) {
          var ent = ds.map[ids[dii]];
          if (ent) html += '<div class="cp-badge" style="background:' + ds.color + '10;color:' + ds.color + ';margin:2px">' + esc(ent.name || ent.title || '') + '</div>';
        }
        html += '</div>';
      }
      html += '</div></div>';
    }

    // Coverage matrix: persona × message
    var personaIds = camp.persona_ids || [];
    var messageIds = camp.message_ids || [];
    if (personaIds.length > 0 && messageIds.length > 0) {
      html += '<div class="cp-card" style="margin-bottom:var(--cp-space-4)">';
      html += '<div class="cp-section-header"><h3>' + icon('grid') + ' Coverage Matrix</h3>';
      html += '<span class="cp-text-muted" style="font-size:var(--cp-font-size-xs)">Persona × Message recipe coverage</span>';
      html += '</div>';
      html += '<div class="cp-coverage-matrix" style="overflow-x:auto"><table class="cp-coverage-table"><thead><tr><th></th>';
      for (var mi = 0; mi < messageIds.length; mi++) {
        var msg = S.messageMap[messageIds[mi]];
        html += '<th style="color:#1a73e8;font-size:11px;max-width:80px;overflow:hidden;text-overflow:ellipsis">' + esc(msg ? truncate(msg.title, 12) : '?') + '</th>';
      }
      html += '</tr></thead><tbody>';
      for (var pi = 0; pi < personaIds.length; pi++) {
        var per = S.personaMap[personaIds[pi]];
        html += '<tr><td style="color:#9334e9;font-weight:600;font-size:11px;white-space:nowrap">' + esc(per ? truncate(per.name, 14) : '?') + '</td>';
        for (var mj = 0; mj < messageIds.length; mj++) {
          var hasRecipe = recipes.some(function(r) { return r.persona_id === personaIds[pi] && r.message_id === messageIds[mj]; });
          html += '<td style="text-align:center">';
          if (hasRecipe) html += '<span style="color:var(--cp-success)">' + icon('circle-check') + '</span>';
          else html += '<span style="color:var(--cp-border-default);cursor:pointer" data-action="quick-create-recipe" data-persona-id="' + esc(personaIds[pi]) + '" data-message-id="' + esc(messageIds[mj]) + '" data-campaign-id="' + esc(camp.id) + '" title="Create recipe">' + icon('plus-circle') + '</span>';
          html += '</td>';
        }
        html += '</tr>';
      }
      html += '</tbody></table></div></div>';
    }

    // Notes
    if (camp.notes) {
      html += '<div class="cp-card"><div class="cp-section-header"><h3>' + icon('note-sticky') + ' Notes</h3></div>';
      html += '<p style="margin:0">' + esc(camp.notes) + '</p></div>';
    }
    return html;
  }

  // --- Campaign Recipes Tab ---
  function renderCampaignRecipesTab(camp, recipes) {
    var html = '';

    // Actions bar
    html += '<div style="display:flex;gap:var(--cp-space-2);margin-bottom:var(--cp-space-4);flex-wrap:wrap">';
    html += '<button class="cp-btn cp-btn-ai cp-btn-sm" data-action="ai-campaign-recipes" data-campaign-id="' + esc(camp.id) + '">' + icon('sparkles') + ' AI Suggest Recipes</button>';
    html += '<button class="cp-btn cp-btn-primary cp-btn-sm" data-action="add-recipe-to-campaign" data-campaign-id="' + esc(camp.id) + '">' + icon('plus') + ' Add Recipe</button>';
    html += '</div>';

    if (recipes.length === 0) {
      html += '<div class="cp-empty-state cp-empty-state--compact"><p>No recipes in this campaign yet.</p>';
      html += '<p class="cp-text-muted">Use AI to suggest recipe combinations based on your targeted dimensions, or create recipes manually.</p></div>';
      return html;
    }

    // Group by status
    var byStatus = {};
    recipes.forEach(function(r) { byStatus[r.status] = byStatus[r.status] || []; byStatus[r.status].push(r); });
    for (var sk in RECIPE_STATUSES) {
      var group = byStatus[sk];
      if (!group || group.length === 0) continue;
      html += '<div class="cp-campaign-recipe-group">';
      html += '<div class="cp-campaign-recipe-group-header" style="color:' + RECIPE_STATUSES[sk].color + '">' + icon(RECIPE_STATUSES[sk].icon) + ' ' + esc(RECIPE_STATUSES[sk].label) + ' (' + group.length + ')</div>';
      for (var ri = 0; ri < group.length; ri++) {
        var r = group[ri];
        var persona = S.personaMap[r.persona_id];
        var msg = S.messageMap[r.message_id];
        html += '<div class="cp-campaign-recipe-item" data-action="select-recipe" data-id="' + esc(r.id) + '">';
        html += '<span style="flex:1;font-weight:500">' + esc(truncate(r.title, 40)) + '</span>';
        if (persona) html += '<span class="cp-badge" style="background:#9334e910;color:#9334e9;font-size:10px">' + esc(truncate(persona.name, 10)) + '</span>';
        html += mediaTypeBadge(r.media_type);
        if (r.priority && r.priority !== 'medium') html += priorityBadge(r.priority);
        if (r.due_date) html += '<span class="cp-text-muted" style="font-size:11px">' + formatDateShort(r.due_date) + '</span>';
        html += '</div>';
      }
      html += '</div>';
    }

    // Progress bar
    var statusCounts = {};
    recipes.forEach(function(r) { statusCounts[r.status] = (statusCounts[r.status] || 0) + 1; });
    html += '<div class="cp-campaign-progress-bar" style="margin-top:var(--cp-space-3)">';
    for (var sbk in RECIPE_STATUSES) {
      var cnt = statusCounts[sbk] || 0;
      if (cnt > 0) {
        var w = (cnt / recipes.length) * 100;
        html += '<div class="cp-campaign-status-segment" style="width:' + w + '%;background:' + RECIPE_STATUSES[sbk].color + '" title="' + esc(RECIPE_STATUSES[sbk].label) + ': ' + cnt + '"></div>';
      }
    }
    html += '</div>';
    return html;
  }

  // --- Campaign Research Tab ---
  function renderCampaignResearchTab(camp) {
    var html = '';
    html += '<p class="cp-text-muted" style="margin-bottom:var(--cp-space-3)">AI Research scoped to this campaign\'s targeted dimensions and objective.</p>';

    // Campaign-scoped AI Research Panel
    html += '<div class="cp-ai-research-slot">';
    html += renderAIResearchBar('Campaign Recipe', '#0891b2', 'bullhorn', 'campaign_research');
    html += '</div>';

    // Quick research actions
    html += '<div class="cp-card" style="margin-top:var(--cp-space-4)">';
    html += '<div class="cp-section-header"><h3>' + icon('sparkles') + ' Campaign AI Actions</h3></div>';
    html += '<div style="display:flex;flex-direction:column;gap:var(--cp-space-2)">';
    html += '<button class="cp-btn cp-btn-ai cp-btn-sm" data-action="ai-campaign-recipes" data-campaign-id="' + esc(camp.id) + '" style="justify-content:flex-start">' + icon('shuffle') + ' Suggest recipe combinations for this campaign</button>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="ai-campaign-gaps" data-campaign-id="' + esc(camp.id) + '" style="justify-content:flex-start">' + icon('magnifying-glass') + ' Analyze coverage gaps</button>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="ai-campaign-brief" data-campaign-id="' + esc(camp.id) + '" style="justify-content:flex-start">' + icon('file-lines') + ' Generate campaign brief</button>';
    html += '</div></div>';

    // Campaign context preview
    html += '<div class="cp-card" style="margin-top:var(--cp-space-4)">';
    html += '<div class="cp-section-header"><h3>' + icon('plug') + ' AI Context Preview</h3></div>';
    html += '<p class="cp-text-muted" style="margin-bottom:var(--cp-space-2)">This context is injected into all AI prompts for this campaign:</p>';
    var ctxItems = [];
    if (camp.objective) { var obj = CAMPAIGN_OBJECTIVES.find(function(o) { return o.id === camp.objective; }); if (obj) ctxItems.push(['Objective', obj.name]); }
    if (camp.funnel_stage) { var fs = S.funnelStageMap[camp.funnel_stage]; if (fs) ctxItems.push(['Funnel', fs.name]); }
    if ((camp.persona_ids || []).length) ctxItems.push(['Personas', camp.persona_ids.map(function(id) { var p = S.personaMap[id]; return p ? p.name : '?'; }).join(', ')]);
    if ((camp.message_ids || []).length) ctxItems.push(['Messages', camp.message_ids.map(function(id) { var m = S.messageMap[id]; return m ? m.title : '?'; }).join(', ')]);
    if (camp.ai_instructions) ctxItems.push(['Instructions', camp.ai_instructions]);
    for (var ci = 0; ci < ctxItems.length; ci++) {
      html += '<div class="cp-brand-ctx-item"><span class="cp-brand-ctx-label">' + esc(ctxItems[ci][0]) + '</span><span class="cp-brand-ctx-value">' + esc(ctxItems[ci][1]) + '</span></div>';
    }
    if (ctxItems.length === 0) html += '<p class="cp-text-muted">No campaign context set. <a href="#" data-action="edit-campaign" data-id="' + esc(camp.id) + '" style="color:var(--cp-primary)">Edit campaign</a> to add targeting and AI instructions.</p>';
    html += '</div>';
    return html;
  }

  // --- Campaign Brief Tab ---
  function renderCampaignBriefTab(camp) {
    var html = '';

    // Campaign brief (editable)
    html += '<div class="cp-card" style="margin-bottom:var(--cp-space-4)">';
    html += '<div class="cp-section-header"><h3>' + icon('file-lines') + ' Creative Brief</h3>';
    html += '<button class="cp-btn cp-btn-ai cp-btn-sm" data-action="ai-campaign-brief" data-campaign-id="' + esc(camp.id) + '">' + icon('sparkles') + ' AI Generate</button>';
    html += '</div>';
    html += '<textarea class="cp-textarea cp-campaign-brief-field" data-campaign-id="' + esc(camp.id) + '" rows="6" placeholder="Write a creative brief for this campaign — target audience, key messaging, visual direction, tone, goals...">' + esc(camp.brief || '') + '</textarea>';
    html += '</div>';

    // Auto-generated audience summary
    var personaIds = camp.persona_ids || [];
    if (personaIds.length > 0) {
      html += '<div class="cp-card" style="margin-bottom:var(--cp-space-4)">';
      html += '<div class="cp-section-header"><h3>' + icon('users') + ' Target Audience Summary</h3></div>';
      for (var pi = 0; pi < personaIds.length; pi++) {
        var per = S.personaMap[personaIds[pi]];
        if (!per) continue;
        html += '<div style="padding:var(--cp-space-2) 0;border-bottom:1px solid var(--cp-border-light)">';
        html += '<div style="font-weight:600;color:#9334e9;margin-bottom:2px">' + esc(per.name) + '</div>';
        if (per.description) html += '<div style="font-size:var(--cp-font-size-sm);color:var(--cp-text-secondary)">' + esc(truncate(per.description, 120)) + '</div>';
        // Show linked pain points
        var ppIds = per.pain_point_ids || [];
        if (ppIds.length > 0) {
          var pains = ppIds.map(function(id) { var pp = S.painPointMap[id]; return pp ? truncate(pp.pain_point, 40) : null; }).filter(Boolean);
          if (pains.length) html += '<div style="font-size:var(--cp-font-size-xs);color:var(--cp-text-muted);margin-top:4px">' + icon('bolt') + ' ' + pains.join(' · ') + '</div>';
        }
        html += '</div>';
      }
      html += '</div>';
    }

    // Key messages summary
    var messageIds = camp.message_ids || [];
    if (messageIds.length > 0) {
      html += '<div class="cp-card" style="margin-bottom:var(--cp-space-4)">';
      html += '<div class="cp-section-header"><h3>' + icon('comments') + ' Key Messages</h3></div>';
      for (var mi = 0; mi < messageIds.length; mi++) {
        var msg = S.messageMap[messageIds[mi]];
        if (!msg) continue;
        html += '<div style="padding:var(--cp-space-2) 0;border-bottom:1px solid var(--cp-border-light)">';
        html += '<div style="font-weight:600;color:#1a73e8">' + esc(msg.title) + '</div>';
        if (msg.funnel_stages && msg.funnel_stages.length) {
          html += '<div style="margin-top:2px">';
          for (var fi = 0; fi < msg.funnel_stages.length; fi++) html += funnelBadge(msg.funnel_stages[fi]);
          html += '</div>';
        }
        if (msg.hooks && msg.hooks.length) {
          html += '<div style="font-size:var(--cp-font-size-xs);color:var(--cp-text-muted);margin-top:4px">' + icon('anchor') + ' ' + msg.hooks.length + ' hook' + (msg.hooks.length !== 1 ? 's' : '') + ': ' + msg.hooks.map(function(h) { return '"' + truncate(h.text, 30) + '"'; }).slice(0, 3).join(', ') + '</div>';
        }
        html += '</div>';
      }
      html += '</div>';
    }

    // Visual direction summary
    var styleIds = camp.style_ids || [];
    var formatIds = camp.format_ids || [];
    if (styleIds.length > 0 || formatIds.length > 0) {
      html += '<div class="cp-card">';
      html += '<div class="cp-section-header"><h3>' + icon('palette') + ' Visual Direction</h3></div>';
      if (styleIds.length > 0) {
        html += '<div class="cp-field-label" style="color:#e37400;margin-bottom:4px">Styles</div>';
        html += '<div style="display:flex;flex-wrap:wrap;gap:var(--cp-space-2);margin-bottom:var(--cp-space-3)">';
        for (var si = 0; si < styleIds.length; si++) {
          var sty = S.styleMap[styleIds[si]];
          if (sty) html += '<span class="cp-badge" style="background:#e3740010;color:#e37400">' + esc(sty.name) + '</span>';
        }
        html += '</div>';
      }
      if (formatIds.length > 0) {
        html += '<div class="cp-field-label" style="color:#0891b2;margin-bottom:4px">Formats</div>';
        html += '<div style="display:flex;flex-wrap:wrap;gap:var(--cp-space-2)">';
        for (var fii = 0; fii < formatIds.length; fii++) {
          var fmt = S.formatMap[formatIds[fii]];
          if (fmt) html += '<span class="cp-badge" style="background:#0891b210;color:#0891b2">' + esc(fmt.name) + '</span>';
        }
        html += '</div>';
      }
      html += '</div>';
    }
    return html;
  }


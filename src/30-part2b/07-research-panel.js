  // ============================================================
  // SECTION 7: AI RESEARCH PANEL COMPONENT
  // ============================================================

  function renderAIResearchPanelBody(entityType, stateKey, color) {
    var html = '<div class="cp-ai-research-body" data-entity-type="' + esc(entityType) + '" data-state-key="' + esc(stateKey) + '">';

    // Input area
    html += '<div class="cp-ai-research-input">';
    html += '<textarea class="cp-textarea" id="cpResearchInput_' + esc(stateKey) + '" rows="2" placeholder="Optional: specific direction for AI research..."></textarea>';
    html += '<button class="cp-btn cp-btn-ai cp-btn-sm" data-action="ai-research-generate" data-entity-type="' + esc(entityType) + '" data-state-key="' + esc(stateKey) + '">' + icon('sparkles') + ' Generate</button>';
    html += '</div>';

    // AI picker
    html += '<div style="margin-bottom:var(--cp-space-3)">';
    html += (window._cpAiSel ? window._cpAiSel('ai-research-' + stateKey) : '');
    html += '</div>';

    // Results area
    var results = S._aiResearchResults && S._aiResearchResults[stateKey];
    if (results && results.length > 0) {
      html += '<div class="cp-ai-research-results" id="cpResearchResults_' + esc(stateKey) + '">';
      for (var ri = 0; ri < results.length; ri++) {
        var r = results[ri];
        var isChecked = r._selected ? ' cp-ai-research-result-selected' : '';
        html += '<div class="cp-ai-research-result' + isChecked + '" data-result-index="' + ri + '" data-state-key="' + esc(stateKey) + '">';
        html += '<div class="cp-ai-research-result-check" style="' + (r._selected ? 'background:' + color + ';border-color:' + color : 'border-color:var(--cp-border-default)') + '">';
        if (r._selected) html += icon('check');
        html += '</div>';
        html += '<div class="cp-ai-research-result-body">';
        html += '<div class="cp-ai-research-result-title">' + esc(r.name || r.title || r.pain_point || 'Result ' + (ri + 1)) + '</div>';
        if (r.description || r.body || r.solution) {
          html += '<div class="cp-ai-research-result-desc">' + esc(truncate(r.description || r.body || r.solution || '', 150)) + '</div>';
        }
        if (r._tags && r._tags.length) {
          html += '<div class="cp-ai-research-result-tags">';
          for (var ti = 0; ti < r._tags.length; ti++) html += '<span class="cp-badge" style="background:' + color + '15;color:' + color + '">' + esc(r._tags[ti]) + '</span>';
          html += '</div>';
        }
        html += '</div></div>';
      }
      html += '</div>';

      // Footer: add selected
      var selCount = results.filter(function(r) { return r._selected; }).length;
      html += '<div class="cp-ai-research-footer">';
      html += '<span class="cp-text-muted">' + selCount + ' of ' + results.length + ' selected</span>';
      html += '<div style="flex:1"></div>';
      html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="ai-research-select-all" data-state-key="' + esc(stateKey) + '">Select All</button>';
      html += '<button class="cp-btn cp-btn-primary cp-btn-sm" data-action="ai-research-add-selected" data-entity-type="' + esc(entityType) + '" data-state-key="' + esc(stateKey) + '"' + (selCount === 0 ? ' disabled' : '') + '>' + icon('plus') + ' Add ' + selCount + ' to Library</button>';
      html += '</div>';
    } else {
      html += '<div id="cpResearchResults_' + esc(stateKey) + '"></div>';
    }

    // Loading indicator
    html += '<div id="cpResearchLoading_' + esc(stateKey) + '" style="display:none;text-align:center;padding:var(--cp-space-4)">';
    html += icon('spinner') + ' <span class="cp-text-muted">Researching ' + esc(entityType.toLowerCase()) + 's...</span>';
    html += '</div>';

    html += '</div>';
    return html;
  }

  function toggleResearchResultSelection(stateKey, index) {
    S._aiResearchResults = S._aiResearchResults || {};
    var results = S._aiResearchResults[stateKey] || [];
    if (results[index]) {
      results[index]._selected = !results[index]._selected;
      render();
    }
  }

  function selectAllResearchResults(stateKey) {
    var results = (S._aiResearchResults || {})[stateKey] || [];
    var allSelected = results.every(function(r) { return r._selected; });
    results.forEach(function(r) { r._selected = !allSelected; });
    render();
  }

  function addSelectedToLibrary(entityType, stateKey) {
    var results = (S._aiResearchResults || {})[stateKey] || [];
    var selected = results.filter(function(r) { return r._selected; });
    if (selected.length === 0) { toast('No items selected', 'warning'); return; }

    snapshot('Add ' + selected.length + ' ' + entityType + 's from research');
    var typeMap = { 'Persona': 'persona', 'Message': 'message', 'Style': 'style', 'Visual Format': 'visual_format', 'Pain Point': 'pain_point' };
    var crudType = typeMap[entityType] || entityType.toLowerCase();

    for (var i = 0; i < selected.length; i++) {
      var r = selected[i];
      var data = {};
      if (crudType === 'persona') {
        data = { name: r.name || '', description: r.description || '', demographics: r.demographics || {}, psychographics: r.psychographics || {} };
      } else if (crudType === 'message') {
        data = { title: r.title || r.name || '', body: r.body || '', funnel_stages: r.funnel_stages || [], delivery_notes: r.delivery_notes || '', hooks: r.hooks || [] };
      } else if (crudType === 'style') {
        data = { name: r.name || '', description: r.description || '' };
      } else if (crudType === 'visual_format') {
        data = { name: r.name || '', description: r.description || '', category: r.category || '' };
      } else if (crudType === 'pain_point') {
        data = { pain_point: r.pain_point || r.name || '', solution: r.solution || '', category: r.category || '' };
      }
      createEntity(crudType, data);
    }

    // Clear results
    S._aiResearchResults[stateKey] = [];
    toast(selected.length + ' ' + entityType.toLowerCase() + (selected.length > 1 ? 's' : '') + ' added to library', 'success');
  }


  // ============================================================
  // SECTION 18: PLACEHOLDER VIEWS (Part 2B)
  // ============================================================

  function renderResearchPlaceholder() {
    var msg = S._part2bTimeout ? 'Research Lab could not load. Please refresh the page.' : 'Loading Research Lab...';
    return '<div class="cp-view cp-view-placeholder">' +
      '<div class="cp-empty-state cp-empty-state--center">' +
      '<div class="cp-empty-state-icon">' + (S._part2bTimeout ? icon('warning') : icon('spinner')) + '</div>' +
      '<div class="cp-empty-state-title">' + esc(msg) + '</div>' +
      '<div class="cp-empty-state-text">The Research Lab, Settings, and Images views require the AI module to load.</div>' +
      '</div></div>';
  }

  function renderImagesPlaceholder() {
    var msg = S._part2bTimeout ? 'Images view could not load. Please refresh the page.' : 'Loading Images...';
    return '<div class="cp-view cp-view-placeholder">' +
      '<div class="cp-empty-state cp-empty-state--center">' +
      '<div class="cp-empty-state-icon">' + (S._part2bTimeout ? icon('warning') : icon('spinner')) + '</div>' +
      '<div class="cp-empty-state-title">' + esc(msg) + '</div>' +
      '</div></div>';
  }

  function renderSettingsPlaceholder() {
    var msg = S._part2bTimeout ? 'Settings view could not load. Please refresh the page.' : 'Loading Settings...';
    return '<div class="cp-view cp-view-placeholder">' +
      '<div class="cp-empty-state cp-empty-state--center">' +
      '<div class="cp-empty-state-icon">' + (S._part2bTimeout ? icon('warning') : icon('spinner')) + '</div>' +
      '<div class="cp-empty-state-title">' + esc(msg) + '</div>' +
      '</div></div>';
  }
  // Part 2A bridge functions — safe to call before Part 2A loads
  function openModal(title, content, options) {
    var P2A = window._cpPart2A;
    if (P2A && P2A.openModal) { P2A.openModal(title, content, options); }
    else { toast('Editor not loaded yet. Please try again.', 'warning'); }
  }
  function closeModal() {
    var P2A = window._cpPart2A;
    if (P2A && P2A.closeModal) P2A.closeModal();
  }
  function openConfirmDialog(opts) {
    var P2A = window._cpPart2A;
    if (P2A && P2A.openConfirmDialog) { P2A.openConfirmDialog(opts); }
    else { toast('Editor not loaded yet. Please try again.', 'warning'); }
  }
  function snapshot(label) {
    var P2A = window._cpPart2A;
    if (P2A && P2A.snapshot) P2A.snapshot(label);
  }

  function setupEventHandlers() {
    console.log('[CP] Setting up core event handlers...');

    // Sidebar navigation
    $(document).off('click.cp-nav').on('click.cp-nav', '.cp-nav-item', function(e) {
      e.preventDefault();
      var viewName = $(this).data('view');
      if (viewName) navigate(viewName);
    });

    // Sidebar toggle
    $(document).off('click.cp-sidebar-toggle').on('click.cp-sidebar-toggle', '#cpSidebarToggle', function() {
      S.sidebarHidden = !S.sidebarHidden;
      $('#cpSidebar').toggleClass('cp-sidebar-hidden', S.sidebarHidden);
    });

    // Setup submit
    $(document).off('click.cp-setup').on('click.cp-setup', '#cpSetupSubmit', function(e) {
      e.preventDefault();
      completeSetup();
    });

    // Go-view buttons (data-action="go-view" data-view="xxx")
    $(document).off('click.cp-go-view').on('click.cp-go-view', '[data-action="go-view"]', function(e) {
      e.preventDefault();
      var v = $(this).data('view');
      if (v) navigate(v);
    });

    // Navigate to campaign from recipe badge
    $(document).off('click.cp-go-campaign').on('click.cp-go-campaign', '[data-action="go-to-campaign"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      var campId = $(this).data('id');
      if (campId) {
        S.selectedCampaignId = campId;
        navigate('campaigns');
      }
    });

    // Save button
    $(document).off('click.cp-save').on('click.cp-save', '#cpSaveNodeBtn', function(e) {
      e.preventDefault();
      syncToTextarea();
      if (S.$submitBtn && S.$submitBtn.length) {
        updateSaveStatus('saving');
        S.$submitBtn.click();
      } else {
        toast('Drupal save button not found', 'error');
      }
    });

    // Global search
    $(document).off('input.cp-global-search').on('input.cp-global-search', '#cpGlobalSearchInput', debounce(function() {
      var q = ($(this).val() || '').trim().toLowerCase();
      var $results = $('#cpGlobalSearchResults');
      if (q.length < 2) { $results.hide(); return; }

      var results = [];
      // Search personas
      (S.data.personas || []).forEach(function(p) {
        if ((p.name || '').toLowerCase().indexOf(q) > -1 || (p.description || '').toLowerCase().indexOf(q) > -1) {
          results.push({ type: 'persona', icon: 'users', color: '#9334e9', title: p.name, sub: truncate(p.description || '', 40), id: p.id, view: 'personas' });
        }
      });
      // Search messages
      (S.data.messages || []).forEach(function(m) {
        if ((m.title || '').toLowerCase().indexOf(q) > -1 || (m.theme || '').toLowerCase().indexOf(q) > -1) {
          results.push({ type: 'message', icon: 'comments', color: '#1a73e8', title: m.title, sub: m.theme || '', id: m.id, view: 'messages' });
        }
      });
      // Search recipes
      (S.data.recipes || []).forEach(function(r) {
        if ((r.title || '').toLowerCase().indexOf(q) > -1) {
          results.push({ type: 'recipe', icon: 'shuffle', color: '#e37400', title: r.title, sub: (RECIPE_STATUSES[r.status] || {}).label || '', id: r.id, view: 'recipes' });
        }
      });
      // Search campaigns
      (S.data.campaigns || []).forEach(function(c) {
        if ((c.name || '').toLowerCase().indexOf(q) > -1 || (c.description || '').toLowerCase().indexOf(q) > -1) {
          results.push({ type: 'campaign', icon: 'bullhorn', color: '#0891b2', title: c.name, sub: (CAMPAIGN_STATUSES[c.status] || {}).label || '', id: c.id, view: 'campaigns' });
        }
      });
      // Search pain points
      (S.data.pain_points || []).forEach(function(pp) {
        if ((pp.pain_point || '').toLowerCase().indexOf(q) > -1) {
          results.push({ type: 'pain_point', icon: 'bolt', color: '#d93025', title: truncate(pp.pain_point, 40), sub: pp.category || '', id: pp.id, view: 'pain_points' });
        }
      });
      // Search styles
      (S.data.styles || []).forEach(function(s) {
        if ((s.name || '').toLowerCase().indexOf(q) > -1) {
          results.push({ type: 'style', icon: 'palette', color: '#e37400', title: s.name, sub: '', id: s.id, view: 'styles' });
        }
      });

      if (results.length === 0) {
        $results.html('<div class="cp-global-search-empty">No results for "' + esc(q) + '"</div>').show();
        return;
      }

      var rHtml = '';
      var shownTypes = {};
      for (var ri = 0; ri < Math.min(results.length, 10); ri++) {
        var r = results[ri];
        if (!shownTypes[r.type]) {
          if (ri > 0) rHtml += '<div class="cp-global-search-divider"></div>';
          rHtml += '<div class="cp-global-search-type">' + icon(r.icon) + ' ' + r.type.replace('_', ' ') + 's</div>';
          shownTypes[r.type] = true;
        }
        rHtml += '<div class="cp-global-search-item" data-action="global-search-go" data-view="' + esc(r.view) + '" data-id="' + esc(r.id) + '" data-type="' + esc(r.type) + '">';
        rHtml += '<span style="color:' + r.color + '">' + icon(r.icon) + '</span> ';
        rHtml += '<span style="font-weight:500">' + esc(r.title) + '</span>';
        if (r.sub) rHtml += '<span class="cp-text-muted" style="margin-left:auto;font-size:11px">' + esc(r.sub) + '</span>';
        rHtml += '</div>';
      }
      if (results.length > 10) rHtml += '<div class="cp-global-search-more">' + (results.length - 10) + ' more results...</div>';
      $results.html(rHtml).show();
    }, 200));

    // Global search result click
    $(document).off('click.cp-global-go').on('click.cp-global-go', '[data-action="global-search-go"]', function(e) {
      e.preventDefault();
      var view = $(this).data('view');
      var id = $(this).data('id');
      var type = $(this).data('type');
      $('#cpGlobalSearchInput').val('');
      $('#cpGlobalSearchResults').hide();
      if (type === 'recipe') { S.selectedRecipeId = id; S.currentStep = 'composition'; }
      else if (type === 'campaign') { S.selectedCampaignId = id; }
      else if (type === 'persona') { S.selectedPersonaId = id; }
      else if (type === 'pain_point') { S.selectedPainPointId = id; }
      navigate(view);
    });

    // Close search on click outside
    $(document).off('click.cp-search-close').on('click.cp-search-close', function(e) {
      if (!$(e.target).closest('#cpGlobalSearch').length) {
        $('#cpGlobalSearchResults').hide();
      }
    });

    // Ctrl+K to focus search
    $(document).off('keydown.cp-search-focus').on('keydown.cp-search-focus', function(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        $('#cpGlobalSearchInput').focus();
      }
    });

    // Toast close
    $(document).off('click.cp-toast-close').on('click.cp-toast-close', '[data-action="close-toast"]', function() {
      $(this).closest('.cp-toast').remove();
    });

    // Personas tab toggle
    $(document).off('click.cp-personas-tab').on('click.cp-personas-tab', '[data-action="set-personas-tab"]', function(e) {
      e.preventDefault();
      var tab = $(this).data('tab');
      if (tab && tab !== S.personasTab) {
        S.personasTab = tab;
        S.selectedPersonaId = null;
        renderCurrentView();
      }
    });

    // Styles tab toggle
    $(document).off('click.cp-styles-tab').on('click.cp-styles-tab', '[data-action="set-styles-tab"]', function(e) {
      e.preventDefault();
      var tab = $(this).data('tab');
      if (tab && tab !== S.stylesTab) {
        S.stylesTab = tab;
        renderCurrentView();
      }
    });

    // Select persona
    $(document).off('click.cp-select-persona').on('click.cp-select-persona', '[data-action="select-persona"]', function(e) {
      e.preventDefault();
      var id = $(this).data('id');
      if (id) {
        S.selectedPersonaId = id;
        renderCurrentView();
      }
    });

    // Toggle category collapse
    $(document).off('click.cp-toggle-group').on('click.cp-toggle-group', '[data-action="toggle-group"]', function(e) {
      e.preventDefault();
      e.stopPropagation();
      var groupKey = $(this).data('group');
      if (groupKey) {
        S.collapsedGroups[groupKey] = !S.collapsedGroups[groupKey];
        renderCurrentView();
      }
    });

    // AI Research bar toggle
    $(document).off('click.cp-ai-toggle').on('click.cp-ai-toggle', '[data-action="toggle-ai-research"]', function(e) {
      e.preventDefault();
      e.stopPropagation();
      var key = $(this).data('key');
      if (key) {
        S.aiResearchOpen[key] = !S.aiResearchOpen[key];
        renderCurrentView();
      }
    });

    // Message search (debounced)
    $(document).off('input.cp-msg-search').on('input.cp-msg-search', '#cpMessageSearch', debounce(function() {
      S.messageFilter.search = $(this).val() || '';
      renderCurrentView();
    }, 250));

    // Message funnel filter
    $(document).off('change.cp-msg-funnel').on('change.cp-msg-funnel', '#cpMessageFunnelFilter', function() {
      S.messageFilter.funnel = $(this).val() || '';
      renderCurrentView();
    });

    // Message sort
    $(document).off('change.cp-msg-sort').on('change.cp-msg-sort', '#cpMessageSort', function() {
      S.messageFilter.sortBy = $(this).val() || 'updated';
      renderCurrentView();
    });

    // Persona search (debounced)
    $(document).off('input.cp-persona-search').on('input.cp-persona-search', '#cpPersonaSearch', debounce(function() {
      S.personaFilter.search = $(this).val() || '';
      renderCurrentView();
      var $el = $('#cpPersonaSearch'); if ($el.length) { var v = $el.val(); $el.focus(); $el[0].setSelectionRange(v.length, v.length); }
    }, 250));

    // Pain Point page search + filter + select
    $(document).off('input.cp-pp-page-search').on('input.cp-pp-page-search', '#cpPainPointPageSearch', debounce(function() {
      S.painPointFilter = S.painPointFilter || {};
      S.painPointFilter.search = $(this).val() || '';
      renderCurrentView();
      var $el = $('#cpPainPointPageSearch'); if ($el.length) { var v = $el.val(); $el.focus(); $el[0].setSelectionRange(v.length, v.length); }
    }, 250));
    $(document).off('change.cp-pp-cat-filter').on('change.cp-pp-cat-filter', '#cpPainPointCatFilter', function() {
      S.painPointFilter = S.painPointFilter || {};
      S.painPointFilter.category = $(this).val() || '';
      renderCurrentView();
    });
    $(document).off('change.cp-pp-group-by').on('change.cp-pp-group-by', '#cpPainPointGroupBy', function() {
      S.painPointFilter = S.painPointFilter || {};
      S.painPointFilter.groupBy = $(this).val() || 'category';
      renderCurrentView();
    });
    $(document).off('click.cp-pp-group-toggle').on('click.cp-pp-group-toggle', '[data-action="toggle-pp-group"]', function(e) {
      e.preventDefault();
      var catId = $(this).data('cat-id');
      if (!catId) return;
      S.collapsedGroups = S.collapsedGroups || {};
      var key = 'ppcat_' + catId;
      S.collapsedGroups[key] = !S.collapsedGroups[key];
      renderCurrentView();
    });
    $(document).off('click.cp-select-pp-page').on('click.cp-select-pp-page', '[data-action="select-pain-point-page"]', function(e) {
      e.preventDefault();
      S.selectedPainPointId = $(this).data('id');
      renderCurrentView();
    });

    // Pain point inline editing (blur saves)
    $(document).off('blur.cp-pp-inline').on('blur.cp-pp-inline', '.cp-pp-inline-field', function() {
      var ppId = S.selectedPainPointId;
      if (!ppId) return;
      var field = $(this).data('ppfield');
      var val = $(this).is('select') ? $(this).val() : $(this).val();
      saveEntityField('pain_point', ppId, field, val || '');
    });
    $(document).off('change.cp-pp-inline-sel').on('change.cp-pp-inline-sel', 'select.cp-pp-inline-field', function() {
      var ppId = S.selectedPainPointId;
      if (!ppId) return;
      saveEntityField('pain_point', ppId, $(this).data('ppfield'), $(this).val() || '');
    });

    // Unlink pain point from persona
    $(document).off('click.cp-unlink-pp').on('click.cp-unlink-pp', '[data-action="unlink-pp-from-persona"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      var ppId = $(this).data('pp-id');
      var personaId = $(this).data('persona-id');
      if (!ppId || !personaId) return;
      var persona = S.personaMap[personaId];
      if (persona) {
        persona.pain_point_ids = (persona.pain_point_ids || []).filter(function(id) { return id !== ppId; });
        persona.updated = new Date().toISOString();
        buildMaps(); syncToTextarea(); renderCurrentView();
        toast('Unlinked from ' + (persona.name || 'persona'), 'success');
      }
    });

    // Link pain point to personas (opens multi-select modal)
    $(document).off('click.cp-link-pp').on('click.cp-link-pp', '[data-action="link-pp-to-personas"]', function(e) {
      e.preventDefault();
      var ppId = $(this).data('pp-id');
      if (!ppId) return;
      var allPersonas = getAllPersonas();
      var html = '<div class="cp-editor-form">';
      html += '<p class="cp-text-muted" style="margin-bottom:var(--cp-space-3)">Select personas to link this pain point to:</p>';
      for (var pi = 0; pi < allPersonas.length; pi++) {
        var p = allPersonas[pi];
        var isLinked = (p.pain_point_ids || []).indexOf(ppId) > -1;
        html += '<label style="display:flex;align-items:center;gap:var(--cp-space-2);padding:var(--cp-space-2) 0;border-bottom:1px solid var(--cp-border-light);cursor:pointer">';
        html += '<input type="checkbox" class="cp-pp-link-check" data-persona-id="' + esc(p.id) + '"' + (isLinked ? ' checked' : '') + '>';
        html += '<span style="flex:1">' + esc(p.name) + '</span>';
        if (isLinked) html += '<span class="cp-badge" style="background:var(--cp-success-light);color:var(--cp-success);font-size:10px">' + icon('link') + ' Linked</span>';
        html += '</label>';
      }
      html += '</div>';

      openModal('Link to Personas', html, {
        titleIcon: 'link', size: 'md', saveLabel: 'Update Links',
        onSave: function() {
          snapshot('Link pain point to personas');
          $('.cp-pp-link-check').each(function() {
            var personaId = $(this).data('persona-id');
            var persona = S.personaMap[personaId];
            if (!persona) return;
            persona.pain_point_ids = persona.pain_point_ids || [];
            var idx = persona.pain_point_ids.indexOf(ppId);
            if (this.checked && idx === -1) persona.pain_point_ids.push(ppId);
            else if (!this.checked && idx > -1) persona.pain_point_ids.splice(idx, 1);
            persona.updated = new Date().toISOString();
          });
          buildMaps(); syncToTextarea(); renderCurrentView();
          closeModal();
          toast('Persona links updated', 'success');
        }
      });
    });

    // Format page search + filter
    $(document).off('input.cp-fmt-page-search').on('input.cp-fmt-page-search', '#cpFormatPageSearch', debounce(function() {
      S.formatFilter = S.formatFilter || {};
      S.formatFilter.search = $(this).val() || '';
      renderCurrentView();
    }, 250));
    $(document).off('change.cp-fmt-cat-filter').on('change.cp-fmt-cat-filter', '#cpFormatCatFilter', function() {
      S.formatFilter = S.formatFilter || {};
      S.formatFilter.category = $(this).val() || '';
      renderCurrentView();
    });

    // Select recipe
    $(document).off('click.cp-select-recipe').on('click.cp-select-recipe', '[data-action="select-recipe"]', function(e) {
      e.preventDefault();
      var id = $(this).data('id');
      if (id) {
        S.selectedRecipeId = id;
        S.currentStep = 'composition';
        if (S.currentView !== 'recipes') navigate('recipes');
        else renderCurrentView();
      }
    });

    // Recipe search (debounced)
    $(document).off('input.cp-recipe-search').on('input.cp-recipe-search', '#cpRecipeSearch', debounce(function() {
      S.recipeFilter.search = $(this).val() || '';
      renderCurrentView();
      var $el = $('#cpRecipeSearch'); if ($el.length) { var v = $el.val(); $el.focus(); $el[0].setSelectionRange(v.length, v.length); }
    }, 250));

    // Recipe status filter
    $(document).off('change.cp-recipe-status').on('change.cp-recipe-status', '#cpRecipeStatusFilter', function() {
      var v = $(this).val();
      S.recipeFilter.statuses = v ? [v] : [];
      renderCurrentView();
    });

    // Recipe campaign filter
    $(document).off('change.cp-recipe-camp').on('change.cp-recipe-camp', '#cpRecipeCampaignFilter', function() {
      S.recipeFilter.campaign = $(this).val() || '';
      renderCurrentView();
    });

    // Recipe production-presence filter (has / missing production node)
    $(document).off('change.cp-recipe-prod').on('change.cp-recipe-prod', '#cpRecipeProductionFilter', function() {
      S.recipeFilter.production = $(this).val() || '';
      renderCurrentView();
    });

    // Recipe sort
    $(document).off('change.cp-recipe-sort').on('change.cp-recipe-sort', '#cpRecipeSortBy', function() {
      S.recipeFilter.sortBy = $(this).val() || 'updated';
      renderCurrentView();
    });

    // Recipe sort direction toggle
    $(document).off('click.cp-recipe-sortdir').on('click.cp-recipe-sortdir', '[data-action="toggle-recipe-sort-dir"]', function(e) {
      e.preventDefault();
      S.recipeFilter.sortDir = S.recipeFilter.sortDir === 'asc' ? 'desc' : 'asc';
      renderCurrentView();
    });

    // Bulk mode toggle
    $(document).off('click.cp-bulk-toggle').on('click.cp-bulk-toggle', '[data-action="toggle-bulk-mode"]', function(e) {
      e.preventDefault();
      S._bulkMode = !S._bulkMode;
      S._bulkSelected = [];
      renderCurrentView();
    });
    $(document).off('change.cp-bulk-item').on('change.cp-bulk-item', '[data-action="bulk-toggle-item"]', function(e) {
      e.stopPropagation();
      S._bulkSelected = S._bulkSelected || [];
      var id = $(this).data('id');
      var idx = S._bulkSelected.indexOf(id);
      if (this.checked && idx === -1) S._bulkSelected.push(id);
      else if (!this.checked && idx > -1) S._bulkSelected.splice(idx, 1);
      renderCurrentView();
    });
    $(document).off('change.cp-bulk-all').on('change.cp-bulk-all', '[data-action="bulk-select-all"]', function() {
      var recipes = getFilteredRecipes();
      if (this.checked) {
        S._bulkSelected = recipes.map(function(r) { return r.id; });
      } else {
        S._bulkSelected = [];
      }
      renderCurrentView();
    });
    $(document).off('change.cp-bulk-status').on('change.cp-bulk-status', '#cpBulkStatus', function() {
      var newStatus = $(this).val();
      if (!newStatus || !S._bulkSelected || S._bulkSelected.length === 0) return;
      var count = S._bulkSelected.length;
      snapshot('Bulk status change');
      S._bulkSelected.forEach(function(id) { saveEntityField('recipe', id, 'status', newStatus); });
      logActivity('recipe_batch_updated', 'recipe', '', '', 'Bulk status changed ' + count + ' recipes to ' + newStatus);
      S._bulkSelected = [];
      toast(count + ' recipes updated', 'success');
    });
    $(document).off('click.cp-bulk-assign').on('click.cp-bulk-assign', '[data-action="bulk-assign-campaign"]', function(e) {
      e.preventDefault();
      if (!S._bulkSelected || S._bulkSelected.length === 0) return;
      var camps = getAllCampaigns();
      var html = '<div class="cp-editor-form">';
      html += '<p class="cp-text-muted">Assign ' + S._bulkSelected.length + ' selected recipe(s) to a campaign:</p>';
      html += '<select class="cp-select" id="cpBulkCampaignSelect"><option value="">Unassigned</option>';
      for (var ci = 0; ci < camps.length; ci++) html += '<option value="' + esc(camps[ci].id) + '">' + esc(camps[ci].name) + '</option>';
      html += '</select></div>';
      openModal('Bulk Assign Campaign', html, {
        titleIcon: 'bullhorn', size: 'sm', saveLabel: 'Assign',
        onSave: function() {
          var campId = $('#cpBulkCampaignSelect').val() || '';
          snapshot('Bulk assign campaign');
          S._bulkSelected.forEach(function(id) { saveEntityField('recipe', id, 'campaign_id', campId); });
          logActivity('recipe_batch_updated', 'recipe', '', '', 'Bulk assigned ' + S._bulkSelected.length + ' recipes to campaign');
          S._bulkSelected = [];
          closeModal();
          toast('Recipes assigned', 'success');
        }
      });
    });
    $(document).off('click.cp-bulk-delete').on('click.cp-bulk-delete', '[data-action="bulk-delete"]', function(e) {
      e.preventDefault();
      if (!S._bulkSelected || S._bulkSelected.length === 0) return;
      openConfirmDialog({
        title: 'Delete ' + S._bulkSelected.length + ' Recipes',
        message: 'Are you sure you want to delete ' + S._bulkSelected.length + ' selected recipe(s)? This cannot be undone.',
        confirmLabel: 'Delete All', danger: true,
        onConfirm: function() {
          snapshot('Bulk delete');
          S._bulkSelected.forEach(function(id) { deleteEntity('recipe', id); });
          logActivity('recipe_batch_deleted', 'recipe', '', '', 'Bulk deleted ' + S._bulkSelected.length + ' recipes');
          S._bulkSelected = [];
          S._bulkMode = false;
        }
      });
    });

    // Pipeline step navigation
    $(document).off('click.cp-go-step').on('click.cp-go-step', '[data-action="go-step"]', function(e) {
      e.preventDefault();
      var step = $(this).data('step');
      if (step) {
        S.currentStep = step;
        renderCurrentView();
      }
    });

    // Campaign search (debounced)
    $(document).off('input.cp-campaign-search').on('input.cp-campaign-search', '#cpCampaignSearch', debounce(function() {
      S.campaignFilter.search = $(this).val() || '';
      renderCurrentView();
    }, 250));

    // Campaign status filter
    $(document).off('change.cp-campaign-status').on('change.cp-campaign-status', '#cpCampaignStatusFilter', function() {
      S.campaignFilter.status = $(this).val() || '';
      renderCurrentView();
    });

    // Campaign detail tab switch
    $(document).off('click.cp-campaign-tab').on('click.cp-campaign-tab', '[data-action="set-campaign-tab"]', function(e) {
      e.preventDefault();
      S.campaignDetailTab = $(this).data('tab') || 'overview';
      renderCurrentView();
    });

    // Campaign brief save on blur
    $(document).off('blur.cp-campaign-brief').on('blur.cp-campaign-brief', '.cp-campaign-brief-field', function() {
      var campId = $(this).data('campaign-id');
      if (campId) {
        saveEntityField('campaign', campId, 'brief', $(this).val() || '');
      }
    });

    // Quick-create recipe from coverage matrix
    $(document).off('click.cp-quick-recipe').on('click.cp-quick-recipe', '[data-action="quick-create-recipe"]', function(e) {
      e.preventDefault();
      var personaId = $(this).data('persona-id');
      var messageId = $(this).data('message-id');
      var campId = $(this).data('campaign-id');
      if (!personaId || !messageId || !campId) return;
      snapshot('Quick create recipe');
      var newRecipe = createEntity('recipe', {
        persona_id: personaId, message_id: messageId, campaign_id: campId
      });
      if (newRecipe) {
        buildMaps(); renderCurrentView();
        toast('Recipe created and linked to campaign', 'success');
      }
    });

    // Calendar navigation
    $(document).off('click.cp-cal-prev').on('click.cp-cal-prev', '[data-action="cal-prev"]', function(e) {
      e.preventDefault();
      S.calendarMonth--;
      if (S.calendarMonth < 0) { S.calendarMonth = 11; S.calendarYear--; }
      renderCurrentView();
    });
    $(document).off('click.cp-cal-next').on('click.cp-cal-next', '[data-action="cal-next"]', function(e) {
      e.preventDefault();
      S.calendarMonth++;
      if (S.calendarMonth > 11) { S.calendarMonth = 0; S.calendarYear++; }
      renderCurrentView();
    });
    $(document).off('click.cp-cal-today').on('click.cp-cal-today', '[data-action="cal-today"]', function(e) {
      e.preventDefault();
      var now = new Date();
      S.calendarYear = now.getFullYear();
      S.calendarMonth = now.getMonth();
      renderCurrentView();
    });
    $(document).off('click.cp-cal-mode').on('click.cp-cal-mode', '[data-action="cal-mode"]', function(e) {
      e.preventDefault();
      S.calendarMode = $(this).data('mode') || 'month';
      renderCurrentView();
    });

    // Calendar filters
    $(document).off('change.cp-cal-camp-filter').on('change.cp-cal-camp-filter', '#cpCalCampaignFilter', function() {
      S.calendarFilters = S.calendarFilters || {};
      S.calendarFilters.campaign = $(this).val() || '';
      renderCurrentView();
    });
    $(document).off('change.cp-cal-status-filter').on('change.cp-cal-status-filter', '#cpCalStatusFilter', function() {
      S.calendarFilters = S.calendarFilters || {};
      S.calendarFilters.status = $(this).val() || '';
      renderCurrentView();
    });

    // Activity search (debounced)
    $(document).off('input.cp-activity-search').on('input.cp-activity-search', '#cpActivitySearch', debounce(function() {
      S.activityFilter.search = $(this).val() || '';
      renderCurrentView();
    }, 250));

    // Activity type filter
    $(document).off('change.cp-activity-type').on('change.cp-activity-type', '#cpActivityTypeFilter', function() {
      S.activityFilter.type = $(this).val() || '';
      renderCurrentView();
    });

    // Filter pipeline status from dashboard
    $(document).off('click.cp-filter-pipeline').on('click.cp-filter-pipeline', '[data-action="filter-pipeline-status"]', function(e) {
      e.preventDefault();
      var status = $(this).data('status');
      if (status) {
        S.recipeFilter.statuses = [status];
        navigate('recipes');
      }
    });

    // Select entity from activity
    $(document).off('click.cp-select-entity').on('click.cp-select-entity', '[data-action="select-entity"]', function(e) {
      e.preventDefault();
      var type = $(this).data('type');
      var id = $(this).data('id');
      if (type === 'recipe' && id) { S.selectedRecipeId = id; navigate('recipes'); }
      else if (type === 'persona' && id) { S.selectedPersonaId = id; navigate('personas'); }
      else if (type === 'campaign' && id) { navigate('campaigns'); }
      else if (type === 'message' && id) { navigate('messages'); }
    });

    // Hash change
    $(window).off('hashchange.cp').on('hashchange.cp', function() {
      var h = readHash();
      if (h !== S.currentView) navigate(h, { noHash: true });
    });

    console.log('[CP] Core event handlers ready');
  }

  function setupViewEventHandlers() {
    // Per-render hooks — called after each renderCurrentView()
    var view = S.currentView;

    // Restore scroll position for list panes
    if (view === 'recipes' && S.selectedRecipeId) {
      var $selItem = $('.cp-recipe-item-selected');
      if ($selItem.length) {
        var $list = $selItem.closest('.cp-recipe-list');
        if ($list.length) {
          var itemTop = $selItem.position().top;
          var listH = $list.height();
          if (itemTop > listH - 50 || itemTop < 0) {
            $list.scrollTop($list.scrollTop() + itemTop - listH / 3);
          }
        }
      }
    }

    if (view === 'personas' && S.selectedPersonaId) {
      var $selPersona = $('.cp-persona-item-selected');
      if ($selPersona.length) {
        var $tree = $selPersona.closest('.cp-persona-tree');
        if ($tree.length) {
          var pTop = $selPersona.position().top;
          var treeH = $tree.height();
          if (pTop > treeH - 50 || pTop < 0) {
            $tree.scrollTop($tree.scrollTop() + pTop - treeH / 3);
          }
        }
      }
    }

    // Update sidebar badge counts
    for (var key in APP_VIEWS) {
      var badgeHtml = renderSidebarBadge(key);
      var $navItem = $('.cp-nav-item[data-view="' + key + '"]');
      $navItem.find('.cp-nav-badge').remove();
      if (badgeHtml) $navItem.append(badgeHtml);
    }
  }


  // ============================================================
  // SECTION 11: COMPOSITION STEP RENDERER
  // ============================================================

  function renderCompositionStep(recipe) {
    var html = '<div class="cp-step-composition" data-recipe-id="' + esc(recipe.id) + '">';

    // ── PRIMARY ROW: Persona + Message (large, dominant)
    html += '<div class="cp-card cp-composition-primary">';
    html += '<div class="cp-section-header"><h3>' + icon('shapes') + ' Core Composition</h3>';
    html += '<span class="cp-text-muted">Persona &amp; message angle drive every creative decision.</span></div>';
    html += '<div class="cp-composition-primary-grid">';
    html += renderCompositionPrimaryCard('persona', recipe.persona_id, 'persona_id', recipe);
    html += renderCompositionPrimaryCard('message', recipe.message_id, 'message_id', recipe);
    html += '</div></div>';

    // ── SECONDARY ROW: Style + Visual Format (compact chips)
    html += '<div class="cp-card cp-composition-secondary">';
    html += '<div class="cp-composition-secondary-header">';
    html += '<span class="cp-composition-secondary-label">' + icon('sliders') + ' Style &amp; Visual Format <span class="cp-text-muted">(optional refinements)</span></span>';
    html += '</div>';
    html += '<div class="cp-composition-secondary-grid">';
    html += renderCompositionChip('style', recipe.style_id, recipe);
    html += renderCompositionChip('format', recipe.visual_format_id, recipe);
    html += '</div></div>';

    // ── Media type toggle (used downstream to pick production app)
    // Once a production node exists for this recipe, the media type is locked
    // to whatever that production was created as. To switch types, the user
    // has to delete the production node in Drupal first.
    var compProd = getRecipeProduction(recipe);
    var mtLocked = !!compProd;
    var lockedMtKey = compProd ? (compProd.media_type || recipe.media_type) : '';
    html += '<div class="cp-card' + (mtLocked ? ' cp-media-type-card-locked' : '') + '" style="margin-top:var(--cp-space-3)">';
    html += '<div class="cp-section-header"><h3>' + icon('image') + ' Media Type' + (mtLocked ? ' <span class="cp-media-type-lock-icon" title="Locked — production node exists">' + icon('lock') + '</span>' : '') + '</h3>';
    if (mtLocked) {
      html += '<span class="cp-text-muted">Locked — a production node exists for this recipe. <a href="#" data-action="go-step" data-step="media">View it →</a></span></div>';
    } else {
      html += '<span class="cp-text-muted">Determines which production app handles delivery.</span></div>';
    }
    html += '<div class="cp-media-type-toggle' + (mtLocked ? ' cp-media-type-toggle-locked' : '') + '">';
    var mediaTypes = (typeof Constants !== 'undefined' && Constants.MEDIA_TYPES) || {};
    for (var mtk in mediaTypes) {
      var mt = mediaTypes[mtk];
      var mtActive = (mtLocked ? lockedMtKey : recipe.media_type) === mtk ? ' cp-media-type-active' : '';
      if (mtLocked) {
        html += '<button class="cp-media-type-btn cp-media-type-btn-locked' + mtActive + '" type="button" disabled aria-disabled="true" title="Locked — production node exists">' + icon(mt.icon) + ' ' + esc(mt.label) + '</button>';
      } else {
        html += '<button class="cp-media-type-btn' + mtActive + '" data-action="set-media-type" data-type="' + mtk + '">' + icon(mt.icon) + ' ' + esc(mt.label) + '</button>';
      }
    }
    html += '</div></div>';

    // ── Pain point selector (grouped + searchable)
    html += renderPainPointSelector(recipe);

    // ── Title editor
    html += '<div class="cp-card" style="margin-top:var(--cp-space-3)">';
    html += '<div class="cp-section-header"><h3>' + icon('edit') + ' Recipe Title</h3></div>';
    html += '<input type="text" class="cp-input" data-action="save-recipe-title" value="' + esc(recipe.title || '') + '" placeholder="Recipe title...">';
    html += '</div>';

    // ── Priority + Campaign + Due date
    html += '<div class="cp-card" style="margin-top:var(--cp-space-3)">';
    html += '<div class="cp-section-header"><h3>' + icon('sliders') + ' Details</h3></div>';
    var camps = getAllCampaigns();
    html += '<div class="cp-recipe-details-grid">';
    html += '<div class="cp-form-group"><label class="cp-field-label">Priority</label>';
    html += '<select class="cp-select" data-action="save-recipe-field" data-rfield="priority">';
    for (var pk in Constants.PRIORITY_LEVELS) {
      html += '<option value="' + pk + '"' + (recipe.priority === pk ? ' selected' : '') + '>' + esc(Constants.PRIORITY_LEVELS[pk].label) + '</option>';
    }
    html += '</select></div>';
    html += '<div class="cp-form-group"><label class="cp-field-label">Campaign</label>';
    html += '<select class="cp-select" data-action="save-recipe-field" data-rfield="campaign_id">';
    html += '<option value="">None</option>';
    for (var ci = 0; ci < camps.length; ci++) {
      html += '<option value="' + esc(camps[ci].id) + '"' + (recipe.campaign_id === camps[ci].id ? ' selected' : '') + '>' + esc(truncate(camps[ci].name, 25)) + '</option>';
    }
    html += '</select></div>';
    html += '<div class="cp-form-group"><label class="cp-field-label">Due Date</label>';
    html += '<input type="date" class="cp-input" data-action="save-recipe-field" data-rfield="due_date" value="' + esc(recipe.due_date || '') + '"></div>';
    html += '</div></div>';

    // ── Templates
    html += '<div class="cp-card" style="margin-top:var(--cp-space-3)">';
    html += '<div class="cp-section-header"><h3>' + icon('bookmark') + ' Templates</h3></div>';
    html += '<div style="display:flex;gap:var(--cp-space-2);flex-wrap:wrap">';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="save-recipe-template" data-recipe-id="' + esc(recipe.id) + '">' + icon('floppy-disk') + ' Save as Template</button>';
    var templates = (S.meta && S.meta.recipe_templates) || [];
    if (templates.length > 0) {
      html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="apply-recipe-template" data-recipe-id="' + esc(recipe.id) + '">' + icon('file-import') + ' Apply Template (' + templates.length + ')</button>';
    }
    html += '</div></div>';

    html += '</div>';
    return html;
  }

  function renderCompositionPrimaryCard(dimKey, currentId, fieldKey, recipe) {
    var dim = Constants.DIMENSIONS[dimKey];
    var entity = getEntityForDim(dimKey, currentId);
    var entityName = entity ? (entity.name || entity.title || '') : '';
    var entitySub = getEntitySubtext(dimKey, entity);
    var entityDesc = entity ? (entity.description || entity.body || '') : '';
    var isEmpty = !entity;

    var html = '<div class="cp-comp-primary-card' + (isEmpty ? ' cp-comp-primary-card-empty' : '') + '" style="--dim-color:' + dim.color + '">';
    html += '<div class="cp-comp-primary-icon" style="background:' + dim.color + '15;color:' + dim.color + '">' + icon(dim.icon) + '</div>';
    html += '<div class="cp-comp-primary-body">';
    html += '<div class="cp-comp-primary-label" style="color:' + dim.color + '">' + esc(dim.label) + (dimKey === 'message' ? ' Angle' : '') + '</div>';
    if (isEmpty) {
      html += '<div class="cp-comp-primary-empty">Not set</div>';
    } else {
      html += '<div class="cp-comp-primary-name">' + esc(entityName) + '</div>';
      if (entitySub) html += '<div class="cp-comp-primary-sub">' + esc(entitySub) + '</div>';
      if (entityDesc) html += '<div class="cp-comp-primary-desc">' + esc(truncate(entityDesc, 140)) + '</div>';
    }
    html += '</div>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="change-dimension" data-dim="' + dimKey + '" data-recipe-id="' + esc(recipe.id) + '">' + (isEmpty ? icon('plus') + ' Set' : icon('refresh') + ' Change') + '</button>';
    html += '</div>';
    return html;
  }

  function renderCompositionChip(dimKey, currentId, recipe) {
    var dim = Constants.DIMENSIONS[dimKey];
    var entity = getEntityForDim(dimKey, currentId);
    var entityName = entity ? (entity.name || entity.title || '') : '';
    var isEmpty = !entity;

    var html = '<button class="cp-comp-chip' + (isEmpty ? ' cp-comp-chip-empty' : '') + '" data-action="change-dimension" data-dim="' + dimKey + '" data-recipe-id="' + esc(recipe.id) + '" style="--dim-color:' + dim.color + '">';
    html += '<span class="cp-comp-chip-icon" style="color:' + dim.color + '">' + icon(dim.icon) + '</span>';
    html += '<span class="cp-comp-chip-label">' + esc(dim.label) + ':</span>';
    html += '<span class="cp-comp-chip-value">' + (isEmpty ? '<span class="cp-text-muted">Not set</span>' : esc(entityName)) + '</span>';
    html += '<span class="cp-comp-chip-edit">' + icon(isEmpty ? 'plus' : 'edit') + '</span>';
    html += '</button>';
    return html;
  }

  function renderPainPointSelector(recipe) {
    var persona = S.personaMap[recipe.persona_id];
    var personaPainPoints = persona ? getPersonaPainPoints(persona) : [];
    var allPainPoints = getAllPainPoints();
    if (allPainPoints.length === 0) return '';

    var selected = recipe.selected_pain_point_ids || [];
    S._compPainFilter = S._compPainFilter || { search: '', scope: 'persona', category: '' };
    var f = S._compPainFilter;

    // Scope: 'persona' (default if persona has points) | 'all'
    if (personaPainPoints.length === 0 && f.scope === 'persona') f.scope = 'all';
    var basePool = f.scope === 'persona' ? personaPainPoints : allPainPoints;

    // Apply filters
    var pool = basePool.slice();
    if (f.search) {
      var q = f.search.toLowerCase();
      pool = pool.filter(function(pp) {
        return (pp.pain_point || '').toLowerCase().indexOf(q) > -1 ||
               (pp.solution || '').toLowerCase().indexOf(q) > -1;
      });
    }
    if (f.category) pool = pool.filter(function(pp) { return pp.category === f.category; });

    var html = '<div class="cp-card cp-pain-picker-card" style="margin-top:var(--cp-space-3)">';
    html += '<div class="cp-section-header"><h3>' + icon('bolt') + ' Pain Points to Address</h3>';
    html += '<span class="cp-text-muted">' + selected.length + ' selected · ' + pool.length + ' shown</span></div>';

    // Toolbar
    html += '<div class="cp-pain-picker-toolbar">';
    html += '<div class="cp-search-wrapper cp-search-wrapper-sm">' + icon('search') + '<input type="text" class="cp-input cp-input-sm" id="cpRecipePainSearch" placeholder="Search pain points…" value="' + esc(f.search || '') + '"></div>';
    html += '<select class="cp-select cp-select-sm" id="cpRecipePainCategory"><option value="">All categories</option>';
    var ppCats = Constants.PAIN_POINT_CATEGORIES || [];
    for (var ci = 0; ci < ppCats.length; ci++) {
      html += '<option value="' + esc(ppCats[ci].id) + '"' + (f.category === ppCats[ci].id ? ' selected' : '') + '>' + esc(ppCats[ci].name) + '</option>';
    }
    html += '</select>';
    if (personaPainPoints.length > 0) {
      html += '<div class="cp-pain-scope-toggle">';
      html += '<button class="cp-pain-scope-btn' + (f.scope === 'persona' ? ' cp-pain-scope-active' : '') + '" data-action="set-pain-scope" data-scope="persona" title="Pain points linked to this recipe’s persona">' + icon('user') + ' Persona (' + personaPainPoints.length + ')</button>';
      html += '<button class="cp-pain-scope-btn' + (f.scope === 'all' ? ' cp-pain-scope-active' : '') + '" data-action="set-pain-scope" data-scope="all" title="Browse every pain point in the library">' + icon('list') + ' All (' + allPainPoints.length + ')</button>';
      html += '</div>';
    }
    html += '</div>';

    // List — grouped by category
    if (pool.length === 0) {
      html += '<p class="cp-text-muted" style="padding:var(--cp-space-3) 0">No pain points match the filters.</p>';
    } else {
      var groups = groupPainPointsByCategory(pool);
      html += '<div class="cp-pain-picker-list">';
      for (var gi = 0; gi < groups.length; gi++) {
        var g = groups[gi];
        if (groups.length > 1) {
          html += '<div class="cp-pain-picker-group-label">' + esc(g.label) + ' <span class="cp-text-muted">(' + g.items.length + ')</span></div>';
        }
        for (var pi = 0; pi < g.items.length; pi++) {
          var pp = g.items[pi];
          var isSelected = selected.indexOf(pp.id) > -1;
          html += '<label class="cp-pain-point-picker-item' + (isSelected ? ' cp-pain-point-picker-item-selected' : '') + '">';
          html += '<input type="checkbox" data-action="toggle-recipe-pp" data-pp-id="' + esc(pp.id) + '"' + (isSelected ? ' checked' : '') + '>';
          html += '<div style="flex:1;min-width:0">';
          html += '<div style="font-weight:600;font-size:13px;line-height:1.4">' + esc(truncate(pp.pain_point, 110)) + '</div>';
          if (pp.solution) html += '<div style="font-size:11px;color:var(--cp-success);margin-top:2px;line-height:1.4"><i class="fa-solid fa-lightbulb" style="margin-right:3px"></i>' + esc(truncate(pp.solution, 100)) + '</div>';
          html += '</div></label>';
        }
      }
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  // Debounced search handler — exported for event handler registration
  var _cpPainSearchTimer = null;
  function _cpDebouncePainSearch() {
    var val = $(this).val() || '';
    if (_cpPainSearchTimer) clearTimeout(_cpPainSearchTimer);
    _cpPainSearchTimer = setTimeout(function() {
      S._compPainFilter = S._compPainFilter || {};
      S._compPainFilter.search = val;
      render();
      // Restore focus + caret after re-render
      var $el = $('#cpRecipePainSearch');
      if ($el.length) { var v = $el.val(); $el.focus(); try { $el[0].setSelectionRange(v.length, v.length); } catch(e) {} }
    }, 250);
  }

  function groupPainPointsByCategory(items) {
    var ppCats = Constants.PAIN_POINT_CATEGORIES || [];
    var grouped = {};
    for (var i = 0; i < items.length; i++) {
      var k = items[i].category || '__uncat__';
      (grouped[k] = grouped[k] || []).push(items[i]);
    }
    var result = [];
    for (var ci = 0; ci < ppCats.length; ci++) {
      if (grouped[ppCats[ci].id]) result.push({ id: ppCats[ci].id, label: ppCats[ci].name, items: grouped[ppCats[ci].id] });
    }
    if (grouped.__uncat__) result.push({ id: '', label: 'Uncategorized', items: grouped.__uncat__ });
    return result;
  }

  function getEntityForDim(dimKey, id) {
    if (!id) return null;
    if (dimKey === 'persona') return S.personaMap[id];
    if (dimKey === 'message') return S.messageMap[id];
    if (dimKey === 'style') return S.styleMap[id];
    if (dimKey === 'format') return S.formatMap[id];
    return null;
  }

  function getEntitySubtext(dimKey, entity) {
    if (!entity) return '';
    if (dimKey === 'persona') {
      var d = entity.demographics || {};
      return [d.age_range, d.location].filter(Boolean).join(' · ');
    }
    if (dimKey === 'message') {
      return (entity.funnel_stages || []).map(function(fid) {
        var f = S.funnelStageMap[fid]; return f ? f.short : '';
      }).filter(Boolean).join(', ');
    }
    if (dimKey === 'format' && entity.category) {
      var cat = (Constants.FORMAT_CATEGORIES || []).find(function(c) { return c.id === entity.category; });
      return cat ? cat.name : '';
    }
    return entity.description ? truncate(entity.description, 40) : '';
  }

  function openDimensionPicker(dimKey, recipeId) {
    var recipe = getRecipe(recipeId);
    if (!recipe) return;
    var dim = Constants.DIMENSIONS[dimKey];
    var items = [];
    var currentId = '';

    if (dimKey === 'persona') { items = getAllPersonas(); currentId = recipe.persona_id; }
    else if (dimKey === 'message') { items = getAllMessages(); currentId = recipe.message_id; }
    else if (dimKey === 'style') { items = getAllStyles(); currentId = recipe.style_id; }
    else if (dimKey === 'format') { items = getAllFormats(); currentId = recipe.visual_format_id; }

    // Reset/use per-dim picker filter state
    S._dimPickerFilter = S._dimPickerFilter || {};
    var fState = S._dimPickerFilter[dimKey] = S._dimPickerFilter[dimKey] || { search: '', groupBy: getDefaultPickerGroup(dimKey) };

    var html = renderDimensionPickerBody(dimKey, items, currentId, fState);

    openModal('Select ' + dim.label, html, {
      titleIcon: dim.icon,
      size: 'lg',
      saveLabel: 'Select',
      onSave: function() {
        var selected = $('.cp-modal-body input[name="dim_pick"]:checked').val() || '';
        var fieldMap = { persona: 'persona_id', message: 'message_id', style: 'style_id', format: 'visual_format_id' };
        saveEntityField('recipe', recipeId, fieldMap[dimKey], selected);
        autoUpdateRecipeTitle(recipeId);
        snapshot('Change ' + dim.label);
        closeModal();
      }
    });

    // Wire up filter/group within the modal (delegated handlers, no re-render of modal)
    $(document).off('input.cp-dim-pick-search').on('input.cp-dim-pick-search', '.cp-dim-picker-search', function() {
      var v = ($(this).val() || '').toLowerCase();
      $('.cp-dim-picker-item').each(function() {
        var $it = $(this);
        var hay = ($it.data('search-text') || '').toLowerCase();
        $it.toggle(!v || hay.indexOf(v) > -1);
      });
      // Hide empty groups
      $('.cp-dim-picker-group').each(function() {
        var $g = $(this);
        $g.toggle($g.find('.cp-dim-picker-item:visible').length > 0);
      });
    });
    $(document).off('change.cp-dim-pick-group').on('change.cp-dim-pick-group', '.cp-dim-picker-group-select', function() {
      fState.groupBy = $(this).val() || '';
      // Re-render body
      $('.cp-dim-picker-body').html(renderDimensionPickerBodyInner(dimKey, items, currentId, fState));
    });
  }

  function getDefaultPickerGroup(dimKey) {
    if (dimKey === 'persona') return 'category';
    if (dimKey === 'message') return 'funnel';
    if (dimKey === 'format')  return 'category';
    return '';
  }

  function renderDimensionPickerBody(dimKey, items, currentId, fState) {
    var dim = Constants.DIMENSIONS[dimKey];
    var html = '<div class="cp-editor-form cp-dim-picker">';

    // Toolbar
    if (items.length > 0) {
      html += '<div class="cp-dim-picker-toolbar">';
      html += '<div class="cp-search-wrapper cp-search-wrapper-sm">' + icon('search') + '<input type="text" class="cp-input cp-input-sm cp-dim-picker-search" placeholder="Search ' + esc(dim.label.toLowerCase()) + 's…"></div>';

      var groupOptions = getDimGroupOptions(dimKey);
      if (groupOptions.length > 1) {
        html += '<select class="cp-select cp-select-sm cp-dim-picker-group-select">';
        for (var gi = 0; gi < groupOptions.length; gi++) {
          html += '<option value="' + esc(groupOptions[gi].key) + '"' + (fState.groupBy === groupOptions[gi].key ? ' selected' : '') + '>Group: ' + esc(groupOptions[gi].label) + '</option>';
        }
        html += '</select>';
      }
      html += '<span class="cp-text-muted cp-dim-picker-count">' + items.length + ' total</span>';
      html += '</div>';
    }

    html += '<div class="cp-dim-picker-body">';
    html += renderDimensionPickerBodyInner(dimKey, items, currentId, fState);
    html += '</div></div>';
    return html;
  }

  function getDimGroupOptions(dimKey) {
    var common = [{ key: '', label: 'None' }];
    if (dimKey === 'persona') return common.concat([{ key: 'category', label: 'Category' }]);
    if (dimKey === 'message') return common.concat([{ key: 'funnel', label: 'Funnel Stage' }]);
    if (dimKey === 'format')  return common.concat([{ key: 'category', label: 'Category' }]);
    return common;
  }

  function renderDimensionPickerBodyInner(dimKey, items, currentId, fState) {
    var dim = Constants.DIMENSIONS[dimKey];
    if (items.length === 0) {
      return '<div class="cp-empty-state cp-empty-state--compact"><p>No ' + esc(dim.label.toLowerCase()) + 's created yet.</p>' +
        '<button class="cp-btn cp-btn-primary cp-btn-sm" data-action="new-' + dimKey + '">' + icon('plus') + ' Create ' + esc(dim.label) + '</button></div>';
    }

    var groups = groupDimensionItems(dimKey, items, fState.groupBy);
    var html = '<div class="cp-dim-picker-list">';
    for (var gi = 0; gi < groups.length; gi++) {
      var g = groups[gi];
      if (groups.length > 1 || g.label) {
        html += '<div class="cp-dim-picker-group">';
        html += '<div class="cp-dim-picker-group-label">' + esc(g.label) + ' <span class="cp-text-muted">(' + g.items.length + ')</span></div>';
      } else {
        html += '<div class="cp-dim-picker-group">';
      }
      for (var ii = 0; ii < g.items.length; ii++) {
        var item = g.items[ii];
        var iid = item.id;
        var iname = item.name || item.title || 'Untitled';
        var isSelected = iid === currentId;
        var sub = getEntitySubtext(dimKey, item);
        var desc = item.description || item.body || '';
        var searchText = (iname + ' ' + (sub || '') + ' ' + (desc || '')).trim();

        html += '<label class="cp-dim-picker-item cp-hook-radio-item' + (isSelected ? ' cp-hook-radio-item-selected' : '') + '" data-search-text="' + esc(searchText) + '">';
        html += '<input type="radio" name="dim_pick" value="' + esc(iid) + '"' + (isSelected ? ' checked' : '') + '>';
        html += '<div style="flex:1;min-width:0">';
        html += '<div style="font-weight:600;font-size:13px;line-height:1.4">' + esc(iname) + '</div>';
        if (sub) html += '<div style="font-size:11px;color:var(--cp-text-muted);margin-top:2px">' + esc(sub) + '</div>';
        if (desc) html += '<div style="font-size:11px;color:var(--cp-text-secondary);margin-top:4px;line-height:1.5">' + esc(truncate(desc, 160)) + '</div>';
        html += '</div></label>';
      }
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  function groupDimensionItems(dimKey, items, groupBy) {
    if (!groupBy) return [{ id: '', label: '', items: items }];

    if (dimKey === 'persona' && groupBy === 'category') {
      var pcats = getAllCategories();
      var byCat = {}; var uncat = [];
      for (var i = 0; i < items.length; i++) {
        var cid = items[i].category_id;
        if (cid && S.categoryMap[cid]) (byCat[cid] = byCat[cid] || []).push(items[i]);
        else uncat.push(items[i]);
      }
      var groups = [];
      for (var pi = 0; pi < pcats.length; pi++) {
        if (byCat[pcats[pi].id]) groups.push({ id: pcats[pi].id, label: pcats[pi].name, items: byCat[pcats[pi].id] });
      }
      if (uncat.length) groups.push({ id: '', label: 'Uncategorized', items: uncat });
      return groups;
    }

    if (dimKey === 'message' && groupBy === 'funnel') {
      var funnels = (S.meta.settings && S.meta.settings.funnel_stages) || [];
      var byFun = {}; var unas = [];
      for (var mi = 0; mi < items.length; mi++) {
        var stages = items[mi].funnel_stages || [];
        if (stages.length === 0) { unas.push(items[mi]); continue; }
        for (var si = 0; si < stages.length; si++) {
          (byFun[stages[si]] = byFun[stages[si]] || []).push(items[mi]);
        }
      }
      var mGroups = [];
      for (var fi = 0; fi < funnels.length; fi++) {
        if (byFun[funnels[fi].id]) mGroups.push({ id: funnels[fi].id, label: funnels[fi].name, items: byFun[funnels[fi].id] });
      }
      if (unas.length) mGroups.push({ id: '', label: 'Unassigned', items: unas });
      return mGroups;
    }

    if (dimKey === 'format' && groupBy === 'category') {
      var fcats = Constants.FORMAT_CATEGORIES || [];
      var byFc = {}; var unFc = [];
      for (var ji = 0; ji < items.length; ji++) {
        var c = items[ji].category;
        if (c) (byFc[c] = byFc[c] || []).push(items[ji]); else unFc.push(items[ji]);
      }
      var fGroups = [];
      for (var fci = 0; fci < fcats.length; fci++) {
        if (byFc[fcats[fci].id]) fGroups.push({ id: fcats[fci].id, label: fcats[fci].name, items: byFc[fcats[fci].id] });
      }
      if (unFc.length) fGroups.push({ id: '', label: 'Uncategorized', items: unFc });
      return fGroups;
    }

    return [{ id: '', label: '', items: items }];
  }

  function autoUpdateRecipeTitle(recipeId) {
    var recipe = getRecipe(recipeId);
    if (!recipe) return;
    // Only auto-update if title is empty or was auto-generated (contains ×)
    if (recipe.title && recipe.title.indexOf(' × ') === -1 && recipe.title !== 'New Recipe') return;
    var parts = [];
    var per = S.personaMap[recipe.persona_id]; if (per) parts.push(per.name);
    var msg = S.messageMap[recipe.message_id]; if (msg) parts.push(msg.title);
    var sty = S.styleMap[recipe.style_id]; if (sty) parts.push(sty.name);
    var vf = S.formatMap[recipe.visual_format_id]; if (vf) parts.push(vf.name);
    if (parts.length > 0) saveEntityField('recipe', recipeId, 'title', parts.join(' × '));
  }


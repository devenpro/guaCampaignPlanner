  // ============================================================
  // SECTION 11: COMPOSITION STEP RENDERER
  // ============================================================

  function renderCompositionStep(recipe) {
    var html = '<div class="cp-step-composition" data-recipe-id="' + esc(recipe.id) + '">';

    // Composition card with 4 dimensions
    html += '<div class="cp-composition-card">';
    html += '<div class="cp-section-header"><h3>' + icon('shapes') + ' Creative Composition</h3>';
    html += '<span class="cp-text-muted">The combination of dimensions that defines this creative.</span></div>';
    html += '<div class="cp-composition-grid">';

    var dims = [
      { key: 'persona', id: recipe.persona_id, field: 'persona_id' },
      { key: 'message', id: recipe.message_id, field: 'message_id' },
      { key: 'style',   id: recipe.style_id,   field: 'style_id' },
      { key: 'format',  id: recipe.visual_format_id, field: 'visual_format_id' }
    ];
    for (var di = 0; di < dims.length; di++) {
      var dim = Constants.DIMENSIONS[dims[di].key];
      var entity = getEntityForDim(dims[di].key, dims[di].id);
      var entityName = entity ? (entity.name || entity.title || '') : '(Not set)';
      var entitySub = getEntitySubtext(dims[di].key, entity);
      var isEmpty = !entity;

      html += '<div class="cp-composition-dim' + (isEmpty ? ' cp-composition-dim-empty' : '') + '" style="border-color:' + dim.color + (isEmpty ? '15' : '30') + '">';
      html += '<div class="cp-composition-dim-icon" style="background:' + dim.color + '12;color:' + dim.color + '">' + icon(dim.icon) + '</div>';
      html += '<div class="cp-composition-dim-body">';
      html += '<div class="cp-composition-dim-label" style="color:' + dim.color + '">' + esc(dim.label) + '</div>';
      html += '<div class="cp-composition-dim-name">' + esc(entityName) + '</div>';
      if (entitySub) html += '<div class="cp-composition-dim-sub">' + esc(entitySub) + '</div>';
      html += '</div>';
      html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="change-dimension" data-dim="' + dims[di].key + '" data-recipe-id="' + esc(recipe.id) + '">' + (isEmpty ? icon('plus') + ' Set' : icon('refresh') + ' Change') + '</button>';
      html += '</div>';
    }
    html += '</div></div>';

    // Media type toggle
    html += '<div class="cp-card" style="margin-top:var(--cp-space-4)">';
    html += '<div class="cp-section-header"><h3>' + icon('image') + ' Media Type</h3></div>';
    html += '<div class="cp-media-type-toggle">';
    for (var mtk in Constants.MEDIA_TYPES) {
      var mt = Constants.MEDIA_TYPES[mtk];
      var mtActive = recipe.media_type === mtk ? ' cp-media-type-active' : '';
      html += '<button class="cp-media-type-btn' + mtActive + '" data-action="set-media-type" data-type="' + mtk + '">' + icon(mt.icon) + ' ' + esc(mt.label) + '</button>';
    }
    html += '</div></div>';

    // Pain point selector
    html += renderPainPointSelector(recipe);

    // Title editor
    html += '<div class="cp-card" style="margin-top:var(--cp-space-4)">';
    html += '<div class="cp-section-header"><h3>' + icon('edit') + ' Recipe Title</h3></div>';
    html += '<input type="text" class="cp-input" data-action="save-recipe-title" value="' + esc(recipe.title || '') + '" placeholder="Recipe title...">';
    html += '</div>';

    // Priority + Campaign + Due date
    html += '<div class="cp-card" style="margin-top:var(--cp-space-4)">';
    html += '<div class="cp-section-header"><h3>' + icon('sliders') + ' Details</h3></div>';
    var camps = getAllCampaigns();
    html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">';
    // Priority
    html += '<div class="cp-form-group"><label class="cp-field-label">Priority</label>';
    html += '<select class="cp-select" data-action="save-recipe-field" data-rfield="priority">';
    for (var pk in Constants.PRIORITY_LEVELS) {
      html += '<option value="' + pk + '"' + (recipe.priority === pk ? ' selected' : '') + '>' + esc(Constants.PRIORITY_LEVELS[pk].label) + '</option>';
    }
    html += '</select></div>';
    // Campaign
    html += '<div class="cp-form-group"><label class="cp-field-label">Campaign</label>';
    html += '<select class="cp-select" data-action="save-recipe-field" data-rfield="campaign_id">';
    html += '<option value="">None</option>';
    for (var ci = 0; ci < camps.length; ci++) {
      html += '<option value="' + esc(camps[ci].id) + '"' + (recipe.campaign_id === camps[ci].id ? ' selected' : '') + '>' + esc(truncate(camps[ci].name, 25)) + '</option>';
    }
    html += '</select></div>';
    // Due date
    html += '<div class="cp-form-group"><label class="cp-field-label">Due Date</label>';
    html += '<input type="date" class="cp-input" data-action="save-recipe-field" data-rfield="due_date" value="' + esc(recipe.due_date || '') + '"></div>';
    html += '</div></div>';

    // Save as Template + Create from Template
    html += '<div class="cp-card" style="margin-top:var(--cp-space-4)">';
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

  function renderPainPointSelector(recipe) {
    var persona = S.personaMap[recipe.persona_id];
    if (!persona) return '';
    var painPoints = getPersonaPainPoints(persona);
    if (painPoints.length === 0) return '';

    var selected = recipe.selected_pain_point_ids || [];
    var html = '<div class="cp-card" style="margin-top:var(--cp-space-4)">';
    html += '<div class="cp-section-header"><h3>' + icon('bolt') + ' Pain Points to Address</h3>';
    html += '<span class="cp-text-muted">' + selected.length + ' of ' + painPoints.length + ' selected</span></div>';
    html += '<div class="cp-pain-point-picker-list">';
    for (var i = 0; i < painPoints.length; i++) {
      var pp = painPoints[i];
      var isSelected = selected.indexOf(pp.id) > -1;
      html += '<label class="cp-pain-point-picker-item' + (isSelected ? ' cp-pain-point-picker-item-selected' : '') + '">';
      html += '<input type="checkbox" data-action="toggle-recipe-pp" data-pp-id="' + esc(pp.id) + '"' + (isSelected ? ' checked' : '') + '>';
      html += '<div><div style="font-weight:600;font-size:13px">' + esc(truncate(pp.pain_point, 80)) + '</div>';
      if (pp.solution) html += '<div style="font-size:11px;color:var(--cp-success);margin-top:2px">' + icon('lightbulb') + ' ' + esc(truncate(pp.solution, 60)) + '</div>';
      html += '</div></label>';
    }
    html += '</div></div>';
    return html;
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

    var html = '<div class="cp-editor-form">';
    if (items.length === 0) {
      html += '<div class="cp-empty-state cp-empty-state--compact"><p>No ' + esc(dim.label.toLowerCase()) + 's created yet.</p>';
      html += '<button class="cp-btn cp-btn-primary cp-btn-sm" data-action="new-' + dimKey + '">' + icon('plus') + ' Create ' + esc(dim.label) + '</button></div>';
    } else {
      html += '<div class="cp-hook-radio-list">';
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var iid = item.id;
        var iname = item.name || item.title || 'Untitled';
        var isSelected = iid === currentId;
        var sub = getEntitySubtext(dimKey, item);

        html += '<label class="cp-hook-radio-item' + (isSelected ? ' cp-hook-radio-item-selected' : '') + '">';
        html += '<input type="radio" name="dim_pick" value="' + esc(iid) + '"' + (isSelected ? ' checked' : '') + ' style="margin:3px 0 0;flex-shrink:0;cursor:pointer">';
        html += '<div><div style="font-weight:600;font-size:13px">' + esc(iname) + '</div>';
        if (sub) html += '<div style="font-size:11px;color:var(--cp-text-muted);margin-top:2px">' + esc(sub) + '</div>';
        html += '</div></label>';
      }
      html += '</div>';
    }
    html += '</div>';

    openModal('Select ' + dim.label, html, {
      titleIcon: dim.icon,
      size: 'md',
      saveLabel: 'Select',
      onSave: function() {
        var selected = $('.cp-modal-body input[name="dim_pick"]:checked').val() || '';
        var fieldMap = { persona: 'persona_id', message: 'message_id', style: 'style_id', format: 'visual_format_id' };
        saveEntityField('recipe', recipeId, fieldMap[dimKey], selected);
        // Auto-update title if all 4 dimensions set
        autoUpdateRecipeTitle(recipeId);
        snapshot('Change ' + dim.label);
        closeModal();
      }
    });
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


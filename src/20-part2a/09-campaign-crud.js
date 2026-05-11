  // ============================================================
  // SECTION 9: CAMPAIGN CRUD
  // ============================================================

  function openCampaignModal(campId) {
    var isEdit = !!campId;
    var c = isEdit ? getCampaign(campId) : null;
    var objectives = Constants.CAMPAIGN_OBJECTIVES || [];
    var funnels = (S.meta.settings && S.meta.settings.funnel_stages) || [];
    var campStatuses = Constants.CAMPAIGN_STATUSES || {};

    // Pre-fill dimension selections for edit
    var selPersonas = (c && c.persona_ids) ? c.persona_ids.slice() : [];
    var selMessages = (c && c.message_ids) ? c.message_ids.slice() : [];
    var selStyles = (c && c.style_ids) ? c.style_ids.slice() : [];
    var selFormats = (c && c.format_ids) ? c.format_ids.slice() : [];

    var html = '<div class="cp-editor-form">';

    // Name + status
    html += '<div class="cp-form-row"><div class="cp-form-half">';
    html += '<label>Campaign Name *</label>';
    html += '<input type="text" class="cp-input" data-field="name" value="' + esc(c ? c.name : '') + '" placeholder="e.g., Q2 Lead Generation">';
    html += '</div><div class="cp-form-half">';
    html += '<label>Status</label>';
    html += '<select class="cp-select" data-field="status">';
    for (var sk in campStatuses) {
      var sel = (c && c.status === sk) ? ' selected' : '';
      if (!c && sk === 'planning') sel = ' selected';
      html += '<option value="' + sk + '"' + sel + '>' + esc(campStatuses[sk].label) + '</option>';
    }
    html += '</select></div></div>';

    // Description
    html += '<div class="cp-form-group"><label>Description</label>';
    html += '<textarea class="cp-textarea" data-field="description" rows="2" placeholder="Campaign description...">' + esc(c ? c.description || '' : '') + '</textarea></div>';

    // Objective + Funnel
    html += '<div class="cp-form-row"><div class="cp-form-half">';
    html += '<label>Objective</label>';
    html += '<select class="cp-select" data-field="objective">';
    html += '<option value="">Select...</option>';
    for (var oi = 0; oi < objectives.length; oi++) {
      var oSel = (c && c.objective === objectives[oi].id) ? ' selected' : '';
      html += '<option value="' + esc(objectives[oi].id) + '"' + oSel + '>' + esc(objectives[oi].name) + '</option>';
    }
    html += '</select></div><div class="cp-form-half">';
    html += '<label>Funnel Stage</label>';
    html += '<select class="cp-select" data-field="funnel_stage">';
    html += '<option value="">All stages</option>';
    for (var fi = 0; fi < funnels.length; fi++) {
      var fSel = (c && c.funnel_stage === funnels[fi].id) ? ' selected' : '';
      html += '<option value="' + esc(funnels[fi].id) + '"' + fSel + '>' + esc(funnels[fi].short || funnels[fi].name) + '</option>';
    }
    html += '</select></div></div>';

    // Date range
    html += '<div class="cp-form-row"><div class="cp-form-half">';
    html += '<label>Start Date</label>';
    html += '<input type="date" class="cp-input" data-field="date_start" value="' + esc(c ? c.date_start || '' : '') + '">';
    html += '</div><div class="cp-form-half">';
    html += '<label>End Date</label>';
    html += '<input type="date" class="cp-input" data-field="date_end" value="' + esc(c ? c.date_end || '' : '') + '">';
    html += '</div></div>';

    // Budget notes
    html += '<div class="cp-form-group"><label>Budget / Target Notes</label>';
    html += '<textarea class="cp-textarea" data-field="budget_notes" rows="2" placeholder="Budget range, target CPL, etc...">' + esc(c ? c.budget_notes || '' : '') + '</textarea></div>';

    // Dimension targeting — multi-select checkboxes
    var dims = [
      { key: 'persona_ids', label: 'Target Personas', icon: 'users', color: '#9334e9', items: getAllPersonas(), nameKey: 'name', selected: selPersonas },
      { key: 'message_ids', label: 'Messages', icon: 'comments', color: '#1a73e8', items: getAllMessages(), nameKey: 'title', selected: selMessages },
      { key: 'style_ids', label: 'Styles', icon: 'palette', color: '#e37400', items: getAllStyles(), nameKey: 'name', selected: selStyles },
      { key: 'format_ids', label: 'Formats', icon: 'clapperboard', color: '#0891b2', items: getAllFormats(), nameKey: 'name', selected: selFormats }
    ];

    html += '<div style="border-top:1px solid var(--cp-border-light);padding-top:var(--cp-space-3);margin-top:var(--cp-space-3)">';
    html += '<label style="font-weight:600;margin-bottom:var(--cp-space-2);display:block">' + icon('crosshairs') + ' Dimension Targeting</label>';
    html += '<p class="cp-text-muted" style="margin-bottom:var(--cp-space-3)">Select which dimensions this campaign will use for recipe generation.</p>';

    for (var di = 0; di < dims.length; di++) {
      var dim = dims[di];
      if (dim.items.length === 0) continue;
      html += '<div class="cp-form-group" style="margin-bottom:var(--cp-space-2)">';
      html += '<label style="color:' + dim.color + '">' + icon(dim.icon) + ' ' + esc(dim.label) + '</label>';
      html += '<div class="cp-wizard-dim-list">';
      for (var ii = 0; ii < dim.items.length; ii++) {
        var item = dim.items[ii];
        var isSel = dim.selected.indexOf(item.id) > -1;
        html += '<label class="cp-wizard-dim-chip' + (isSel ? ' cp-wizard-dim-chip-selected' : '') + '" style="' + (isSel ? 'background:' + dim.color + '12;color:' + dim.color + ';border-color:' + dim.color : '') + '">';
        html += '<input type="checkbox" class="cp-camp-dim-check" data-dim="' + dim.key + '" data-id="' + esc(item.id) + '"' + (isSel ? ' checked' : '') + ' style="display:none">';
        html += esc(item[dim.nameKey] || 'Untitled');
        html += '</label>';
      }
      html += '</div></div>';
    }
    html += '</div>';

    // AI Instructions
    html += '<div class="cp-form-group"><label>' + icon('sparkles') + ' Campaign AI Instructions</label>';
    html += '<textarea class="cp-textarea" data-field="ai_instructions" rows="2" placeholder="Special instructions for AI when generating content for this campaign...">' + esc(c ? c.ai_instructions || '' : '') + '</textarea></div>';

    // General notes
    html += '<div class="cp-form-group"><label>Notes</label>';
    html += '<textarea class="cp-textarea" data-field="notes" rows="2" placeholder="Internal notes...">' + esc(c ? c.notes || '' : '') + '</textarea></div>';

    html += '</div>';

    openModal(isEdit ? 'Edit Campaign' : 'New Campaign', html, {
      titleIcon: 'bullhorn',
      size: 'lg',
      saveLabel: isEdit ? 'Save Campaign' : 'Create Campaign',
      onSave: function() {
        var fields = collectModalFields();
        if (!fields.name || !fields.name.trim()) { toast('Campaign name is required', 'warning'); return; }

        // Collect dimension selections from checkboxes
        var dimData = { persona_ids: [], message_ids: [], style_ids: [], format_ids: [] };
        $('.cp-camp-dim-check:checked').each(function() {
          var dimKey = $(this).data('dim');
          var itemId = $(this).data('id');
          if (dimData[dimKey] && itemId) dimData[dimKey].push(itemId);
        });

        if (isEdit) {
          saveEntityField('campaign', campId, 'name', fields.name.trim());
          saveEntityField('campaign', campId, 'description', fields.description || '');
          saveEntityField('campaign', campId, 'objective', fields.objective || '');
          snapshot('Edit campaign');
          saveEntityField('campaign', campId, 'funnel_stage', fields.funnel_stage || '');
          saveEntityField('campaign', campId, 'date_start', fields.date_start || '');
          saveEntityField('campaign', campId, 'date_end', fields.date_end || '');
          saveEntityField('campaign', campId, 'status', fields.status || 'planning');
          saveEntityField('campaign', campId, 'budget_notes', fields.budget_notes || '');
          saveEntityField('campaign', campId, 'ai_instructions', fields.ai_instructions || '');
          saveEntityField('campaign', campId, 'notes', fields.notes || '');
          saveEntityField('campaign', campId, 'persona_ids', dimData.persona_ids);
          saveEntityField('campaign', campId, 'message_ids', dimData.message_ids);
          saveEntityField('campaign', campId, 'style_ids', dimData.style_ids);
          saveEntityField('campaign', campId, 'format_ids', dimData.format_ids);
        } else {
          createEntity('campaign', {
            name: fields.name.trim(), description: fields.description || '',
            objective: fields.objective || '', funnel_stage: fields.funnel_stage || '',
            date_start: fields.date_start || '', date_end: fields.date_end || '',
            status: fields.status || 'planning', budget_notes: fields.budget_notes || '',
            ai_instructions: fields.ai_instructions || '', notes: fields.notes || '',
            persona_ids: dimData.persona_ids, message_ids: dimData.message_ids,
            style_ids: dimData.style_ids, format_ids: dimData.format_ids
          });
          snapshot('Create campaign');
        }
        closeModal();
      }
    });
  }

  function confirmDeleteCampaign(campId) {
    var c = getCampaign(campId);
    if (!c) return;
    var recipeCount = (S.data.recipes || []).filter(function(r) { return r.campaign_id === campId; }).length;
    openConfirmDialog({
      title: 'Delete Campaign',
      message: 'Delete "' + c.name + '"?' + (recipeCount > 0 ? ' ' + recipeCount + ' recipe(s) will become ungrouped.' : ''),
      confirmLabel: 'Delete', danger: true,
      onConfirm: function() { snapshot('Delete campaign'); deleteEntity('campaign', campId); }
    });
  }


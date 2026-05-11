  // ============================================================
  // SECTION 9.5: CAMPAIGN WIZARD (Multi-Step)
  // ============================================================

  var wizardState = { step: 1, data: {}, selections: { personas: [], messages: [], styles: [], formats: [] }, recipes: [], allSelected: false };

  function openCampaignWizard() {
    wizardState = {
      step: 1, data: { name: '', description: '', objective: '', funnel_stage: '', date_start: '', date_end: '', budget_notes: '', ai_instructions: '' },
      selections: { personas: [], messages: [], styles: [], formats: [] },
      recipes: [], allSelected: false
    };
    renderWizardModal();
  }

  function renderWizardModal() {
    var step = wizardState.step;
    var steps = [
      { num: 1, label: 'Basics', icon: 'clipboard-list' },
      { num: 2, label: 'Targeting', icon: 'crosshairs' },
      { num: 3, label: 'Recipes', icon: 'shuffle' },
      { num: 4, label: 'Review', icon: 'check' }
    ];

    var html = '<div class="cp-wizard">';
    // Step indicator
    html += '<div class="cp-wizard-steps">';
    for (var si = 0; si < steps.length; si++) {
      var st = steps[si];
      var cls = step === st.num ? ' cp-wizard-step-active' : (step > st.num ? ' cp-wizard-step-done' : '');
      html += '<div class="cp-wizard-step' + cls + '" data-action="wizard-go-step" data-step="' + st.num + '">';
      html += (step > st.num ? icon('circle-check') + ' ' : '') + icon(st.icon) + ' ' + esc(st.label);
      html += '</div>';
    }
    html += '</div>';

    // Body
    html += '<div class="cp-wizard-body">';
    switch(step) {
      case 1: html += renderWizardStep1(); break;
      case 2: html += renderWizardStep2(); break;
      case 3: html += renderWizardStep3(); break;
      case 4: html += renderWizardStep4(); break;
    }
    html += '</div>';

    // Footer
    html += '<div class="cp-wizard-footer">';
    if (step > 1) html += '<button class="cp-btn cp-btn-outline" data-action="wizard-prev">' + icon('arrow-left') + ' Back</button>';
    else html += '<span></span>';
    if (step < 4) html += '<button class="cp-btn cp-btn-primary" data-action="wizard-next">Next ' + icon('arrow-right') + '</button>';
    else html += '<button class="cp-btn cp-btn-ai" data-action="wizard-create">' + icon('bolt') + ' Create Campaign</button>';
    html += '</div></div>';

    openModal('Campaign Wizard', html, { titleIcon: 'wand-magic', size: 'xl', footer: false });
  }

  function renderWizardStep1() {
    var d = wizardState.data;
    var objectives = Constants.CAMPAIGN_OBJECTIVES || [];
    var funnels = (S.meta.settings && S.meta.settings.funnel_stages) || [];
    var html = '<h3 style="margin-bottom:var(--cp-space-4)">' + icon('clipboard-list') + ' Campaign Basics</h3>';
    html += '<div class="cp-form-group"><label>Campaign Name *</label>';
    html += '<input type="text" class="cp-input cp-wizard-field" data-wfield="name" value="' + esc(d.name) + '" placeholder="e.g., Q3 Creator Growth Campaign"></div>';
    html += '<div class="cp-form-group"><label>Description</label>';
    html += '<textarea class="cp-textarea cp-wizard-field" data-wfield="description" rows="2" placeholder="What is this campaign about?">' + esc(d.description) + '</textarea></div>';
    html += '<div class="cp-form-row"><div class="cp-form-third"><label>Objective</label>';
    html += '<select class="cp-select cp-wizard-field" data-wfield="objective"><option value="">Select...</option>';
    for (var oi = 0; oi < objectives.length; oi++) html += '<option value="' + esc(objectives[oi].id) + '"' + (d.objective === objectives[oi].id ? ' selected' : '') + '>' + esc(objectives[oi].name) + '</option>';
    html += '</select></div><div class="cp-form-third"><label>Start Date</label>';
    html += '<input type="date" class="cp-input cp-wizard-field" data-wfield="date_start" value="' + esc(d.date_start) + '"></div>';
    html += '<div class="cp-form-third"><label>End Date</label>';
    html += '<input type="date" class="cp-input cp-wizard-field" data-wfield="date_end" value="' + esc(d.date_end) + '"></div></div>';
    html += '<div class="cp-form-row"><div class="cp-form-half"><label>Funnel Focus</label>';
    html += '<select class="cp-select cp-wizard-field" data-wfield="funnel_stage"><option value="">All stages</option>';
    for (var fi = 0; fi < funnels.length; fi++) html += '<option value="' + esc(funnels[fi].id) + '"' + (d.funnel_stage === funnels[fi].id ? ' selected' : '') + '>' + esc(funnels[fi].name) + '</option>';
    html += '</select></div><div class="cp-form-half"><label>Budget Notes</label>';
    html += '<input type="text" class="cp-input cp-wizard-field" data-wfield="budget_notes" value="' + esc(d.budget_notes) + '" placeholder="e.g., ₹2L/month"></div></div>';
    html += '<div class="cp-form-group"><label>AI Instructions for this Campaign</label>';
    html += '<textarea class="cp-textarea cp-wizard-field" data-wfield="ai_instructions" rows="2" placeholder="Special instructions for AI when generating recipes for this campaign...">' + esc(d.ai_instructions) + '</textarea></div>';
    return html;
  }

  function renderWizardStep2() {
    var sel = wizardState.selections;
    var dims = [
      { key: 'personas', label: 'Personas', icon: 'users', color: '#9334e9', items: getAllPersonas(), nameKey: 'name' },
      { key: 'messages', label: 'Messages', icon: 'comments', color: '#1a73e8', items: getAllMessages(), nameKey: 'title' },
      { key: 'styles', label: 'Styles', icon: 'palette', color: '#e37400', items: getAllStyles(), nameKey: 'name' },
      { key: 'formats', label: 'Formats', icon: 'clapperboard', color: '#0891b2', items: getAllFormats(), nameKey: 'name' }
    ];
    var html = '<h3 style="margin-bottom:var(--cp-space-4)">' + icon('crosshairs') + ' Select Dimensions</h3>';
    html += '<p class="cp-text-muted" style="margin-bottom:var(--cp-space-4)">Choose which personas, messages, styles, and formats this campaign will use. Selected dimensions will be used for recipe generation.</p>';
    for (var di = 0; di < dims.length; di++) {
      var dim = dims[di];
      html += '<div class="cp-wizard-dim-section">';
      html += '<div class="cp-wizard-dim-header" style="color:' + dim.color + '">' + icon(dim.icon) + ' ' + esc(dim.label) + ' <span class="cp-text-muted" style="font-weight:400">(' + sel[dim.key].length + '/' + dim.items.length + ' selected)</span></div>';
      html += '<div class="cp-wizard-dim-list">';
      if (dim.items.length === 0) {
        html += '<span class="cp-text-muted">No ' + dim.label.toLowerCase() + ' in library. <a href="#" data-action="close-modal" style="color:var(--cp-primary)">Create some first.</a></span>';
      } else {
        for (var ii = 0; ii < dim.items.length; ii++) {
          var item = dim.items[ii];
          var isSel = sel[dim.key].indexOf(item.id) > -1;
          html += '<label class="cp-wizard-dim-chip' + (isSel ? ' cp-wizard-dim-chip-selected' : '') + '" style="' + (isSel ? 'background:' + dim.color + '12;color:' + dim.color + ';border-color:' + dim.color : '') + '">';
          html += '<input type="checkbox" data-action="wizard-toggle-dim" data-dim="' + dim.key + '" data-id="' + esc(item.id) + '"' + (isSel ? ' checked' : '') + ' style="display:none">';
          html += esc(item[dim.nameKey] || item.name || item.title || 'Untitled');
          html += '</label>';
        }
      }
      html += '</div></div>';
    }
    return html;
  }

  function renderWizardStep3() {
    var sel = wizardState.selections;
    var personas = sel.personas.length > 0 ? sel.personas : [''];
    var messages = sel.messages.length > 0 ? sel.messages : [''];
    var styles = sel.styles.length > 0 ? sel.styles : [''];
    var formats = sel.formats.length > 0 ? sel.formats : [''];
    var totalCombos = Math.max(1, personas.length) * Math.max(1, messages.length) * Math.max(1, styles.length) * Math.max(1, formats.length);
    var hasSel = sel.personas.length + sel.messages.length + sel.styles.length + sel.formats.length > 0;

    var html = '<h3 style="margin-bottom:var(--cp-space-3)">' + icon('shuffle') + ' Recipe Combinations</h3>';

    if (!hasSel) {
      html += '<div class="cp-empty-state cp-empty-state--compact"><p>Go back to Step 2 and select dimensions to generate recipe combinations.</p></div>';
      return html;
    }

    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--cp-space-4)">';
    html += '<p class="cp-text-muted">' + totalCombos + ' possible combination' + (totalCombos !== 1 ? 's' : '') + '. Select which ones to create.</p>';
    html += '<div style="display:flex;gap:var(--cp-space-2)">';
    html += '<button class="cp-btn cp-btn-ai cp-btn-sm" data-action="wizard-ai-suggest">' + icon('sparkles') + ' AI Suggest Best</button>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="wizard-select-all">' + (wizardState.allSelected ? 'Deselect All' : 'Select All') + '</button>';
    html += '</div></div>';

    // Generate recipe preview cards — preserve prior selections
    var prevSelections = {};
    for (var ps = 0; ps < wizardState.recipes.length; ps++) {
      var pr = wizardState.recipes[ps];
      prevSelections[pr.persona_id + '|' + pr.message_id + '|' + pr.style_id + '|' + pr.visual_format_id] = pr.selected;
    }
    var hadPrevRecipes = wizardState.recipes.length > 0;
    wizardState.recipes = [];
    var idx = 0;
    for (var pi = 0; pi < personas.length; pi++) {
      for (var mi = 0; mi < messages.length; mi++) {
        for (var si = 0; si < styles.length; si++) {
          for (var fi = 0; fi < formats.length; fi++) {
            if (idx >= 50) break; // Cap at 50 preview cards
            var pName = personas[pi] ? (S.personaMap[personas[pi]] || {}).name || '?' : '—';
            var mName = messages[mi] ? (S.messageMap[messages[mi]] || {}).title || '?' : '—';
            var sName = styles[si] ? (S.styleMap[styles[si]] || {}).name || '?' : '—';
            var fName = formats[fi] ? (S.formatMap[formats[fi]] || {}).name || '?' : '—';
            var comboKey = personas[pi] + '|' + messages[mi] + '|' + styles[si] + '|' + formats[fi];
            var isSelected = hadPrevRecipes ? (prevSelections[comboKey] !== undefined ? prevSelections[comboKey] : wizardState.allSelected || false) : (wizardState.allSelected || false);
            wizardState.recipes.push({
              idx: idx, persona_id: personas[pi], message_id: messages[mi],
              style_id: styles[si], visual_format_id: formats[fi],
              title: pName + ' × ' + mName + ' × ' + sName + ' × ' + fName,
              selected: isSelected
            });
            idx++;
          }
        }
      }
    }

    html += '<div class="cp-wizard-recipe-preview">';
    for (var ri = 0; ri < wizardState.recipes.length; ri++) {
      var r = wizardState.recipes[ri];
      html += '<div class="cp-wizard-recipe-card' + (r.selected ? ' cp-wizard-recipe-card-selected' : '') + '" data-action="wizard-toggle-recipe" data-ridx="' + ri + '">';
      html += '<div style="font-weight:600;font-size:12px;margin-bottom:6px">#' + (ri + 1) + '</div>';
      if (r.persona_id) html += '<div>' + dimensionBadge('persona', (S.personaMap[r.persona_id] || {}).name || '?') + '</div>';
      if (r.message_id) html += '<div>' + dimensionBadge('message', (S.messageMap[r.message_id] || {}).title || '?') + '</div>';
      if (r.style_id) html += '<div>' + dimensionBadge('style', (S.styleMap[r.style_id] || {}).name || '?') + '</div>';
      if (r.visual_format_id) html += '<div>' + dimensionBadge('format', (S.formatMap[r.visual_format_id] || {}).name || '?') + '</div>';
      html += '</div>';
    }
    html += '</div>';

    var selCount = wizardState.recipes.filter(function(r) { return r.selected; }).length;
    html += '<div style="margin-top:var(--cp-space-3)"><strong>' + selCount + '</strong> recipe' + (selCount !== 1 ? 's' : '') + ' selected for creation</div>';
    return html;
  }

  function renderWizardStep4() {
    var d = wizardState.data;
    var sel = wizardState.selections;
    var selRecipes = wizardState.recipes.filter(function(r) { return r.selected; });
    var objective = (Constants.CAMPAIGN_OBJECTIVES || []).find(function(o) { return o.id === d.objective; });

    var html = '<h3 style="margin-bottom:var(--cp-space-4)">' + icon('check') + ' Review & Create</h3>';
    html += '<div class="cp-card" style="margin-bottom:var(--cp-space-4)">';
    html += '<div class="cp-section-header"><h3>' + icon('bullhorn') + ' Campaign Summary</h3></div>';
    html += '<div class="cp-detail-grid cp-detail-grid-2">';
    html += '<div class="cp-detail-field"><div class="cp-detail-label">Name</div><div class="cp-detail-value">' + esc(d.name || 'Untitled') + '</div></div>';
    if (objective) html += '<div class="cp-detail-field"><div class="cp-detail-label">Objective</div><div class="cp-detail-value">' + icon(objective.icon) + ' ' + esc(objective.name) + '</div></div>';
    if (d.date_start || d.date_end) html += '<div class="cp-detail-field"><div class="cp-detail-label">Dates</div><div class="cp-detail-value">' + esc(d.date_start || '?') + ' → ' + esc(d.date_end || '?') + '</div></div>';
    if (d.budget_notes) html += '<div class="cp-detail-field"><div class="cp-detail-label">Budget</div><div class="cp-detail-value">' + esc(d.budget_notes) + '</div></div>';
    html += '<div class="cp-detail-field"><div class="cp-detail-label">Dimensions</div><div class="cp-detail-value">';
    html += sel.personas.length + ' personas · ' + sel.messages.length + ' messages · ' + sel.styles.length + ' styles · ' + sel.formats.length + ' formats';
    html += '</div></div>';
    html += '<div class="cp-detail-field"><div class="cp-detail-label">Recipes to Create</div><div class="cp-detail-value" style="font-size:var(--cp-font-size-xl);font-weight:700;color:var(--cp-primary)">' + selRecipes.length + '</div></div>';
    html += '</div></div>';

    if (d.description) {
      html += '<div class="cp-card" style="margin-bottom:var(--cp-space-4)"><div class="cp-section-header"><h3>Description</h3></div>';
      html += '<p>' + esc(d.description) + '</p></div>';
    }

    if (selRecipes.length > 0) {
      html += '<div class="cp-card"><div class="cp-section-header"><h3>' + icon('shuffle') + ' Recipes (' + selRecipes.length + ')</h3></div>';
      for (var ri = 0; ri < Math.min(selRecipes.length, 15); ri++) {
        html += '<div style="padding:4px 0;border-bottom:1px solid var(--cp-border-light);font-size:var(--cp-font-size-sm)">' + esc(selRecipes[ri].title) + '</div>';
      }
      if (selRecipes.length > 15) html += '<p class="cp-text-muted" style="margin-top:4px">...and ' + (selRecipes.length - 15) + ' more</p>';
      html += '</div>';
    }
    return html;
  }

  function collectWizardFields() {
    $('.cp-wizard-field').each(function() {
      var key = $(this).data('wfield');
      if (key) wizardState.data[key] = $(this).is(':checkbox') ? $(this).is(':checked') : $(this).val() || '';
    });
  }

  function executeWizardCreate() {
    collectWizardFields();
    var d = wizardState.data;
    if (!d.name || !d.name.trim()) { toast('Campaign name is required', 'warning'); return; }

    snapshot('Campaign wizard');
    var camp = createEntity('campaign', {
      name: d.name.trim(), description: d.description || '',
      objective: d.objective || '', funnel_stage: d.funnel_stage || '',
      date_start: d.date_start || '', date_end: d.date_end || '',
      budget_notes: d.budget_notes || '', ai_instructions: d.ai_instructions || '',
      persona_ids: wizardState.selections.personas.slice(),
      message_ids: wizardState.selections.messages.slice(),
      style_ids: wizardState.selections.styles.slice(),
      format_ids: wizardState.selections.formats.slice()
    });

    if (!camp) { toast('Failed to create campaign', 'error'); return; }

    // Create selected recipes
    var selRecipes = wizardState.recipes.filter(function(r) { return r.selected; });
    for (var i = 0; i < selRecipes.length; i++) {
      var sr = selRecipes[i];
      createEntity('recipe', {
        persona_id: sr.persona_id || '', message_id: sr.message_id || '',
        style_id: sr.style_id || '', visual_format_id: sr.visual_format_id || '',
        campaign_id: camp.id
      });
    }

    logActivity('campaign_created', 'campaign', camp.id, camp.name, 'Campaign wizard: created with ' + selRecipes.length + ' recipes');
    S.selectedCampaignId = camp.id;
    closeModal();
    navigate('campaigns');
    toast('Campaign "' + d.name + '" created with ' + selRecipes.length + ' recipes', 'success', 5000);
  }


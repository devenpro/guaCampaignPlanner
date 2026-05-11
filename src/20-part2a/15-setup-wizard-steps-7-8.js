  // ------------------------------------------------------------------
  // SECTION 9.4d: SETUP WIZARD — STEP RENDERERS (Phase 5: Steps 7 & 8)
  // ------------------------------------------------------------------

  // --- Step 7: Campaign Setup + Recipe Combos ---

  function renderSWStep7() {
    var ws     = setupWizardState;
    var cam    = ws.campaign || {};
    var combos = ws.combos   || [];

    var html = _buildSWStepHeader(
      'Campaign Setup',
      'Name your campaign, set dates, and choose which persona-message-style combinations to build as ad recipes.',
      'c'
    );

    // --- Campaign form ---
    html += '<div class="cp-sw-form">';

    html += '<div class="cp-field">';
    html += '<label class="cp-field-label">Campaign Name <span class="cp-required">*</span></label>';
    html += '<input type="text" class="cp-input" data-sw-field="campaign.name"';
    html += ' placeholder="e.g., Q3 Growth Campaign" value="' + esc(cam.name || '') + '" autocomplete="off">';
    html += '</div>';

    html += '<div class="cp-sw-field-row">';
    html += '<div class="cp-field">';
    html += '<label class="cp-field-label">Start Date</label>';
    html += '<input type="date" class="cp-input" data-sw-field="campaign.date_start"';
    html += ' value="' + esc(cam.date_start || '') + '">';
    html += '</div>';
    html += '<div class="cp-field">';
    html += '<label class="cp-field-label">End Date</label>';
    html += '<input type="date" class="cp-input" data-sw-field="campaign.date_end"';
    html += ' value="' + esc(cam.date_end || '') + '">';
    html += '</div>';
    html += '</div>';

    html += '<div class="cp-field">';
    html += '<label class="cp-field-label">Budget Notes</label>';
    html += '<input type="text" class="cp-input" data-sw-field="campaign.budget_notes"';
    html += ' placeholder="e.g., $5,000/month" value="' + esc(cam.budget_notes || '') + '">';
    html += '</div>';

    html += '</div>'; // end .cp-sw-form

    // --- Recipe combos section ---
    var selCount = combos.filter(function(c) { return c.selected; }).length;

    html += _buildSWSubSection('Ad Recipe Combinations', selCount, combos.length);

    if (!combos.length) {
      html += '<div class="cp-sw-empty-state">';
      html += '<div class="cp-sw-empty-icon">' + icon('shuffle') + '</div>';
      html += '<p>No combinations could be generated. Go back to earlier steps and select at least one persona and one message.</p>';
      html += '</div>';
    } else {
      html += '<div class="cp-sw-card-bottom">';
      html += '<span class="cp-sw-sel-count' + (selCount > 0 ? ' cp-sw-sel-count--ok' : '') + '">';
      html += selCount + ' of ' + combos.length + ' combo' + (combos.length !== 1 ? 's' : '') + ' selected';
      html += '</span>';
      html += '<button class="cp-btn cp-btn-sm cp-btn-outline" data-action="sw-regen-combos">';
      html += icon('refresh-cw') + ' Regenerate';
      html += '</button>';
      html += '</div>';

      html += '<div class="cp-sw-card-grid">';
      for (var i = 0; i < combos.length; i++) {
        html += _buildSWComboCard(combos[i], i);
      }
      html += '</div>';
    }

    return html;
  }

  function _buildSWComboCard(combo, idx) {
    var selected = combo.selected;
    var html = '<div class="cp-sw-combo-card' + (selected ? ' cp-sw-combo-card--selected' : '') + '" data-action="sw-combo-toggle" data-idx="' + idx + '" role="button" tabindex="0" aria-pressed="' + (selected ? 'true' : 'false') + '">';
    html += '<div class="cp-sw-combo-card-header">';
    html += '<div class="cp-sw-combo-card-check">' + (selected ? icon('check') : '') + '</div>';
    html += '<div class="cp-sw-combo-card-title">Recipe ' + (idx + 1) + '</div>';
    html += '</div>';
    html += '<div class="cp-sw-combo-parts">';
    if (combo.persona) html += _swComboPart('Persona', combo.persona.name  || 'Persona');
    if (combo.message) html += _swComboPart('Message', combo.message.name  || 'Message');
    if (combo.style)   html += _swComboPart('Style',   combo.style.name    || 'Style');
    if (combo.format)  html += _swComboPart('Format',  combo.format.name   || 'Format');
    html += '</div>';
    html += '</div>';
    return html;
  }

  function _swComboPart(label, value) {
    var html = '<div class="cp-sw-combo-part">';
    html += '<span class="cp-sw-combo-part-label">' + esc(label) + '</span>';
    html += '<span class="cp-sw-combo-part-value">' + esc(truncate(value, 60)) + '</span>';
    html += '</div>';
    return html;
  }

  // --- Step 8: Review & Launch ---

  function renderSWStep8() {
    var ws         = setupWizardState;
    var selPersonas = (ws.personas    || []).filter(function(p) { return p._selected; });
    var selPPs      = (ws.pain_points  || []).filter(function(p) { return p._selected; });
    var selMessages = (ws.messages    || []).filter(function(m) { return m._selected; });
    var selStyles   = (ws.styles      || []).filter(function(s) { return s._selected; });
    var selFormats  = (ws.formats     || []).filter(function(f) { return f._selected; });
    var selCombos   = (ws.combos      || []).filter(function(c) { return c.selected; });

    var html = _buildSWStepHeader(
      'Review &amp; Launch',
      'Everything looks good! Review your selections below then launch to build your workspace.',
      'c'
    );

    // Finalizing progress state
    if (ws.finalizing) {
      html += '<div class="cp-sw-finalize-progress">';
      html += '<div class="cp-sw-finalize-spinner">' + icon('loader') + '</div>';
      html += '<p class="cp-sw-finalize-msg">' + esc(ws.finalizeMsg || 'Setting up your workspace…') + '</p>';
      html += '</div>';
      return html;
    }

    // Summary stats grid
    html += '<div class="cp-sw-review-grid">';
    html += _buildSWReviewBox('users',         'Personas',    selPersonas.length,  selPersonas.map(function(p) { return p.name; }));
    html += _buildSWReviewBox('crosshair',     'Pain Points', selPPs.length,       selPPs.map(function(p) { return p.pain_point; }));
    html += _buildSWReviewBox('message-square','Messages',    selMessages.length,  selMessages.map(function(m) { return m.name; }));
    html += _buildSWReviewBox('palette',       'Styles',      selStyles.length,    selStyles.map(function(s) { return s.name; }));
    html += _buildSWReviewBox('clapperboard',  'Formats',     selFormats.length,   selFormats.map(function(f) { return f.name; }));
    html += _buildSWReviewBox('shuffle',       'Recipes',     selCombos.length,    selCombos.map(function(c, i) { return 'Recipe ' + (i + 1); }));
    html += '</div>';

    // Campaign info box (if campaign name set)
    var cam = ws.campaign || {};
    if (cam.name) {
      html += '<div class="cp-sw-info-box cp-sw-info-box--success" style="margin-top:var(--cp-space-4)">';
      html += icon('briefcase') + ' Campaign: <strong>' + esc(cam.name) + '</strong>';
      if (cam.date_start && cam.date_end) {
        html += ' &nbsp;&middot;&nbsp; ' + esc(cam.date_start) + ' &rarr; ' + esc(cam.date_end);
      }
      if (cam.budget_notes) {
        html += ' &nbsp;&middot;&nbsp; ' + esc(cam.budget_notes);
      }
      html += '</div>';
    }

    // Launch note (button is in the footer)
    html += '<p class="cp-sw-finalize-note" style="margin-top:var(--cp-space-5);text-align:center">';
    html += 'Hit <strong>Launch Workspace</strong> below to create ' + selCombos.length + ' ad recipe' + (selCombos.length !== 1 ? 's' : '') + ' and start your campaign.';
    html += '</p>';

    return html;
  }

  function _buildSWReviewBox(iconName, label, count, names) {
    var html = '<div class="cp-sw-review-box">';
    html += '<div class="cp-sw-review-box-icon">' + icon(iconName) + '</div>';
    html += '<div class="cp-sw-review-box-count">' + count + '</div>';
    html += '<div class="cp-sw-review-box-label">' + esc(label) + '</div>';
    if (names && names.length) {
      html += '<div class="cp-sw-review-box-names">';
      var show = names.slice(0, 3);
      for (var i = 0; i < show.length; i++) {
        html += '<span>' + esc(truncate(show[i] || '', 30)) + '</span>';
      }
      if (names.length > 3) html += '<span>+' + (names.length - 3) + ' more</span>';
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

